import jwt from 'jsonwebtoken'

require('dotenv').config()

const secret = process.env.SECRET

export const generateJWTToken = data => jwt.sign(data, secret, {expiresIn: '24h'})
