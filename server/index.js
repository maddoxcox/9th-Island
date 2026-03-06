const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle quote form submission
app.post('/api/quote', async (req, res) => {
  const { firstName, lastName, address, phone, service } = req.body;

  // Build the notification message
  const message = `New Quote Request!\n\nName: ${firstName} ${lastName}\nAddress: ${address}\nPhone: ${phone}\nService: ${service}`;

  try {
    // Send text to you
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER
    });

    // Send confirmation text to the customer
    await client.messages.create({
      body: `Hi ${firstName}! Thanks for requesting a quote from 9th Island Pressure Washing. We'll get back to you shortly!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    res.json({ success: true, message: 'Quote submitted! We will text you shortly.' });
  } catch (error) {
    console.error('Twilio error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// Handle incoming texts (two-way messaging)
app.post('/api/sms', (req, res) => {
  const incomingMessage = req.body.Body;
  const fromNumber = req.body.From;

  console.log(`Text from ${fromNumber}: ${incomingMessage}`);

  // Respond with TwiML
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Thanks for your message! We will get back to you soon.');

  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
