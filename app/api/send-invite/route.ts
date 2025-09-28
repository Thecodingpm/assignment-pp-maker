import { NextRequest, NextResponse } from 'next/server';

// Minimal email sender with provider fallback
// 1) Resend (RESEND_API_KEY)
// 2) Nodemailer SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'noreply@example.com',
      to,
      subject,
      html,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Resend failed: ${text}`);
  }
  return true;
}

async function sendViaSmtp(to: string, subject: string, html: string, docTitle?: string, permission?: string, acceptUrl?: string) {
  // Avoid importing nodemailer unless configured
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as Record<string, string>;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) return false;
  // Dynamic import
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  } as any);
  
  const permissionText = permission === 'admin' ? 'Admin' : permission === 'edit' ? 'Can Edit' : 'Can View';
  const textContent = `Collaboration Invitation

You've been invited to collaborate on "${docTitle || 'this presentation'}" with ${permissionText} permissions.

Click here to accept: ${acceptUrl || 'http://localhost:3000'}

This invitation was sent from Presentation Editor. If you didn't expect this invitation, you can safely ignore this email.`;
  
  await transporter.sendMail({ 
    from: SMTP_FROM, 
    to, 
    subject, 
    html,
    text: textContent
  });
  return true;
}

async function sendViaEthereal(to: string, subject: string, html: string) {
  const nodemailer = await import('nodemailer');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  } as any);
  const info = await transporter.sendMail({ from: 'Test <test@example.com>', to, subject, html });
  // @ts-ignore
  const previewUrl = nodemailer.getTestMessageUrl(info) as string | null;
  return { ok: true, previewUrl };
}

export async function POST(req: NextRequest) {
  try {
    const { inviteId, toEmail, docTitle, acceptUrl, permission } = await req.json();
    if (!inviteId || !toEmail || !acceptUrl) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }
    
    const permissionText = permission === 'admin' ? 'Admin' : permission === 'edit' ? 'Can Edit' : 'Can View';
    const permissionColor = permission === 'admin' ? '#8B5CF6' : permission === 'edit' ? '#10B981' : '#3B82F6';
    
  const subject = `Collaboration Invite: ${docTitle || 'Presentation'} - Presentation Editor`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Collaboration Invitation</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">You've been invited to collaborate on "${docTitle || 'this presentation'}"</p>
      </div>
        
        <div style="padding: 40px 20px;">
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${permissionColor};">
            <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 600;">Collaboration Invite</h2>
            <p style="margin: 0 0 16px 0; color: #64748b; font-size: 16px; line-height: 1.5;">
              You've been invited to collaborate on <strong>${docTitle || 'this presentation'}</strong> with <strong>${permissionText}</strong> permissions.
            </p>
            <div style="display: inline-flex; align-items: center; background: ${permissionColor}15; color: ${permissionColor}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              ${permissionText}
            </div>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
              Accept Invitation
            </a>
          </div>
          
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Or copy and paste this link:</p>
            <code style="background: white; padding: 8px 12px; border-radius: 6px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; color: #475569; word-break: break-all; display: block;">${acceptUrl}</code>
          </div>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
              This invitation was sent from Presentation Editor. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `;
    let sent = false;
    try {
      sent = await sendViaResend(toEmail, subject, html);
    } catch (e) {
      // fall through to smtp
    }
    if (!sent) {
      sent = await sendViaSmtp(toEmail, subject, html, docTitle, permission, acceptUrl);
    }
    if (!sent) {
      // Last-resort dev fallback: Ethereal test email (gives a preview URL)
      try {
        const res = await sendViaEthereal(toEmail, subject, html);
        return NextResponse.json({ ok: true, previewUrl: res.previewUrl });
      } catch (e) {
        return NextResponse.json({ ok: false, error: 'No email provider configured (set RESEND_API_KEY or SMTP_*). Dev preview also failed.' }, { status: 500 });
      }
    }
    return NextResponse.json({ ok: true, previewUrl: null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to send' }, { status: 500 });
  }
}

