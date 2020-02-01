/* eslint-disable no-console */
import bcrypt from 'bcrypt'

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
  isLoginAllowed
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

  signUp(payload, roleName) {
    const {email, firstName, lastName, password} = payload

    if (isEmailValid(email)) {
      return this.firmConfig.show({domain: emailDomain(email)}).then(async config => {
        const createPayload = {email, firstName, lastName, password}
        let user

        if (config && !roleName)
          user = await addRoleToUser(createPayload, 'manager')
        else if(roleName)
          user = await addRoleToUser(createPayload, roleName)
        else
          throw new Error('Something went wrong when trying to sign you up.')

        return this.data.create({...user, firm_id: config.firm_id}).then(([newUser]) => {
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
    return user.createToken().then(token => {
      console.log('-'.repeat(80))
      console.log(token.value)
      console.log('-'.repeat(80))
    })
  }

  confirmAccount(payload) {
    const {email = ''} = payload

    if (email) {
      // Check that admin knows the project secret before confirming their account
      if (payload.token === process.env.SECRET) {
        return this.data.show({email})
          .then(user => this.confirmUser(user))
          .then(updatedUser => ({token: generateJWTToken(tokenPayload(updatedUser)), user: updatedUser}))
      } else { throw new Error('Unable to confirm account') }
    } else {
      const tokenObject = new DataService(db.Token)

      return tokenObject.show({value: payload.token}).then(token => {
        if (token) {
          if (isConfirmationTokenActive(token)) {
            return token.getUser()
              .then(user => {
                token.destroy()

                return this.confirmUser(user)
              }).then(updatedUser => ({
                token: generateJWTToken(tokenPayload(formatRecord(updatedUser))),
                user: sanitizeUserAttributes(updatedUser)
              }))
          } else {
            token.destroy()

            throw new Error('Expired token.')
          }
        } else { throw new Error('Invalid token.') }
      })
    }
  }

  confirmUser(user) { return user.update({status: 'confirmed'}) }

  async inviteUser(payload) {
    const userData = await addRoleToUser(payload, 'agent')

    return this.data.addResource(userData).then(user => {
      this.createTokenAndSendEmail(user)

      return sanitizeUserAttributes(formatRecord(user))
    })
  }
}

export default AuthService
