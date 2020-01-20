import bodyParser from 'body-parser'
import compression from 'compression'
import express from 'express'
import morgan from 'morgan'

import auth from './routes/auth'

const app = express()

// Express application configuration
app.use(bodyParser.json({limit: '5mb'}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(compression())
app.use(morgan('tiny'))
app.disable('x-powered-by')

// API routes here
app.use('/api/auth', auth)

// Setup catch-all API catch-all route
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to WhatsApp Support API'
}))

export default app
