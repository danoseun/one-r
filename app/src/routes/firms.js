/* eslint-disable babel/new-cap */
import express from 'express'

import firmsController from '../controllers/firms'
import permissions from '../middlewares/permissions'

const firms = express.Router()

firms.route('/')
  .get(firmsController.index)
  .post(permissions.isAdmin, firmsController.create)

export default firms
