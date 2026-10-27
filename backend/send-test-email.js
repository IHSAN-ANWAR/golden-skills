// Send test email to verify configuration
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('\n================================');
console.log('📧 Sending Test Email');
console.log('================================');
console.log('From:', process.env.EMAIL_USER);
console.log('To: ihsan.anwar4321@gmail.com');
console.log('================================\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"Golden Skills" <${process.env.EMAIL_USER}>`,
  to: 'ihsan.anwar4321@gmail.com',
  subject: '✅ Golden Skills - Email Test Successful',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f59e0b; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">Golden Skills</h1>
        <p style="color: #666; margin: 10px 0;">Learning Management Platform</p>
      </div>
      
      <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #f59e0b; margin-top: 0;">✅ Email Configuration Test</h2>
        <p style="margin: 10px 0;">This is a test email to verify that Golden Skills backend can send emails successfully.</p>
      </div>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">Configuration Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; color: #666;"><strong>From Email:</strong></td>
            <td style="padding: 8px;">${process.env.EMAIL_USER}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;"><strong>To Email:</strong></td>
            <td style="padding: 8px;">ihsan.anwar4321@gmail.com</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;"><strong>Service:</strong></td>
            <td style="padding: 8px;">Gmail SMTP</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;"><strong>Date:</strong></td>
            <td style="padding: 8px;">${new Date().toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #666;"><strong>Status:</strong></td>
            <td style="padding: 8px; color: #28a745;"><strong>✅ Working</strong></td>
          </tr>
        </table>
      </div>
      
      <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
        <p style="margin: 0; color: #2e7d32;">
          <strong>✅ Success!</strong> Your email system is configured correctly and ready to send OTPs and notifications.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated test email from Golden Skills Backend
        </p>
        <p style="color: #999; font-size: 12px; text-align: center; margin: 5px 0 0 0;">
          © 2024 Golden Skills. All rights reserved.
        </p>
      </div>
    </div>
  `
};

console.log('📮 Sending email...\n');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ Email FAILED to send!\n');
    console.log('Error:', error.message);
    console.log('\n================================');
    console.log('🔍 Troubleshooting:');
    console.log('1. Check if 2-Factor Authentication is enabled');
    console.log('2. Generate new App Password from:');
    console.log('   https://myaccount.google.com/apppasswords');
    console.log('3. Verify Gmail account security settings');
    console.log('4. Check if IP is whitelisted (if using server)');
    console.log('================================\n');
    process.exit(1);
  } else {
    console.log('✅ Email SENT successfully!\n');
    console.log('================================');
    console.log('📬 Message Details:');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('================================');
    console.log('\n🎉 Check inbox: ihsan.anwar4321@gmail.com');
    console.log('📧 Subject: "Golden Skills - Email Test Successful"');
    console.log('\n✅ Email configuration is working perfectly!\n');
    process.exit(0);
  }
});
