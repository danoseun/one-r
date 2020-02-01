import DataService from './DataService'
import db from '../../db/models'
import {isAdmin, sanitizeUserAttributes, formatRecord} from '../helpers/tools'

class UserService extends DataService {
  constructor({model = db.User, currentUser = {}}) {
    super(model)

    this.currentUser = currentUser
  }

  async fetchUsers() {
    if (await isAdmin(this.currentUser.role_id))
      return this.index().then(users => users.map(user => sanitizeUserAttributes(formatRecord(user))))
    else
      return this.show({id: this.currentUser.id}).then(user => sanitizeUserAttributes(formatRecord(user)))
  }
}

export default UserService
