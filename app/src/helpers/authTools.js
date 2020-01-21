import jwt from 'jsonwebtoken'

require('dotenv').config()

const secret = process.env.SECRET

export const generateJWTToken = data => jwt.sign(data, secret, {expiresIn: '24h'})

export const getRedisKey = (token = '') => {
  const tokenData =  token.split(' ')[1]
  const authToken = tokenData && tokenData.split('=')[1]

  return authToken
}

export const decodeJWTToken = token => token && jwt.verify(token, secret)
