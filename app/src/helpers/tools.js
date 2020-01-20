import crypto from 'crypto'

export const dateToISOString = date => (new Date(date)).toISOString()

export const isConfirmed = user => user.status === 'confirmed'

export const secureRandom = size => crypto.randomBytes(size).toString('hex')

export const tokenPayload = ({id, firstName, firm_id, role_id}) => ({id, firstName, firm_id, role_id})
