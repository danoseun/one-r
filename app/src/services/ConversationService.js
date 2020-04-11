import axios from 'axios'
import {Op} from 'sequelize'
import qs from 'qs'
import phoneNumber from 'awesome-phonenumber'

import DataService from './DataService'
import db from '../../db/models'
import {
  constructTemplatePayload,
  constructNewMessage,
  constructNewConversation,
  constructFreeFormPayload,
  addMediaUrls
} from '../helpers/conversationTools'
import UploadService from './UploadService'
import {dateToISOString} from '../helpers/tools'

class ConversationService extends DataService {
  constructor(model) {
    super(model)

    this.channel = new DataService(db.Channel)
    this.authorizationType = (process.env.NODE_ENV === 'production' && process.env.SERVER_HOST !== process.env.STAGING_URL) ? 'App' : 'Basic'
    this.upload = new UploadService()
  }

  incomingMessage(payload) {
    return this.show({customer: {phone: {[Op.eq]: payload.from}}}, {}, {status: {[Op.in]: ['open', 'in-progress']}}).then(conversation => {
      const newMessage = constructNewMessage(payload)

      if (conversation)
        return this.handleExistingConversation(conversation, newMessage, true)
      else
        return this.handleNewConversation(payload, newMessage, true)
    })
  }

  async createMessage({conversation, message, isCreated = false, incoming = false}) {
    const messagePayload = await this.additionalMessagePayload(message, incoming)

    if (message.content && message.content.toLowerCase().includes('c45-info'))
      this.notifyWebhook({conversationId: conversation.id, phone: conversation.customer.phone, content: message.content})

    this.updateConversation(conversation)

    if (isCreated)
      return conversation.createMessage(messagePayload).then(message => ({message, isCreated, conversation}))
    else
      return conversation.createMessage(messagePayload)
  }

  updateConversation(conversation) { return conversation.update({lastMessageAt: dateToISOString(Date.now())}) }

  handleExistingConversation(conversation, message, incoming = false) {
    if (conversation.customer.name) {
      return this.createMessage({conversation, message, incoming})
    } else {
      return conversation.update({customer: {...conversation.customer, name: message.sender.name}})
        .then(data => this.createMessage({conversation: data, message, incoming}))
    }
  }

  handleNewConversation(payload, formattedMessage, incoming = false) {
    return this.handleChannel({...payload, receiver: payload.to})
      .then(channel => this.addResource({...constructNewConversation(payload), channel_id: channel.id, firm_id: channel.firm_id}))
      .then(conversation => this.createMessage({conversation, message: formattedMessage, isCreated: true, incoming}))
  }

  channelMessage(payload) {
    return this.channel.show({phone: payload.from})
      .then(channel => this.addResource({
        customer: {
          phone: payload.template.infobip.phoneNumber,
          lastActivity: (new Date(Date.now()).toISOString())
        },
        channel_id: channel.id,
        firm_id: channel.firm_id
      })).then(conversation => {
        this.conversation = conversation

        return this.sendMessageToCustomer(payload.template.infobip, 'template')
          .then(() => this.createMessage({conversation: this.conversation, message: payload.template.formatted, isCreated: true}))
      })
  }

  async replyMessage(payload, conversationId) {
    const message = payload.message || payload.template.formatted
    const {rawData, extension, ...rest} = message
    let uploaded

    if (rawData)
      uploaded = await this.upload.uploadRawImage({rawData, extension})

    const customerMessagePayload = payload.template ?
      payload.template.infobip : {phoneNumber: payload.phone, ...rest, ...(uploaded && addMediaUrls(message, uploaded))}

    const type = payload.template ? 'template' : 'free form'

    return this.sendMessageToCustomer(customerMessagePayload, type)
      .then(() => this.show({id: conversationId}).then(conversation => this.createMessage({conversation, message: customerMessagePayload})))

  }

  async allConversations(currentUser, {limit, offset, phone, date, ...rest}) {
    let query = {...rest, firm_id: currentUser.firm_id}
    const config = await db.UserConfig.findOne({where: {user_id: currentUser.id}})

    if (config && config.subscribedChannels.length)
      query = {...query, channel_id: {[Op.in]: config.subscribedChannels}}

    if (phone)
      query = {...query, customer: {phone: {[Op.eq]: phone}}}
    else if (date)
      query = {...query, lastMessageAt: {[Op.gte]: date}}

    return this.paginatedIndex({
      where: query,
      include: db.Message,
      distinct: true,
      limit,
      offset,
      order: [['lastMessageAt', 'DESC']]
    })
  }

  sendMessageToCustomer(infobipPayload, type) {
    const requestPayload = type === 'template' ? constructTemplatePayload(infobipPayload) : constructFreeFormPayload(infobipPayload)

    return axios.post(
      `${process.env.INFOBIP_BASE_URL}/omni/1/advanced`,
      requestPayload,
      {headers: {authorization: `${this.authorizationType} ${process.env.INFOBIP_API_KEY}`}}
    )
  }

  additionalMessagePayload(message, hasMedia = false) {
    const mediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT']

    if (hasMedia && mediaTypes.includes(message.contentType)) {
      return this.upload.fetchAndUpload({url: message.imageUrl || message.videoUrl || message.documentUrl, filename: `${Date.now()}`})
        .then(uploaded => ({...message, ...addMediaUrls(message, uploaded)}))
    } else { return message }
  }

  notifyWebhook({conversationId, phone, content}) {
    // eslint-disable-next-line no-unused-vars
    const [_, sku, url] = content.split('|').map(word => word.trim())

    axios.post(
      `${process.env.CARS_API_WEBHOOK_BASE_URL}/index.php?route=api/whatsapp/getImages`,
      qs.stringify({phone, sku, url, conversationID: conversationId}),
      {headers: {apikey: process.env.CARS_API_KEY, 'content-type': 'application/x-www-form-urlencoded'}}
    )
  }

  showConversation(id) { return this.show({id}, {include: db.Message}) }

  assignConversation({id, currentUser, status}) {
    return this.show({id}).then(conversation => {
      if (conversation.status === 'in-progress' && conversation.agent_id !== currentUser.id)
        throw new Error('Conversation is already assigned to another agent.')
      else
        return conversation.update({agent_id: status ? null : currentUser.id, status: status || 'in-progress'})
    })
  }

  closeConversation({id}) {
    return this.show({id}).then(conversation => {
      if (conversation.status === 'open')
        throw new Error('No agent has attended to this conversations and cannot be closed.')
      else
        return conversation.update({status: 'closed'})
    })
  }

  stats(query) {
    return this.model.count({where: query}).then(total => {
      this.total = total

      return this.model.count({where: {...query, status: 'open'}})
    }).then(open => {
      this.open = open

      return this.model.count({where: {...query, status: 'in-progress'}})
    }).then(inProgress => {
      this.inProgress = inProgress

      return this.model.count({where: {...query, status: 'closed'}})
    }).then(closed => ({closed, open: this.open, inProgress: this.inProgress, total: this.total}))
  }

  handleChannel({from, receiver}) {
    return this.channel.show({country: phoneNumber(`+${from}`).getRegionCode()}).then(countryChannel => {
      if (countryChannel)
        return countryChannel
      else
        return this.channel.show({phone: receiver}, {}, {type: 'DEFAULT'})
    })
  }
}

export default ConversationService
