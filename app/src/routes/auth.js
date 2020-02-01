/* eslint-disable babel/new-cap */
import express from 'express'

import authController from '../controllers/auth/auth'

const auth = express.Router()

auth.route('/sign-in')
  .post(authController.signIn)

auth.route('/sign-up')
  .post(authController.signUp)

auth.route('/sign-out')
  .post(authController.logout)

auth.route('/confirm')
  .post(authController.confirmation)

export default auth
