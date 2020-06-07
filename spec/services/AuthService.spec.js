import {expect} from 'chai'

import AuthService from '../../app/src/services/AuthService'
import db from '../../app/db/models'
import dataGenerator from '../support/records'
import {emailDomain} from '../../app/src/helpers/tools'

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

describe('AuthService', () => {
  before(done => {
    Role.create({name: 'manager'})
      .then(() => Firm.create(firm))
      .then(newFirm => newFirm.createFirmConfig(firmConfig))
      .then(() => done())
  })

  after(() => Role.sequelize.sync({force: true}))

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
})
