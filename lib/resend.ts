import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const { data, error } = await resend.emails.send({
      // CHANGE THIS: Use your verified domain here
      from: 'UGCFlow <notifications@ugcflow.com>', 
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
