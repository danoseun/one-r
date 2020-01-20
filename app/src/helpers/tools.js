import crypto from 'crypto'

import db from '../../db/models'

export const dateToISOString = date => (new Date(date)).toISOString()

export const isConfirmed = user => user.status === 'confirmed'

export const secureRandom = size => crypto.randomBytes(size).toString('hex')

export const tokenPayload = ({id, firstName, firm_id, role_id}) => ({id, firstName, firm_id, role_id})

export const addRoleToUser = (user, roleName = 'manager') => db.Role.findOne({where: {name: roleName}}).then(role => ({...user, role_id: role.id}))

export const isEmailValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const formatRecord = record => record.get({plain: true})

export const sanitizeUserAttributes = ({id, firstName, email, lastName, role_id, status}) => ({id, firstName, email, lastName, role_id, status})

export const emailDomain = email => email.split('@')[1]
