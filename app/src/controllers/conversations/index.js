import * as Promise from 'bluebird'

import ConversationService from '../../services/ConversationService'
import db from '../../../db/models'
import {formatIncomingMessage} from '../../helpers/conversationTools'
import {CREATED, UNPROCESSABLE_ENTITY, OK} from '../../constants/statusCodes'
import sse from '../../helpers/serverSentEvent'
import {pagination, totalPage} from '../../helpers/tools'

const conversation = new ConversationService(db.Conversation)

const conversations = {
  /**
   * @todo Handle error generated from incoming messsage via some bug reporting service and wire up SSE
   */
  webhook: (req, res) => {
    Promise.try(() => conversation.incomingMessage(formatIncomingMessage(req.body)))
      .then(data => {
        sse.sseSetup.send(data, 'message', Date.now())

        res.status(CREATED).send({data: null, message: 'Incoming message received', success: true})
      }).catch(() => res.status(CREATED).send({data: null, message: 'Incoming message received', success: true}))
  },
  /**
   * @todo Wire up API calls to deliver message to customer
   */
  create: (req, res) => {
    Promise.try(() => conversation.channelMessage(req.body))
      .then(data => res.status(CREATED).send({data, message: 'Message sent', success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to send message to customer', success: true}))
  },
  index: (req, res) => {
    const {page} = req.query

    Promise.try(() => conversation.allConversations(req.decoded, pagination(page)))
      .then(({count, rows}) => res.status(OK).send({
        count,
        data: rows,
        currentPage: parseInt(page && page.number, 10) || 1,
        totalPage: totalPage(count, (page && page.size)),
        message: null,
        success: true
      }))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to fetch conversations', success: false}))
  },
  reply: (req, res) => {
    Promise.try(() => conversation.replyMessage(req.body, req.params.id))
      .then(data => res.status(OK).send({data, message: 'Message sent to customer', success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to send message to customer', success: true}))
  },
  update: (req, res) => {
    Promise.try(() => conversation.update(req.params, req.body))
      .then(data => res.status(OK).send({data, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process request', success: false}))
  }
}

export default conversations
