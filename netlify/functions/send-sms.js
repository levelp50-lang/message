const twilio = require('twilio');
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  const { to, message } = JSON.parse(event.body);
 
  if (!to || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing fields' }) };
  }
 
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  const phone = to.replace(/\D/g, '');
  const formatted = phone.length === 10 ? `+1${phone}` : `+${phone}`;
 
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_NUMBER,
      to: formatted
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
 
