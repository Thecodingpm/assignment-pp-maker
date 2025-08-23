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

async function sendViaSmtp(to: string, subject: string, html: string) {
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
  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
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
    const { inviteId, toEmail, docTitle, acceptUrl } = await req.json();
    if (!inviteId || !toEmail || !acceptUrl) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }
    const subject = `You are invited to collaborate${docTitle ? ` on "${docTitle}"` : ''}`;
    const html = `
      <div style="font-family: Inter, Arial, sans-serif;">
        <h2>Collaboration Invite</h2>
        <p>You have been invited to collaborate${docTitle ? ` on <strong>${docTitle}</strong>` : ''}.</p>
        <p>
          <a href="${acceptUrl}" style="display:inline-block;padding:10px 16px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;">Accept Invite</a>
        </p>
        <p>Or paste this link in your browser:<br/>${acceptUrl}</p>
      </div>
    `;
    let sent = false;
    try {
      sent = await sendViaResend(toEmail, subject, html);
    } catch (e) {
      // fall through to smtp
    }
    if (!sent) {
      sent = await sendViaSmtp(toEmail, subject, html);
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

