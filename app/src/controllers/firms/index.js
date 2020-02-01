import * as Promise from 'bluebird'

import db from '../../../db/models'
import FirmService from '../../services/FirmService'

import {OK, UNPROCESSABLE_ENTITY, CREATED} from '../../constants/statusCodes'

const data = new FirmService(db.Firm)

const firms = {
  index: (req, res) => {
    Promise.try(() => data.index())
      .then(firms => res.status(OK).send({data: firms, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request', success: false}))
  },
  create: (req, res) => {
    Promise.try(() => data.addFirm(req.body))
      .then(data => res.status(CREATED).send({data, message: null, success: true}))
      .catch(err => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: err.message, success: false}))
  },
  fetchAgents: (req, res) => {
    Promise.try(() => data.fetchAgents(req.params))
      .then(agents => res.status(OK).send({data: agents, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process request', success: false}))
  }
}

export default firms
