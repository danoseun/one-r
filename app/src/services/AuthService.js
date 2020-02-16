/* eslint-disable no-console */
import bcrypt from 'bcrypt'
import base64 from 'base64url'

import DataService from './DataService'
import db from '../../db/models'
import {generateJWTToken} from '../helpers/authTools'
import {
  tokenPayload,
  isEmailValid,
  addRoleToUser,
  formatRecord,
  sanitizeUserAttributes,
  emailDomain,
  isConfirmationTokenActive,
  isLoginAllowed,
  secureRandom
} from '../helpers/tools'

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
      return this.data.show({email}).then(user => {
        if (user && isLoginAllowed(user)) {
          return bcrypt.compare(password, user.password).then(response => {
            if (response)
              return {token: generateJWTToken(tokenPayload(formatRecord(user))), user: sanitizeUserAttributes(formatRecord(user))}
            else
              throw new Error('Email and/or password is incorrect.')
          })
        } else { throw new Error('Email and/or password is incorrect.') }
      })
    } else { throw new Error('Cannot login without email.') }
  }

  /**
   * @todo Only create token when account is newly created
   * @param {Object} payload - New User record
   * @param {String} roleName -  New User role
   * @returns {Promise<Object>}
   */
  signUp(payload, roleName) {
    const {email, firstName, lastName, password} = payload

    if (isEmailValid(email)) {
      return this.firmConfig.show({domain: emailDomain(email)}).then(async config => {
        const createPayload = {email, firstName, lastName, password}
        let user

        if (config)
          user = await addRoleToUser(createPayload, 'manager')
        else
          throw new Error('Something went wrong when trying to sign you up.')

        return this.data.create({...user, firm_id: config && config.firm_id}).then(([newUser]) => {
          if (!roleName)
            this.createTokenAndSendEmail(newUser)

          return sanitizeUserAttributes(formatRecord(newUser))
        })
      })
    } else { throw new Error('Email is invalid.') }
  }

  /**
   * @todo send email after creating token
   * @param {*} user - create user record
   */
  createTokenAndSendEmail(user) {
    return user.createToken({value: base64(secureRandom(4))}).then(token => {
      console.log('-'.repeat(80))
      console.log(token.value)
      console.log('-'.repeat(80))
    })
  }

  confirmAccount(payload) {
    const {token, ...rest} = payload
    const tokenObject = new DataService(db.Token)

    return tokenObject.show({value: token}).then(data => {
      if (data) {
        if (isConfirmationTokenActive(data)) {
          return data.getUser()
            .then(user => {
              data.destroy()

              return this.confirmUser(user, rest)
            }).then(updatedUser => ({
              token: generateJWTToken(tokenPayload(formatRecord(updatedUser))),
              user: sanitizeUserAttributes(updatedUser)
            }))
        } else {
          data.destroy()

          throw new Error('Expired token.')
        }
      } else { throw new Error('Invalid token.') }
    })
  }

  confirmUser(user, data = {}) { return user.update({...data, status: 'confirmed'}) }

  async inviteUser(payload) {
    const userData = await addRoleToUser(payload, 'agent')

    return this.data.addResource(userData).then(user => {
      this.createTokenAndSendEmail(user)

      return sanitizeUserAttributes(formatRecord(user))
    })
  }
}

export default AuthService
