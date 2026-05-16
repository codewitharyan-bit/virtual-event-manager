const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: '"Event Platform" <no-reply@eventplatform.com>',
    to,
    subject: 'Welcome to Event Platform!',
    html: `
      <h2>Hi ${name}! 👋</h2>
      <p>Thanks for registering on our Virtual Event Platform.</p>
      <p>Start exploring events today!</p>
    `
  });
  console.log(`Welcome email sent to ${to}`);
};


const sendRegistrationEmail = async (to, name, eventTitle) => {
  await transporter.sendMail({
    from: '"Event Platform" <no-reply@eventplatform.com>',
    to,
    subject: `You're registered for ${eventTitle}!`,
    html: `
      <h2>Hi ${name}! 🎉</h2>
      <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
      <p>We look forward to seeing you there!</p>
    `
  });
  console.log(`Registration email sent to ${to}`);
};

module.exports = { sendWelcomeEmail, sendRegistrationEmail };