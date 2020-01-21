import DataService from './DataService'

class FirmService extends DataService {
  addFirm(payload) {
    const {domain = ''} = payload

    if (domain) {
      return this.addResource(payload).then(firm => {
        firm.createFirmConfig({domain})

        return firm
      })
    } else { throw new Error('Firm cannot be created without a domain')}
  }
}

export default FirmService
