import DataService from './DataService'
import db from '../../db/models'

class FirmService extends DataService {
  constructor(model, currentUser = {}) {
    super(model)

    this.currentUser = currentUser
  }

  addFirm(payload) {
    const {domain = ''} = payload

    if (domain) {
      return this.addResource(payload).then(firm => {
        firm.createFirmConfig({domain})

        return firm
      })
    } else { throw new Error('Firm cannot be created without a domain')}
  }

  disableFirmUser({id}) {
    return db.User.findOne({where: {id, firm_id: this.currentUser.firm_id}}).then(firmUser => {
      if (firmUser)
        return firmUser.update({status: 'disabled'})
      else
        throw new Error('Cannot remove user that are not in your firm.')
    })
  }
}

export default FirmService
