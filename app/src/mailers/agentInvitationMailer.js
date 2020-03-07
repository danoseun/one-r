require('dotenv').config()

const agentIinvitationHtml = (inviterName, token) => (
  `
    <body>
      <p>
        ${inviterName} has invited you to join the team on Cars45 Whatsapp Support Solution.
        Join your team to support and engage your customers via Whatsapp.
      </p>
      <a href='${process.env.WEB_HOST}/auth/confirmation/${token}'>Click Here To Join</a>
    </body>
  `
)

const agentInvitationText = (inviterName, token) => (
  `
    ${inviterName} has invited you to join the team on Cars45 Whatsapp Support Solution.
    Join your team to support and engage your customers via Whatsapp.
    Click Here To Join ${process.env.WEB_HOST}/auth/confirmation/${token}
  `
)

const agentInvitationMailer = (inviterName, email, token) => ({
  from: 'whatsapp@cars45.com',
  to: email,
  subject: `${inviterName} has invited you to work together on Cars45 Whatsapp Support Solution`,
  text: agentInvitationText(inviterName, token),
  html: agentIinvitationHtml(inviterName, token)
})

export default agentInvitationMailer
