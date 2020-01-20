import bcrypt from 'bcrypt'

import DataService from './DataService'
import db from '../../db/models'
import {isConfirmed, tokenPayload} from '../helpers/tools'

require('dotenv').config()

class AuthService {
  constructor() {
    this.data = new DataService(db.User)
    this.options = {attributes: {exclude: ['password']}}
  }

  signIn(credentials) {
    const {email, password} = credentials

    if (email) {
      return this.data.show({email}, this.options).then(user => {
        if (user && isConfirmed(user)) {
          bcrypt.compare(password, user.password, (err, equal) => {

            if (equal) {
              return {
                tokenPayload: tokenPayload(user),
                user
              }
            } else {
              throw new Error(err)
            }
          })
        } else { throw new Error('Email and/or password is incorrect.') }
      })
    } else { throw new Error('Cannot login without email.') }
  }
}

export default AuthService
