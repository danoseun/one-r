import * as Promise from 'bluebird'

import ConversationService from '../../services/ConversationService'
import db from '../../../db/models'
import {formatIncomingMessage} from '../../helpers/conversationTools'
import {CREATED, UNPROCESSABLE_ENTITY, OK} from '../../constants/statusCodes'
import sse from '../../helpers/serverSentEvent'

const conversation = new ConversationService(db.Conversation)

const conversations = {
  /**
   * @todo Handle error generated from incoming messsage via some bug reporting service and wire up SSE
   */
  webhook: (req, res) => {
    Promise.try(() => conversation.incomingMessage(formatIncomingMessage(req.body)))
      .then(data => {
        sse.sseSetup.send(data, 'message', Date.now())

        res.status(CREATED).send({data, message: 'Incoming message received', sucess: true})
      }).catch(() => res.status(CREATED).send({data: null, message: 'Incoming message received', sucess: true}))
  },
  /**
   * @todo Wire up API calls to deliver message to customer
   */
  create: (req, res) => {
    Promise.try(() => conversation.channelMessage(req.body))
      .then(data => res.status(CREATED).send({data, message: 'Message sent', sucess: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to send message to customer', sucess: true}))
  },
  index: (req, res) => {
    Promise.try(() => conversation.allConversations(req.decoded))
      .then(data => res.status(OK).send({data, message: null, sucess: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to fetch conversations', sucess: false}))
  },
  reply: (req, res) => {
    Promise.try(() => conversation.replyMessage(req.body, req.params.id))
      .then(data => res.status(OK).send({data, message: 'Message sent to customer', sucess: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to send message to customer', sucess: true}))
  }
}

export default conversations
