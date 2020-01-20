import * as Promise from 'bluebird'

import AuthService from '../../services/AuthService'
import {secureRandom} from '../../helpers/tools'
import {setToRedis} from '../../helpers/redis'

import {OK, UNPROCESSABLE_ENTITY, UNAUTHORIZED, CREATED} from '../../constants/statusCodes'

const authentication = new AuthService()

const auth = {
  signIn: (req, res) => {
    Promise.try(() => authentication.signIn(req.body)).then(({token, user}) => {
      const redisToken = secureRandom(8)

      setToRedis(redisToken, token)

      res.status(OK).send({data: {token: redisToken, user}, message: null, success: true})
    }).catch(err => {
      if (err.message === 'Cannot login without email.')
        res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Please provide an email', success: false})
      else
        res.status(UNAUTHORIZED).send({data: null, message: 'Email and/or password is incorrect.', success: false})
    })
  },
  signUp: (req, res) => {
    Promise.try(() => authentication.signUp(req.body, req.query.role))
      .then(data => res.status(CREATED).send({data, message: 'Account successfully created.', success: true}))
      .catch(() => {
        res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Something went wrong while trying to create your account', success: false})
      })
  },
  confirmation: (req, res) => {
    Promise.try(() => authentication.confirmAccount(req.body))
      .then(({token, user}) => {
        const redisToken = secureRandom(8)

        setToRedis(redisToken, token)

        res.status(OK).send({data: {token: redisToken, user}, message: null, success: true})
      }).catch(err => {

        if (err.message === 'Expired token.')
          res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Token expired, please request a new confirmation token', success: false})
        else
          res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to confirm your account', success: false})
      })
  }
}

export default auth
