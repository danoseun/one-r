/* eslint-disable babel/new-cap */
import express from 'express'

import firmsController from '../controllers/firms'
import permissions from '../middlewares/permissions'
import tempalateController from '../controllers/firms/templates'

const firms = express.Router()

firms.route('/')
  .get(firmsController.index)
  .post(permissions.isAdmin, firmsController.create)

firms.route('/templates')
  .post(permissions.isManager, tempalateController.create)
  .get(permissions.isAuthenticated, tempalateController.index)

firms.route('/templates/:id')
  .patch(permissions.isManager, tempalateController.update)

export default firms
