import crypto from 'crypto'
import moment from 'moment'

import db from '../../db/models'
import TemplateService from '../services/TemplateService'

export const dateToISOString = date => (new Date(date)).toISOString()

export const isConfirmed = user => user.status === 'confirmed'

export const secureRandom = size => crypto.randomBytes(size).toString('hex')

export const tokenPayload = ({id, firstName, firm_id, role_id}) => ({id, firstName, firm_id, role_id})

export const addRoleToUser = (user, roleName = 'manager') => db.Role.findOne({where: {name: roleName}}).then(role => ({...user, role_id: role.id}))

export const isEmailValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const formatRecord = record => record.get({plain: true})

export const sanitizeUserAttributes = ({id, firstName, email, lastName, firm_id, role_id, status}) => ({
  id,
  firstName,
  email,
  lastName,
  firm_id,
  role_id,
  status
})

export const emailDomain = email => email.split('@')[1]

/**
 * Checks that token was created with 24 hours during account confirmation
 * @param {String} createdAt - required
 * @returns {Boolean}
 */
export const isConfirmationTokenActive = ({createdAt}) => {
  if (moment(createdAt).diff(Date.now(), 'days') < 0)
    return false
  else
    return true
}

export const isAdmin = async roleId => {
  const role = await db.Role.findByPk(roleId)

  return role.name === 'admin'
}

export const isManager = async roleId => {
  const role = await db.Role.findByPk(roleId)

  return role.name === 'manager'
}

export const templateData = user => (new TemplateService(db.Template, user))

export const isLoginAllowed = user => {
  const blockedLoginStatus = ['pending', 'disabled']

  return !blockedLoginStatus.includes(user.status)
}
