/* eslint-disable no-unused-expressions */
import {expect} from 'chai'
import sinon from 'sinon'

import AuthService from '../../app/src/services/AuthService'
import db from '../../app/db/models'
import dataGenerator from '../support/records'
import {emailDomain, dateToISOString} from '../../app/src/helpers/tools'

// initialized class
const authentication = new AuthService()

// necessary models
const Role = db.Role
const Firm = db.Firm

// setup data and whatnot
const validUser = dataGenerator(['email', 'firstName', 'lastName', 'password'])
const inValidUser = dataGenerator(['firstName', 'lastName', 'password'])
const firm = dataGenerator(['name'])
const firmConfig = {domain: emailDomain(validUser.email)}
const expiredTokenUser = {...validUser, email: `jane@${emailDomain(validUser.email)}`}

// Stubbing methods
let emailMessageObject
const emailStub = sinon.stub(authentication.email, 'delay').callsFake(() => ({sendEmail: message => {
  emailMessageObject = message

  return message
}}))

let expiredToken
let userRecord

describe('AuthService', () => {
  before(done => {
    Role.create({name: 'manager'})
      .then(() => Firm.create(firm))
      .then(newFirm => newFirm.createFirmConfig(firmConfig))
      .then(() => done())
  })

  after(() => Role.sequelize.sync({force: true}))

  afterEach(() => emailStub.resetHistory())

  describe('signUp', () => {
    context('with valid user signup', () => {
      it('signs an unconfirmed user up correctly', done => {
        authentication.signUp(validUser).then(user => {
          expect(user.status).to.equal('pending')
          expect(user.email).to.equal(validUser.email)
          expect(user.firm_id).to.equal(firmConfig.firm_id)

          done()
        }).catch(err => expect(err).to.not.exist)
      })

      it('throw an error when user from a non-existent firm domain tries to sign up', done => {
        authentication.signUp({...validUser, email: 'jane@doe.com'})
          .then(user => expect(user).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Something went wrong when trying to sign you up.')

            done()
          })
      })
    })

    context('with invalid user', () => {
      it('throws an error when email is missing', () => {
        expect(() => authentication.signUp(inValidUser)).to.throw('Email is invalid.')
      })
    })
  })

  describe('confirmAccount', () => {
    let userToken

    before(done => {
      authentication.data.show({email: validUser.email})
        .then(user => user.getTokens())
        .then(tokens => {
          userToken = tokens[0].value

          done()
        })
    })

    context('with valid confirmation token', () => {
      it('confirms user account correctly', done => {
        authentication.confirmAccount({token: userToken})
          .then(({token, user}) => {
            expect(token).to.exist
            expect(user.status).to.equal('confirmed')

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })

    context('with invalid token', () => {
      it('throws an error', done => {
        authentication.confirmAccount({token: '2v45yt77'})
          .then(({user}) => expect(user).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Invalid token.')

            done()
          })
      })
    })

    context('with expired token', () => {

      before(done => {
        authentication.signUp(expiredTokenUser)
          .then(() => authentication.data.show({email: expiredTokenUser.email}))
          .then(user => user.getTokens())
          .then(tokens => {
            expiredToken = tokens[0].value

            return db.sequelize.query(`UPDATE "Tokens" SET "createdAt" = '${dateToISOString(1330688329321)}' WHERE "value" = '${expiredToken}'`)
          }).then(() => done())
      })

      it('throws an error', done => {
        authentication.confirmAccount({token: expiredToken})
          .then(({user}) => expect(user).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Expired token.')

            done()
          })
      })
    })
  })

  describe('signIn', () => {
    context('with valid signIn details', () => {
      it('signs a confirmed user in correctly', done => {
        authentication.signIn(validUser).then(({token, user}) => {
          expect(user.email).to.equal(validUser.email)
          expect(token).to.exist

          done()
        }).catch(err => expect(err).to.not.exist)
      })
    })

    context('with inValid signIn details', () => {
      it('does not sign in a user with incorrect signin details', done => {
        authentication.signIn({...validUser, password: 'quexPa234@'})
          .then(data => expect(data).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Email and/or password is incorrect.')

            done()
          })
      })

      it('does not sign in a user without email', () => {
        expect(() => authentication.signIn(inValidUser)).to.throw('Cannot login without email.')
      })

      it('throws an error when user is unconfirmed', done => {
        authentication.signIn(expiredTokenUser)
          .then(data => expect(data).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Email and/or password is incorrect.')

            done()
          })
      })
    })
  })

  describe('createUserConfig', () => {
    before(done => {
      authentication.data.show({email: validUser.email})
        .then(fetchedUser => {
          userRecord = fetchedUser

          done()
        })
    })

    context('with no user config', () => {
      it('returns null', done => {
        authentication.createUserConfig(userRecord)
          .then(config => {
            expect(config).to.exist
            expect(config.user_id).to.equal(userRecord.id)

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })

    context('with existing user config', () => {
      before(done => {
        userRecord.getUserConfig().then(config => {
          if(!config)
            return userRecord.createUserConfig()
          return null
        }).then(() => done())
      })

      it('return null', done => {
        authentication.createUserConfig(userRecord)
          .then(config => {
            expect(config).to.not.exist
            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })
  })

  describe('confirmUser', () => {
    context('with existing user details', () => {
      it('should change the status of an existing user to confirmed', done => {
        authentication.confirmUser(userRecord, {lastName: 'Doe'}).then(user => {
          expect(user.status).to.equal('confirmed')
          expect(user.lastName).to.equal('Doe')

          done()
        }).catch(error => expect(error).to.not.exist)
      })
    })
  })

  describe('requestPasswordReset', () => {
    context('with valid user', () => {
      it('initiates user password reset', done => {
        authentication.requestPasswordReset(validUser.email)
          .then(data => {
            expect(data.firstName).to.equal(validUser.firstName)

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })

    context('with invalid user', () => {
      it('throws an error for unconfirmed', done => {
        authentication.requestPasswordReset(expiredTokenUser.email)
          .then(data => expect(data).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal('Unable to process request')

            done()
          })
      })

      it('throws and error for non-existent user', done => {
        authentication.requestPasswordReset('james@doe.com')
          .then(data => expect(data).to.not.exist)
          .catch(err => {
            expect(err.message).to.equal("Cannot read property 'status' of null")

            done()
          })
      })
    })
  })

  describe('resetPassowrd', () => {
    let resetPasswordToken

    before(done => {
      authentication.data.show({email: validUser.email})
        .then(user => user.getTokens())
        .then(tokens => {
          resetPasswordToken = tokens[0].value
          console.log('HERE', resetPasswordToken)
          done()
        })
    })

  })

  describe('createTokenAndSendEmail', () => {
    context('password reset', () => {
      it('creates token and attempts to send email', done => {
        authentication.createTokenAndSendEmail({user: userRecord, type: 'password-reset'})
          .then(() => {
            expect(emailStub.called).to.equal(true)
            expect(emailMessageObject.subject).to.equal('Cars45 Whatsapp Support Solution Account Recovery Instructions')

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })

    context('agent invitation', () => {
      it('creates token and attempts to send email', done => {
        authentication.createTokenAndSendEmail({user: userRecord, type: 'agent-invitation', currentUser: expiredTokenUser})
          .then(() => {
            expect(emailStub.called).to.equal(true)
            expect(
              emailMessageObject.subject
            ).to.equal(`${expiredTokenUser.firstName} has invited you to work together on Cars45 Whatsapp Support Solution`)

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })

    context('sign up', () => {
      it('creates token but does not attempt to send email', done => {
        authentication.createTokenAndSendEmail({user: userRecord})
          .then(() => {
            expect(emailStub.called).to.equal(false)

            done()
          }).catch(err => expect(err).to.not.exist)
      })
    })
  })
})
