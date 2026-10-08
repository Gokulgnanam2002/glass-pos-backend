const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
});

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetLink = `http://localhost:${env.port}/api/auth/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: '"Glass POS" <no-reply@glasspos.com>',
    to,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset.</p>
           <p>Use the following token to reset your password:</p>
           <p><strong>${resetToken}</strong></p>
           <p>If you didn't request this, please ignore this email.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
