import sendgridTransport from 'nodemailer-sendgrid-transport'

require('dotenv').config()

export const mailerConfiguration = () => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return {port: 1025, ignoreTLS: true}
  } else {
    return sendgridTransport({
      secure: true,
      auth: {api_key: process.env.SENDGRID_API_KEY}
    })
  }
}
