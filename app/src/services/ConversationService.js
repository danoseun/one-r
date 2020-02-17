import axios from 'axios'

import {Op} from 'sequelize'
import DataService from './DataService'
import db from '../../db/models'
import {constructTemplatePayload, constructNewMessage, constructNewConversation, constructFreeFormPayload} from '../helpers/conversationTools'

class ConversationService extends DataService {
  constructor(model) {
    super(model)

    this.channel = new DataService(db.Channel)
    this.authorizationType = process.env.NODE_ENV === 'production' ? 'App' : 'Basic'
  }

  incomingMessage(payload) {
    return this.show({customer: {phone: {[Op.eq]: payload.from}}}).then(conversation => {
      const newMessage = constructNewMessage(payload)

      if (conversation)
        return this.handleExistingConversation(conversation, newMessage)
      else
        return this.handleNewConversation(payload, newMessage)
    })
  }

  createMessage(conversation, message, isCreated = false) {
    if (isCreated)
      return conversation.createMessage(message).then(message => ({message, isCreated, conversation}))

    return conversation.createMessage(message)
  }

  handleExistingConversation(conversation, message) {
    if (conversation.customer.name) {
      return this.createMessage(conversation, message)
    } else {
      return conversation.update({customer: {...conversation.customer, name: message.sender.name}})
        .then(data => this.createMessage(data, message))
    }
  }

  handleNewConversation(payload, formattedMessage) {
    return this.channel.show({phone: payload.to}, {}, {[Op.and]: [{type: 'DEFAULT'}]})
      .then(channel => this.addResource({...constructNewConversation(payload), channel_id: channel.id, firm_id: channel.firm_id}))
      .then(conversation => this.createMessage(conversation, formattedMessage, true))
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
        axios.post(
          `${process.env.INFOBIP_BASE_URL}/omni/1/advanced`,
          constructTemplatePayload(payload.template.infobip),
          {headers: {authorization: `${this.authorizationType} ${process.env.INFOBIP_API_KEY}`}}
        )

        return this.createMessage(conversation, payload.template.formatted, true)
      })
  }

  replyMessage(payload, conversationId) {
    const message = payload.message || payload.template.formatted

    if (payload.template) {
      axios.post(
        `${process.env.INFOBIP_BASE_URL}/omni/1/advanced`,
        constructTemplatePayload(payload.template.infobip),
        {headers: {authorization: `${this.authorizationType} ${process.env.INFOBIP_API_KEY}`}}
      )
    } else {
      axios.post(
        `${process.env.INFOBIP_BASE_URL}/omni/1/advanced`,
        constructFreeFormPayload({phoneNumber: payload.phone, ...message}),
        {headers: {authorization: `${this.authorizationType} ${process.env.INFOBIP_API_KEY}`}}
      )
    }

    return this.show({id: conversationId}).then(conversation => this.createMessage(conversation, message))
  }

  allConversations(currentUser) { return this.index({where: {firm_id: currentUser.firm_id}, include: db.Message}) }
}

export default ConversationService
