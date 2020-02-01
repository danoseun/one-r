/* eslint-disable babel/new-cap */
import express from 'express'

import authController from '../controllers/auth/auth'
import permissions from '../middlewares/permissions'

const auth = express.Router()

auth.route('/sign-in')
  .post(authController.signIn)

auth.route('/sign-up')
  .post(authController.signUp)

auth.route('/sign-out')
  .post(authController.logout)

auth.route('/confirm')
  .post(authController.confirmation)

auth.route('/invite-agents')
  .post(permissions.isManager, authController.invite)

auth.route('/remove-agents/:id')
  .delete(permissions.isManager, authController.remove)

export default auth
