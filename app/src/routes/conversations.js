/* eslint-disable babel/new-cap */
import express from 'express'

import conversationController from '../controllers/conversations'
import permissions from '../middlewares/permissions'

const conversations = express.Router()

conversations.route('/incoming-messages')
  .post(conversationController.webhook)

conversations.route('/channel-messages')
  .post(permissions.isAuthenticated, conversationController.create)

conversations.route('/')
  .get(permissions.isAuthenticated, conversationController.index)

conversations.route('/:id')
  .get(permissions.isAuthenticated, conversationController.show)
  .post(permissions.isAuthenticated, conversationController.reply)
  .patch(permissions.isAuthenticated, conversationController.update)

export default conversations
