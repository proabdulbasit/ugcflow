import { siteUrl } from '../services/email.js';

function layout(title: string, body: string) {
  const base = siteUrl();
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="margin-bottom: 24px;">
    <strong style="font-size: 20px; color: #4f46e5;">UGCFlow</strong>
  </div>
  ${body}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px;" />
  <p style="font-size: 12px; color: #6b7280;">
    <a href="${base}" style="color: #4f46e5;">UGCFlow</a> · UGC campaign management
  </p>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin: 24px 0;"><a href="${href}" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">${label}</a></p>`;
}

export function brandAccountApprovedEmail(name: string) {
  const base = siteUrl();
  return layout(
    'Brand account approved',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Your brand account is approved</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Great news — your UGCFlow brand application has been <strong>approved</strong>. You can now log in, purchase packages, and launch UGC campaigns.</p>
    ${button(`${base}/login`, 'Log in to UGCFlow')}
    `
  );
}

export function creatorAccountApprovedEmail(name: string) {
  const base = siteUrl();
  return layout(
    'Creator account approved',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Your creator account is approved</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Your UGCFlow creator application has been <strong>approved</strong>. You can now browse campaigns, apply for jobs, and submit content.</p>
    ${button(`${base}/login?role=creator`, 'Log in as Creator')}
    `
  );
}

export function packagePurchasedEmail(name: string, packageName: string, amount: number, credits: number) {
  const base = siteUrl();
  return layout(
    'Package purchase confirmed',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Package purchase confirmed</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for your purchase of <strong>${packageName}</strong> ($${amount} AUD).</p>
    <p><strong>${credits} credits</strong> have been added to your account.</p>
    ${button(`${base}/dashboard/brand/campaigns`, 'Launch a campaign')}
    `
  );
}

export function newCampaignAvailableEmail(creatorName: string, campaignTitle: string, campaignId: string) {
  const base = siteUrl();
  return layout(
    'New campaign available',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">New campaign on UGCFlow</h1>
    <p>Hi ${creatorName || 'Creator'},</p>
    <p>A new campaign brief is available: <strong>${campaignTitle}</strong>.</p>
    <p>Browse open jobs and apply if it fits your style.</p>
    ${button(`${base}/dashboard/creator/browse`, 'Browse campaigns')}
    `
  );
}

export function creatorAppliedEmail(
  brandName: string,
  creatorName: string,
  campaignTitle: string,
  campaignId: string
) {
  const base = siteUrl();
  return layout(
    'New creator application',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Creator applied to your campaign</h1>
    <p>Hi ${brandName || 'there'},</p>
    <p><strong>${creatorName}</strong> has applied for your campaign <strong>${campaignTitle}</strong>.</p>
    <p>Review their profile and portfolio samples in your campaign dashboard. UGCFlow will match and assign creators — you'll be notified when a creator is approved for your brief.</p>
    ${button(`${base}/dashboard/brand/campaigns/${campaignId}`, 'View campaign')}
    `
  );
}

export function creatorMatchedBrandEmail(
  brandName: string,
  creatorName: string,
  campaignTitle: string,
  campaignId: string
) {
  const base = siteUrl();
  return layout(
    'Creator approved for campaign',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Creator approved for your campaign</h1>
    <p>Hi ${brandName || 'there'},</p>
    <p><strong>${creatorName}</strong> has been approved and assigned to <strong>${campaignTitle}</strong>.</p>
    <p>They can now work on your brief. You'll be notified when content is uploaded for review.</p>
    ${button(`${base}/dashboard/brand/campaigns/${campaignId}`, 'View campaign')}
    `
  );
}

export function creatorAssignedEmail(creatorName: string, campaignTitle: string, campaignId: string) {
  const base = siteUrl();
  return layout(
    'You have been assigned',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">You've been approved for a job</h1>
    <p>Hi ${creatorName || 'Creator'},</p>
    <p>Congratulations — you've been approved for <strong>${campaignTitle}</strong>.</p>
    <p>Review the campaign brief and submit your UGC video when ready.</p>
    ${button(`${base}/dashboard/creator/assignments/${campaignId}`, 'Open campaign brief')}
    `
  );
}

export function deliverableSubmittedEmail(
  brandName: string,
  creatorName: string,
  campaignTitle: string,
  campaignId: string
) {
  const base = siteUrl();
  return layout(
    'Content ready for review',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Content uploaded for review</h1>
    <p>Hi ${brandName || 'there'},</p>
    <p><strong>${creatorName}</strong> has uploaded content for <strong>${campaignTitle}</strong>.</p>
    <p>Please review and approve or request revisions.</p>
    ${button(`${base}/dashboard/brand/campaigns/${campaignId}`, 'Review deliverable')}
    `
  );
}

export function deliverableApprovedEmail(creatorName: string, campaignTitle: string, amount: number) {
  const base = siteUrl();
  return layout(
    'Content approved — payout initiated',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Job complete — payout initiated</h1>
    <p>Hi ${creatorName || 'Creator'},</p>
    <p>Your deliverable for <strong>${campaignTitle}</strong> has been <strong>approved</strong>.</p>
    <p>Payout of <strong>$${amount} AUD</strong> has been initiated. Payments are made within <strong>5 business days</strong> of content approval.</p>
    ${button(`${base}/dashboard/creator/earnings`, 'View earnings')}
    `
  );
}

export function deliverableRejectedEmail(
  creatorName: string,
  campaignTitle: string,
  campaignId: string,
  feedback?: string
) {
  const base = siteUrl();
  return layout(
    'Revision requested',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Revision requested</h1>
    <p>Hi ${creatorName || 'Creator'},</p>
    <p>Your deliverable for <strong>${campaignTitle}</strong> needs a <strong>revision</strong>.</p>
    ${feedback ? `<p><strong>Feedback:</strong><br/>${feedback.replace(/\n/g, '<br/>')}</p>` : '<p>Please check the campaign brief and resubmit.</p>'}
    ${button(`${base}/dashboard/creator/assignments/${campaignId}`, 'Resubmit content')}
    `
  );
}

export function newMessageEmail(
  recipientName: string,
  senderName: string,
  senderRole: string,
  subject: string,
  message: string
) {
  const base = siteUrl();
  return layout(
    'New message',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">New message from ${senderName}</h1>
    <p>Hi ${recipientName || 'there'},</p>
    <p>You have a new message from <strong>${senderName}</strong> (${senderRole}).</p>
    ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      ${message.replace(/\n/g, '<br/>')}
    </div>
    ${button(`${base}/dashboard/messages`, 'View messages')}
    `
  );
}

export function adminMessageEmail(message: string) {
  return layout(
    'Message from UGCFlow',
    `
    <h1 style="font-size: 22px; margin: 0 0 16px;">Message from UGCFlow Admin</h1>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
      ${message.replace(/\n/g, '<br/>')}
    </div>
    `
  );
}
