const nodemailer = require('nodemailer');

// 1. Create a Nodemailer transporter using Gmail
// This transporter object is what actually sends the emails.
// We configure it with the service (Gmail) and our authentication credentials.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // The email address from your .env file
    pass: process.env.EMAIL_PASS, // The App Password from your .env file
  },
});

// 2. Define a reusable function to send emails
async function sendEmail(to, subject, htmlContent) {
  // Replace newlines with <br> tags for proper HTML formatting in the email
  const html = htmlContent.replace(/\n/g, '<br>');

  const mailOptions = {
    from: `"AI HR Agent" <${process.env.EMAIL_USER}>`, // Sender address
    to: to,               // List of receivers (the candidate's email)
    subject: subject,     // Subject line
    html: html,           // HTML body content
  };

  try {
    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

module.exports = { sendEmail };