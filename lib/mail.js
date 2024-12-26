const Email = require("email-templates")

module.exports = (template, {
  to,
  subject,
  locals,
  attachments = [],
  from = null,
  replyTo = null,
  send = true
}) => new Email({
  message: {
    from: from || process.env.SMTP_FROM_ADDRESS,
    replyTo: replyTo || from || process.env.SMTP_FROM_ADDRESS
  },
  send, // set to false for dry-runs
  transport: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // use SSL
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASSWORD
    }
  },
  views: {
    options: {
      extension: "ejs"
    }
  }
}).send({
  template,
  message: {
    to,
    subject,
    attachments
  },
  locals
})
