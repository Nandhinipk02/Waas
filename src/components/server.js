// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
 
const app = express();
const PORT = 3001;
 
app.use(cors());
app.use(bodyParser.json());
 
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
 
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // or 'smtp.office365.com' for Outlook
    port: 587,
    secure: false, // true for port 465
    auth: {
      user: 'support@hoags.in',       // replace with your email
      pass: 'dpvxxhrlxmsbwtkz'      // use the app password, not your login password
    }
  });
 
  try {
    await transporter.sendMail({
    from: 'support@hoags.in',
    to: to, 
    subject: subject, 
    text: text,
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Email send failed:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});
 
app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});