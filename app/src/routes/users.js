/* eslint-disable babel/new-cap */
import express from 'express'

import usersController from '../controllers/users'
import permissions from '../middlewares/permissions'

const users = express.Router()

users.route('/')
  .get(permissions.isAuthenticated, usersController.index)

export default users
