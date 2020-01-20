/* eslint-disable no-console */
import bcrypt from 'bcrypt'

import DataService from './DataService'
import db from '../../db/models'
import {isConfirmed, tokenPayload, isEmailValid, addRoleToUser, formatRecord, sanitizeUserAttributes, emailDomain} from '../helpers/tools'

require('dotenv').config()

class AuthService {
  constructor() {
    this.data = new DataService(db.User)
    this.firmConfig = new DataService(db.FirmConfig)
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

  signUp(payload, roleName) {
    const {email, firstName, lastName, password} = payload

    if (isEmailValid(email)) {
      return this.firmConfig.show({where: {domain: emailDomain(email)}}).then(async config => {
        const createPayload = {email, firstName, lastName, password}
        let user

        if (config && !roleName)
          user = await addRoleToUser(createPayload, 'manager')
        else if(roleName)
          user = await addRoleToUser(createPayload, roleName)
        else
          throw new Error('Something went wrong when trying to sign you up.')

        return this.data.create(user).then(newUser => {
          if (!roleName)
            this.createTokeAndSendEmail(newUser)

          return sanitizeUserAttributes(formatRecord(newUser))
        })
      })
    } else { throw new Error('Email is invalid.') }
  }

  /**
   * @todo send email after creating token
   * @param {*} user - create user record
   */
  createTokeAndSendEmail(user) {
    return user.createToken().then(token => {
      console.log('-'.repeat(80))
      console.log(token.value)
      console.log('-'.repeat(80))
    })
  }
}

export default AuthService
