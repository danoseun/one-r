import DataService from './DataService'
import db from '../../db/models'
import {constructNewConversation, constructNewMessage} from '../helpers/conversationTools'

class ConversationService extends DataService {
  constructor(model) {
    super(model)

    this.channel = new DataService(db.Channel)
  }

  incomingMessage(payload) {
    return this.show({customer: {phone: {$eq: payload.from}}}).then(conversation => {
      const newMessage = constructNewMessage(payload)

      if (conversation)
        return this.handleExistingConversation(conversation, newMessage)
      else
        return this.handleNewConversation(payload, newMessage)
    })
  }

  createMessage(conversation, message) { return conversation.createMessage(message) }

  handleExistingConversation(conversation, message) {
    if (conversation.customer.name) {
      return this.createMessage(conversation, message)
    } else {
      return conversation.update({customer: {...conversation.customer, name: message.sender.name}})
        .then(data => this.createMessage(data, message))
    }
  }

  handleNewConversation(payload, formattedMessage) {
    return this.channel.show({phone: payload.to})
      .then(channel => this.addResource({...constructNewConversation(payload), channel_id: channel.id, firm_id: channel.firm_id}))
      .then(conversation => this.createMessage(conversation, formattedMessage))
  }

  channelMessage(payload) {
    return this.channel.show({phone: payload.from})
      .then(channel => this.addResource({
        customer: {
          phone: payload.to,
          lastActivity: (new Date(Date.now()).toISOString())
        },
        channel_id: channel.id,
        firm_id: channel.firm_id
      })).then(conversation => this.createMessage(conversation, payload.message))
  }

  replyMessage(payload, conversationId) {
    return this.show({id: conversationId}).then(conversation => this.createMessage(conversation, payload))
  }

  allConversations(currentUser) { return this.index({where: {firm_id: currentUser.firm_id}, include: db.Message}) }
}

export default ConversationService
