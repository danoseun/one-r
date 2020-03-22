import * as Promise from 'bluebird'

import ConversationService from '../../services/ConversationService'
import db from '../../../db/models'
import {formatIncomingMessage} from '../../helpers/conversationTools'
import {CREATED, UNPROCESSABLE_ENTITY, OK, ACCEPTED} from '../../constants/statusCodes'
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
    const {page, phone} = req.query

    Promise.try(() => conversation.allConversations(req.decoded, {...pagination(page), phone}))
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
      .then(data => {
        const api = req.headers.origin !== process.env.WEB_HOST

        if (api)
          sse.sseSetup.send({...data, sender: {...data.sender, automated: api}}, 'message', Date.now())

        res.status(OK).send({data, message: 'Message sent to customer', success: true})
      }).catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to send message to customer', success: true}))
  },
  update: (req, res) => {
    Promise.try(() => conversation.update(req.params, req.body))
      .then(data => res.status(OK).send({data, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process request', success: false}))
  },
  show: (req, res) => {
    Promise.try(() => conversation.showConversation(req.params.id))
      .then(data => res.status(OK).send({data, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process request', success: false}))
  },
  assign: (req, res) => {
    Promise.try(() => conversation.assignConversation({...req.body, id: req.params.id, currentUser: req.decoded}))
      .then(data => res.status(OK).send({data, message: 'Conversation assigned to you.', success: true}))
      .catch(err => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: err.message, success: false}))
  },
  close: (req, res) => {
    Promise.try(() => conversation.closeConversation(req.params))
      .then(data => res.status(ACCEPTED).send({data, message: 'Conversation successfuly closed.', success: true}))
      .catch(err => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: err.message, success: false}))
  },
  stats: (req, res) => {
    Promise.try(() => conversation.stats(req.query))
      .then(data => res.status(OK).send({data, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process request', success: false}))
  }
}

export default conversations
