/* eslint-disable no-console */
import bodyParser from 'body-parser'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

import auth from './routes/auth'
import firms from './routes/firms'
import users from './routes/users'

const app = express()

if (process.env.NODE_ENV === 'development') {
  const {encodeUTF8} = require('tweetnacl-util')
  const MailDev = require('maildev')
  const proxyMiddleware = require('http-proxy-middleware')

  const smtpHost = process.env.SMTP_HOST
  const maildev = new MailDev({
    outgoingHost: smtpHost,
    outgoingUser: process.env.SMTP_USERNAME,
    outgoingPass: encodeUTF8(Uint8Array.from(process.env.SMTP_PASSWORD.split(','))),
    basePathname: '/maildev'
  })

  maildev.listen((err) => {
    if (err)
      console.log('SMTP Server could not start up')
    else
      console.log(`SMTP Server is running on port ${process.env.SMTP_PORT}`)
  })

  // proxy all maildev requests to the maildev app
  const proxy = proxyMiddleware('/maildev', {
    target: `http://localhost:${process.env.SMTP_PORT}`,
    ws: true
  })

  app.use(proxy)
}

// Express application configuration
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(compression())
app.use(morgan('tiny'))
app.disable('x-powered-by')
// use the webhost as the only origin allowed eventually
app.use(cors())

// API routes here
app.use('/api/auth', auth)
app.use('/api/firms', firms)
app.use('/api/users', users)

// Setup catch-all API catch-all route
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to WhatsApp Support API'
}))

export default app
