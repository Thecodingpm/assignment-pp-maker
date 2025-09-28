# Email Setup Guide for Collaboration Invites

## 🚀 Quick Setup Options

The collaboration system supports multiple email providers. Here are the easiest ways to get started:

## Option 1: Resend (Recommended - Easiest)

Resend is the simplest and most reliable option for sending emails.

### 1. Sign up for Resend
- Go to [resend.com](https://resend.com)
- Sign up for a free account
- Verify your domain or use their test domain

### 2. Get your API Key
- Go to API Keys in your Resend dashboard
- Create a new API key
- Copy the key

### 3. Add to Environment Variables
Create a `.env.local` file in your project root:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=noreply@yourdomain.com
```

## Option 2: Gmail SMTP (Free)

### 1. Enable App Passwords
- Go to your Google Account settings
- Enable 2-Factor Authentication
- Generate an App Password for "Mail"

### 2. Add to Environment Variables
Create a `.env.local` file in your project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Option 3: Outlook/Hotmail SMTP

### 1. Enable App Passwords
- Go to Microsoft Account security settings
- Enable 2-Factor Authentication
- Generate an App Password

### 2. Add to Environment Variables
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@outlook.com
```

## Option 4: Other SMTP Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@yourdomain.com
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=your-verified-sender@yourdomain.com
```

## 🧪 Testing Your Setup

### 1. Test Email Sending
After setting up your environment variables, restart your development server:

```bash
npm run dev
```

### 2. Test the Invite System
1. Go to any presentation editor
2. Click the "+" button
3. Go to "Collaborate" tab
4. Enter an email address
5. Click "Invite"

### 3. Check the Console
Look for these messages in your browser console:
- ✅ "Invite emailed successfully!" - Email sent successfully
- ⚠️ "Invite saved. Email not configured. Copy link: ..." - Email not configured, but link is generated
- ❌ "Invite saved. Email send failed. Copy link: ..." - Email failed, but link is generated

## 🔧 Troubleshooting

### Common Issues

1. **"Email not configured"**
   - Check your `.env.local` file exists
   - Verify environment variable names are correct
   - Restart your development server

2. **"Email send failed"**
   - Check your API key/credentials
   - Verify your email provider settings
   - Check the server console for detailed error messages

3. **Gmail "Less secure app access"**
   - Use App Passwords instead of your regular password
   - Enable 2-Factor Authentication first

4. **Domain verification required**
   - Some providers require domain verification
   - Use their test domains for development

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
DEBUG_EMAIL=true
```

## 📧 Email Templates

The system sends beautiful HTML emails with:
- Professional design
- Permission level indicators
- Direct invitation links
- Fallback plain text

## 🚀 Production Setup

For production, make sure to:
1. Use a verified domain for your "from" address
2. Set up proper SPF, DKIM, and DMARC records
3. Monitor email delivery rates
4. Set up bounce handling

## 💡 Quick Start (Resend)

Here's the fastest way to get started:

1. **Sign up at [resend.com](https://resend.com)**
2. **Get your API key**
3. **Create `.env.local`:**
   ```env
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM=noreply@resend.dev
   ```
4. **Restart your server:**
   ```bash
   npm run dev
   ```
5. **Test the invite system!**

## 🎉 Success!

Once configured, users will receive beautiful invitation emails with:
- Direct links to join the collaboration
- Permission level information
- Professional styling
- Mobile-friendly design

---

**Need help?** Check the console logs for detailed error messages!

