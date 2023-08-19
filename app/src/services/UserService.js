import DataService from './DataService'
import db from '../../db/models'
import {isAdmin, isManager, sanitizeUserAttributes, formatRecord} from '../helpers/tools'

class UserService extends DataService {
  constructor({model = db.User, currentUser = {}}) {
    super(model)

    this.currentUser = currentUser
  }

  async fetchUsers() {
    if (await isAdmin(this.currentUser.role_id))
      return this.index().then(users => users.map(user => sanitizeUserAttributes(formatRecord(user))))
    else
      return this.show({id: this.currentUser.id}, {include: db.Role}).then(user => sanitizeUserAttributes(formatRecord(user)))
  }

  isFirmMember(agent) { return this.currentUser.firm_id === agent.firm_id }

  async isAllowedToUpdateUserConfig(agent) {
    return (await isManager(this.currentUser.role_id) && this.isFirmMember(agent)) || this.currentUser.id === agent.id
  }

  // async updateUserConfig({userId, payload}) {
  //   const user = await this.show({ id: userId })
  //   this.user = user
  //   const userConfig = user.getUserConfig()
  //   if (userConfig && await this.isAllowedToUpdateUserConfig(formatRecord(this.user)))
  //     return userConfig.update(payload)

  //   else
  //     throw new Error('Unable to update user config.')
  // }

  updateUserConfig({userId, payload}) {
    return this.show({id: userId})
      .then(user => {
        this.user = user

        return user.getUserConfig()
      })
      .then(async userConfig => {
        if (userConfig && await this.isAllowedToUpdateUserConfig(formatRecord(this.user)))
          return userConfig.update(payload)
        else
          throw new Error('Unable to update user config.')
      })
  }

  async updateUser({id, payload}) {
    const user = await this.show({ id })
    if (this.isAllowedToUpdateUserConfig(user))
      return user.update(payload)

    else
      throw new Error('Unauthorized action')
  }
}

export default UserService