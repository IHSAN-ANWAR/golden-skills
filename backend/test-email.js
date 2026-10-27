// Test Email Configuration
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('================================');
console.log('🔍 Email Configuration Test');
console.log('================================\n');

console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Password Length:', process.env.EMAIL_PASS?.length, 'characters');
console.log('🔑 Password:', process.env.EMAIL_PASS?.substring(0, 4) + '************');
console.log('\n================================\n');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('🔄 Verifying SMTP connection...\n');

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection FAILED!\n');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('\n📋 Possible Solutions:');
    console.log('1. Enable 2-Factor Authentication on Gmail account');
    console.log('2. Generate new App Password: https://myaccount.google.com/apppasswords');
    console.log('3. Make sure "Less secure app access" is enabled (if available)');
    console.log('4. Check if account has any security alerts');
    console.log('\n================================\n');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection SUCCESSFUL!\n');
    console.log('📨 Server is ready to send emails!');
    console.log('\n================================\n');
    
    // Try sending a test email
    console.log('📮 Sending test email...\n');
    
    transporter.sendMail({
      from: `"Golden Skills" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: '✅ Golden Skills - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">✅ Email Configuration Successful!</h2>
          <p>Your Golden Skills backend is now able to send emails.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Email: ${process.env.EMAIL_USER}</li>
            <li>Service: Gmail SMTP</li>
            <li>Status: Active ✅</li>
          </ul>
          <p style="color: #666;">This is a test email. Your email system is working correctly!</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="color:#999; font-size:12px;">Golden Skills Team</p>
        </div>
      `
    }, (err, info) => {
      if (err) {
        console.log('❌ Test email FAILED:', err.message);
      } else {
        console.log('✅ Test email SENT successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📧 Check inbox:', process.env.EMAIL_USER);
        console.log('\n================================\n');
      }
      process.exit(0);
    });
  }
});
