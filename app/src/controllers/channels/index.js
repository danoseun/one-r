import * as Promise from 'bluebird'

import DataService from '../../services/DataService'
import db from '../../../db/models'

import {OK, UNPROCESSABLE_ENTITY, CREATED} from '../../constants/statusCodes'

const channel = new DataService(db.Channel)

const channels = {
  index: (req, res) => {
    Promise.try(() => channel.index({where: {firm_id: req.decoded.firm_id}}))
      .then(data => res.status(OK).send({data, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request', success: false}))
  },
  create: (req, res) => {
    Promise.try(() => channel.addResource({...req.body, firm_id: req.decoded.firm_id}))
      .then(data => res.status(CREATED).send({data, message: 'New channel successfully created', success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request', success: false}))
  }
}

export default channels
