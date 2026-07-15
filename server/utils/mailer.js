const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '173.194.203.108',
  port: 465,
  secure: true,
  pool: true,              
  family: 4,               
  connectionTimeout: 10000,
  debug: true,
  logger: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com' 
  }
});

module.exports = transporter;