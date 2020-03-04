import axios from 'axios'

import {Op} from 'sequelize'
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

class ConversationService extends DataService {
  constructor(model) {
    super(model)

    this.channel = new DataService(db.Channel)
    this.authorizationType = (process.env.NODE_ENV === 'production' && process.env.SERVER_HOST !== process.env.STAGING_URL) ? 'App' : 'Basic'
    this.upload = new UploadService()
  }

  incomingMessage(payload) {
    return this.show({customer: {phone: {[Op.eq]: payload.from}}}).then(conversation => {
      const newMessage = constructNewMessage(payload)

      if (conversation)
        return this.handleExistingConversation(conversation, newMessage, true)
      else
        return this.handleNewConversation(payload, newMessage, true)
    })
  }

  async createMessage({conversation, message, isCreated = false, incoming = false}) {
    const messagePayload = await this.additionalMessagePayload(message, incoming)

    if (message.content.toLowerCase().includes('c45-info'))
      this.notifyWebhook({conversationId: conversation.id, phone: conversation.customer.phone, content: message.content})

    if (isCreated)
      return conversation.createMessage(messagePayload).then(message => ({message, isCreated, conversation}))
    else
      return conversation.createMessage(messagePayload)
  }

  handleExistingConversation(conversation, message, incoming = false) {
    if (conversation.customer.name) {
      return this.createMessage({conversation, message, incoming})
    } else {
      return conversation.update({customer: {...conversation.customer, name: message.sender.name}})
        .then(data => this.createMessage({conversation: data, message, incoming}))
    }
  }

  handleNewConversation(payload, formattedMessage, incoming = false) {
    return this.channel.show({phone: payload.to}, {}, {[Op.and]: [{type: 'DEFAULT'}]})
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

  allConversations(currentUser, {limit, offset, phone}) {
    let query = {firm_id: currentUser.firm_id}

    if (phone)
      query = {...query, customer: {phone: {[Op.eq]: phone}}}

    return this.paginatedIndex({where: query, include: db.Message, distinct: true, limit, offset})
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
      {phone, sku, url, conversationID: conversationId},
      {headers: {apikey: process.env.CARS_API_KEY}}
    )
  }
}

export default ConversationService
