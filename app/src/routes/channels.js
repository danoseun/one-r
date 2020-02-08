/* eslint-disable babel/new-cap */
import express from 'express'

import channelController from '../controllers/channels'
import permissions from '../middlewares/permissions'

const channels = express.Router()

channels.route('/')
  .get(permissions.isAuthenticated, channelController.index)
  .post(permissions.isAuthenticated, channelController.create)

export default channels
