import * as Promise from 'bluebird'

import UserService from '../../services/UserService'
import {sanitizeUserAttributes, formatRecord} from '../../helpers/tools'
import {OK, UNPROCESSABLE_ENTITY} from '../../constants/statusCodes'

const users = {
  index: (req, res) => {
    const data = new UserService({currentUser: req.decoded})

    Promise.try(() => data.fetchUsers())
      .then(users => {
        if (Array.isArray(users))
          res.status(OK).send({data: users, message: null, success: true})
        else
          res.status(OK).send({data: [users], message: null, success: true})
      }).catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request', success: false}))
  },
  updateUserConfig: (req, res) => {
    const data = new UserService({currentUser: req.decoded})

    Promise.try(() => data.updateUserConfig({userId: req.params.id, payload: req.body}))
      .then(userConfig => res.status(OK).send({data: userConfig, message: 'User config updated successfully', success: true}))
      .catch(err => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: err.message, success: false}))
  },
  update: (req, res) => {
    const data = new UserService({currentUser: req.decoded})

    Promise.try(() => data.updateUser({id: req.params.id, payload: req.body}))
      .then(user => res.status(OK).send({data: sanitizeUserAttributes(formatRecord(user)), message: 'User data updated', success: true}))
      .catch(err => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: err.message, success: false}))
  }
}

export default users
