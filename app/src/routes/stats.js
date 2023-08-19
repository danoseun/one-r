/* eslint-disable babel/new-cap */
import express from 'express'

import conversations from '../controllers/conversations'

const stats = express.Router()

stats.route('/conversations')
  .get(conversations.stats)

export default stats
