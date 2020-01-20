import * as Promise from 'bluebird'

import AuthService from '../../services/AuthService'
import {secureRandom} from '../../helpers/tools'
import {setToRedis} from '../../helpers/redis'

import {OK, UNPROCESSABLE_ENTITY, UNAUTHORIZED} from '../../constants/statusCodes'

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
  }
}

export default auth
