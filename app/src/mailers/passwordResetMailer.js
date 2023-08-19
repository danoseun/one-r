require('dotenv').config()

const signUpEmailHtml = token => (
  `
  <body>
    <p>
      Someone requested a password reset for your account. If this was not you, please disregard this email.
    </p>
    <p>If you’d like to continue click the link below. This link will expire in 20 minutes.</p>
    <a href='${process.env.WEB_HOST}/auth/reset-passowrd/${token}'>Reset Your  Password</a>
    <p>Thanks.</p>
  </body>
  `
)

const signUpEmailText = token => (
  `
  Someone requested a password reset for your account. If this was not you, please disregard this email.

  If you’d like to continue click the link below. This link will expire in 20 minutes.

  Reset Your  Password. ${process.env.WEB_HOST}/auth/reset-passowrd/${token}
  Thanks.
  `
)

const passwordResetMailer = (email, token) => ({
  from: 'whatsapp@cars45.com',
  to: email,
  subject: 'Cars45 Whatsapp Support Solution Account Recovery Instructions',
  text: signUpEmailText(token),
  html: signUpEmailHtml(token)
})

export default passwordResetMailer
