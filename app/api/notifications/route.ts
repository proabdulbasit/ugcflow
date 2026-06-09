import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'DELIVERABLE_REVIEWED' && data?.creatorEmail) {
      const statusLabel = data.status === 'approved' ? 'approved' : 'needs revision';
      await sendEmail({
        to: data.creatorEmail,
        subject: `Your deliverable for "${data.campaignTitle}" was ${statusLabel}`,
        html: `
          <p>Hi ${data.creatorName || 'Creator'},</p>
          <p>Your deliverable for <strong>${data.campaignTitle}</strong> was <strong>${statusLabel}</strong>.</p>
          ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/creator/assignments">View your assignments</a></p>
        `,
      });
    }

    if (type === 'CREATOR_ASSIGNED' && data?.creatorEmail) {
      await sendEmail({
        to: data.creatorEmail,
        subject: `You've been assigned to "${data.campaignTitle}"`,
        html: `
          <p>Hi ${data.creatorName || 'Creator'},</p>
          <p>You have been assigned to the campaign <strong>${data.campaignTitle}</strong>.</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/creator/assignments/${data.campaignId}">Open assignment</a></p>
        `,
      });
    }

    if (type === 'ADMIN_MESSAGE' && data?.to) {
      await sendEmail({
        to: data.to,
        subject: data.subject || 'Message from UGCFLOW Admin',
        html: `<p>${String(data.message || '').replace(/\n/g, '<br/>')}</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Notification]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
