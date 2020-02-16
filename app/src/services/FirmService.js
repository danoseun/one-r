import {Op} from 'sequelize'

import DataService from './DataService'
import db from '../../db/models'

import {sanitizeUserAttributes, formatRecord} from '../helpers/tools'

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
    return db.User.findOne({where: {id, [Op.and]: [{firm_id: this.currentUser.firm_id}]}}).then(firmUser => {
      if (firmUser)
        return firmUser.update({status: 'disabled'})
      else
        throw new Error('Cannot remove user that are not in your firm.')
    })
  }

  filterAgents(users, agentRole) {
    return users.filter(user => user.role_id === agentRole.id)
  }

  async fetchAgents({id}) {
    const agentRole = await db.Role.findOne({where: {name: 'agent'}})

    return this.show({id}).then(firm => {
      if (firm)
        return firm.getUsers().then(users => this.filterAgents(users, agentRole).map(user => sanitizeUserAttributes(formatRecord(user))))
      else
        throw new Error('Firm does not exist')
    })
  }
}

export default FirmService
