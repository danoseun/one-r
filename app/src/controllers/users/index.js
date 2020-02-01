import * as Promise from 'bluebird'

import UserService from '../../services/UserService'
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
  }
}

export default users
