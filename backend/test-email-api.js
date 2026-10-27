// Quick API test for email sending
import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

console.log('\n================================');
console.log('📧 Email API Test Server');
console.log('================================');
console.log('Email:', process.env.EMAIL_USER);
console.log('Password loaded:', process.env.EMAIL_PASS ? '✅ Yes' : '❌ No');
console.log('================================\n');

// Test endpoint
app.get('/test-email', async (req, res) => {
  try {
    console.log('📨 Attempting to send test email...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"Golden Skills Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Test Email from Golden Skills',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #f59e0b;">✅ Email Working!</h2>
          <p>Your Golden Skills backend can send emails successfully.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId,
      to: process.env.EMAIL_USER
    });

  } catch (error) {
    console.log('❌ Email failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Email failed',
      error: error.message
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n✅ Test server running on http://localhost:${PORT}`);
  console.log(`📨 Test email endpoint: http://localhost:${PORT}/test-email`);
  console.log(`\n👉 Open browser and visit the URL above to test email\n`);
});
