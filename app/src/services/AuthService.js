/* eslint-disable no-console */
import bcrypt from 'bcrypt'
import base64 from 'base64url'

import DataService from './DataService'
import db from '../../db/models'
import EmailService from './EmailService'
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
  secureRandom,
  passwordResetUserPayload
} from '../helpers/tools'
import agentInvitationMailer from '../mailers/agentInvitationMailer'
import passwordResetMailer from '../mailers/passwordResetMailer'

require('dotenv').config()

class AuthService {
  constructor() {
    this.email = new EmailService()
    this.data = new DataService(db.User)
    this.firmConfig = new DataService(db.FirmConfig)
    this.options = {attributes: {exclude: ['password']}}
  }

  signIn(credentials) {
    const {email, password} = credentials

    if (email) {
      return this.data.show({email}, {include: db.Role}).then(user => {
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
            this.createTokenAndSendEmail({user: newUser})

          return sanitizeUserAttributes(formatRecord(newUser))
        })
      })
    } else { throw new Error('Email is invalid.') }
  }

  /**
   * @todo send email after creating token
   * @param {*} user - create user record
   */
  createTokenAndSendEmail({user, type = 'sign-up', currentUser = {}}) {
    return user.createToken({value: base64(secureRandom(4)), type: type === 'password-reset' ? 'reset' : 'confirmation'}).then(token => {
      switch(type) {
        case 'agent-invitation':
          this.email.delay(2000).sendEmail(agentInvitationMailer(currentUser.firstName, user.email, token.value))
          break
        case 'password-reset':
          this.email.delay(2000).sendEmail(passwordResetMailer(user.email, token.value))
          break
        default:
          console.log('-'.repeat(80))
          console.log(token.value)
          console.log('-'.repeat(80))
          break
      }
    })
  }

  confirmAccount(payload) {
    const {token, ...rest} = payload

    return this.fetchToken(token).then(data => {
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

  async inviteUser(payload, currentUser) {
    const {country, ...userData} = await addRoleToUser(payload, 'agent')

    return this.data.show({email: userData.email}).then(existingUser => {
      if (existingUser) {
        throw new Error('User has already been invited')
      } else {
        return this.data.addResource(userData).then(user => {
          this.createTokenAndSendEmail({user, type: 'agent-invitation', currentUser})
          user.createUserConfig({country})

          return sanitizeUserAttributes(formatRecord(user))
        })
      }
    })

  }

  resendInvitation({userId, currentUser}) {
    return this.data.show({id: userId}).then(user => {
      this.agent = user

      if (isLoginAllowed(formatRecord(user)))
        throw new Error('User account is already confirmed')
      else
        return user.getTokens()
    }).then(tokens => {
      const confirmationToken = tokens.find(token => token.type === 'confirmation')

      if (confirmationToken && isConfirmationTokenActive(confirmationToken))
        this.email.delay(2000).sendEmail(agentInvitationMailer(currentUser.firstName, this.agent.email, confirmationToken.value))
      else
        this.createTokenAndSendEmail({user: this.agent, type: 'agent-invitation', currentUser})

      return sanitizeUserAttributes(formatRecord(this.agent))
    })
  }

  requestPasswordReset(email) {
    return this.data.show({email}).then(user => {
      if (isLoginAllowed(user))
        this.createTokenAndSendEmail({user, type: 'password-reset'})
      else
        throw new Error('Unable to process request')

      return passwordResetUserPayload(formatRecord(user))
    })
  }

  fetchToken(token) {
    const tokenObject = new DataService(db.Token)

    return tokenObject.show({value: token})
  }

  resetPassowrd({token, password}) {
    return this.fetchToken(token).then(resetToken => {
      this.resetToken = resetToken

      if (resetToken && isConfirmationTokenActive(resetToken))
        return resetToken.getUser()
      else
        throw new Error('Invalid/expired token')
    }).then(user => {
      this.resetToken.destroy()

      return user.update({password})
    }).then(updatedUser => passwordResetUserPayload(formatRecord(updatedUser)))
  }
}

export default AuthService
