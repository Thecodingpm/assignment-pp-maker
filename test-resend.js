// Test Resend API key
const RESEND_API_KEY = 're_5tf1nFpe_87rvbu2ij2A58MYQQJ5iaXJ7';

async function testResend() {
  try {
    console.log('Testing Resend API...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@resend.dev',
        to: 'test@example.com',
        subject: 'Test Email from Presentation Editor',
        html: '<h1>Test Email</h1><p>This is a test email from your presentation editor.</p>',
      }),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ Resend API key is working!');
    } else {
      console.log('❌ Resend API error:', result);
    }
  } catch (error) {
    console.log('❌ Error testing Resend:', error.message);
  }
}

testResend();

