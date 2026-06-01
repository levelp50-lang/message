const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { to, subject, body } = JSON.parse(event.body);

  if (!to || !subject || !body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'luxar@zetsuedu.com',
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      from: '"Kevin — Zetsu Corp" <luxar@zetsuedu.com>',
      to,
      subject,
      text: body
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
