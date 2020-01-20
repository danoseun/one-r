import {getRedisKey, decodeJWTToken} from '../helpers/authTools'
import {getFromRedis} from '../helpers/redis'
import {isAdmin} from '../helpers/tools'

import {UNAUTHORIZED} from '../constants/statusCodes'

const permissions = {
  isAdmin: async (req, res, next) => {
    try {
      const jwtToken = await getFromRedis(getRedisKey(req.headers.authorization))
      const user = decodeJWTToken(jwtToken)

      if (user && await isAdmin(user.role_id)) {
        req.decoded = user

        next()
      } else {
        res.status(UNAUTHORIZED).send({data: null, message: 'Current user is unauthorized', success: false})
      }
    } catch(err) { res.status(UNAUTHORIZED).send({data: null, message: 'Current user is unauthorized', success: false}) }
  },
  isAuthenticated: async (req, res, next) => {
    try {
      const jwtToken = await getFromRedis(getRedisKey(req.headers.authorization))
      const user = decodeJWTToken(jwtToken)

      if (user) {
        req.decoded = user

        next()
      } else {
        res.status(UNAUTHORIZED).send({data: null, message: 'Please login to your account.', success: false})
      }
    } catch (error) { res.status(UNAUTHORIZED).send({data: null, message: 'Please login to your account.', success: false}) }
  }
}

export default permissions
