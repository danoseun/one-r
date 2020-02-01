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
  .get(permissions.isAuthenticated, tempalateController.show)

firms.route('/:id/agents')
  .get(permissions.isFirmManager, firmsController.fetchAgents)

export default firms
