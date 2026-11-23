const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.warn('[resend] RESEND_API_KEY not set, sending will fail');
}

module.exports = new Resend(process.env.RESEND_API_KEY);