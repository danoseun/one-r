/* eslint-disable babel/new-cap */
import express from 'express'

import supportController from '../controllers/support'
import permissions from '../middlewares/permissions'

const support = express.Router()

support.route('/')
  .get(permissions.isAuthenticated, supportController.cars)

export default support
