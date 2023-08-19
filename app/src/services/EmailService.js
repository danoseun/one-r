import nodemailer from 'nodemailer'

import {mailerConfiguration} from '../helpers/emailTools'

require('dotenv').config()

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(mailerConfiguration())
  }

  /**
   * Verifies SMTP connection and sends email
   * @param {Object} message
   * @throws Reason for failure
   * @returns {Object}
   */
  sendEmail(message) {
    try {
      this.verify()
      this.transporter.sendMail(message, (err, info) => {
        if (err)
          throw new Error(err)
        else
          return info
      })
    } catch (error) {
      if (error)
        throw new Error(error)
    }
  }

  /**
   * Verifies SMTP connection
   * @throws Connection error
   */
  verify() {
    // eslint-disable-next-line no-unused-vars
    this.transporter.verify((error, success) => {
      if (error)
        throw new Error(error)
      else
        console.warn('Server is ready to take our messages')
    })
  }

  /**
   * Sends Email after specified timeout has been reached
   * It's useful so race condition doesn't happen when multiple users are signing up
   * @param {Number} time - Delay time in millisecond
   * @returns {Object}
   */
  delay(time) {
    return {
      sendEmail: message => {
        setTimeout(() => this.sendEmail(message), time)
      }
    }
  }
}

export default EmailService
