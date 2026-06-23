import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const client = getResendClient();
  if (!client) {
    console.warn('RESEND_API_KEY not set; skipping email send');
    return { error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: process.env.RESEND_FROM || 'UGCFlow <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Email Error:', error);
    return { error };
  }
}
