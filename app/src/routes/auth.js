/* eslint-disable babel/new-cap */
import express from 'express'

import authController from '../controllers/auth/auth'

const auth = express.Router()

auth.route('/sign-in')
  .post(authController.signIn)

export default auth
