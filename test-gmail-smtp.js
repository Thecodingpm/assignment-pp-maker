// Test Gmail SMTP configuration
const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  console.log('Testing Gmail SMTP configuration...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'ahmadmuaaz292@gmail.com',
      pass: 'cqqp bdar much vukb'
    }
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: 'ahmadmuaaz292@gmail.com',
      to: 'test@example.com',
      subject: 'Test Email from Presentation Editor',
      html: '<h1>Test Email</h1><p>This is a test email to verify Gmail SMTP is working.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ Gmail SMTP Error:', error.message);
    console.error('Full error:', error);
  }
}

testGmailSMTP();
