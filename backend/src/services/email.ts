import { Resend } from 'resend';

let client: Resend | null = null;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function siteUrl() {
  return process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:3000';
}

export function emailFrom() {
  return process.env.RESEND_FROM || 'UGCFlow <onboarding@resend.dev>';
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping:', subject);
    return { skipped: true };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const { data, error } = await resend.emails.send({
    from: emailFrom(),
    to: recipients,
    subject,
    html,
  });

  if (error) {
    console.error('[email] Resend error:', error);
    throw new Error(error.message);
  }

  return { data };
}

/** Fire-and-forget — never blocks the API response. */
export function sendEmailAsync(payload: { to: string | string[]; subject: string; html: string }) {
  void sendEmail(payload).catch((err) => {
    console.error('[email] async send failed:', payload.subject, err);
  });
}
