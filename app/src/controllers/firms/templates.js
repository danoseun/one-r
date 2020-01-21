import * as Promise from 'bluebird'

import {templateData} from '../../helpers/tools'
import {CREATED, UNPROCESSABLE_ENTITY, OK, UNAUTHORIZED} from '../../constants/statusCodes'

const template = {
  create: (req, res) => {
    const data = templateData(req.decoded)

    Promise.try(() => data.addTemplate(req.body))
      .then(newTemplate => res.status(CREATED).send({data: newTemplate, message: null, success: true}))
      .catch(() => res.status(UNPROCESSABLE_ENTITY).send({
        data: null,
        message: 'Unable to complete your request at the moment, please confirm that you do not have missing required fields.',
        success: false
      }))
  },
  index: (req, res) => {
    const data = templateData(req.decoded)

    Promise.try(() => data.fetchTemplate(req.params.id))
      .then(response => res.status(OK).send({data: response, message: null, success: true}))
      .catch((err) => {
        if (err.message === 'Current User cannot view this template.')
          res.status(UNAUTHORIZED).send({data: null, message: err.message, success: false})
        else
          res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request.', success: false})
      })
  },
  update: (req, res) => {
    const data = templateData(req.decoded)

    Promise.try(() => data.updateTemplate(req.params.id, req.body))
      .then(updatedTemplate => res.status(OK).send({data: updatedTemplate, message: null, success: true}))
      .catch(err => {
        if (err.message === 'Current User cannot view this template.')
          res.status(UNAUTHORIZED).send({data: null, message: err.message, success: false})
        else
          res.status(UNPROCESSABLE_ENTITY).send({data: null, message: 'Unable to process your request.', success: false})
      })
  }
}

export default template
