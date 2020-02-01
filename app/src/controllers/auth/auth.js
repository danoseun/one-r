import * as Promise from 'bluebird'

import AuthService from '../../services/AuthService'
import FirmService from '../../services/FirmService'
import {secureRandom, sanitizeUserAttributes, formatRecord} from '../../helpers/tools'
import {setToRedis, removeFromRedis} from '../../helpers/redis'
import {getRedisKey} from '../../helpers/authTools'

import {OK, UNPROCESSABLE_ENTITY, UNAUTHORIZED, CREATED, ACCEPTED} from '../../constants/statusCodes'

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
  },
  logout: (req, res) => {
    try {
      const redisKey = getRedisKey(req.headers.authorization)

      removeFromRedis(redisKey)

      res.status(ACCEPTED).send({data: null, message: 'Logout processed successfully', success: true})
    } catch (err) {
      res.status(ACCEPTED).send({data: null, message: 'Logout processed successfully', success: true})
    }
  },
  invite: (req, res) => {
    Promise.try(() => authentication.inviteUser({...req.body, firm_id: req.decoded.firm_id}))
      .then(data => res.status(CREATED).send({data, message: 'Agent invited', success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({
        data: null,
        message: 'Oops! Something went wrong while adding agent',
        success: false
      }))
  },
  remove: (req, res) => {
    const data = new FirmService(null, req.decoded)

    Promise.try(() => data.disableFirmUser(req.params))
      .then(data => res.status(ACCEPTED).send({data: sanitizeUserAttributes(formatRecord(data)), message: 'Agent removed', success: true}))
      .catch(err => {
        if (err.message === 'Cannot remove user that are not in your firm.')
          res.status(UNAUTHORIZED).send({data: null, message: err.message, success: false})
        else
          res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Uanble to process your request', success: false})
      })
  }
}

export default auth
