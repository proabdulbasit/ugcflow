import { User, Brand, Creator, Campaign, CampaignApplication, CampaignCreator } from '../models/index.js';
import { sendEmailAsync } from './email.js';
import {
  brandAccountApprovedEmail,
  creatorAccountApprovedEmail,
  packagePurchasedEmail,
  newCampaignAvailableEmail,
  creatorAppliedEmail,
  creatorMatchedBrandEmail,
  creatorAssignedEmail,
  deliverableSubmittedEmail,
  deliverableApprovedEmail,
  deliverableRejectedEmail,
  newMessageEmail,
  adminMessageEmail,
} from '../emails/templates.js';

async function userEmail(userId: string) {
  const user = await User.findById(userId);
  return user ? { email: user.email, name: user.fullName } : null;
}

export function notifyBrandApproved(brandId: string) {
  void (async () => {
    const user = await userEmail(brandId);
    if (!user?.email) return;
    sendEmailAsync({
      to: user.email,
      subject: 'Your UGCFlow brand account is approved',
      html: brandAccountApprovedEmail(user.name),
    });
  })();
}

export function notifyCreatorApproved(creatorId: string) {
  void (async () => {
    const user = await userEmail(creatorId);
    if (!user?.email) return;
    sendEmailAsync({
      to: user.email,
      subject: 'Your UGCFlow creator account is approved',
      html: creatorAccountApprovedEmail(user.name),
    });
  })();
}

export function notifyPackagePurchased(
  brandId: string,
  packageName: string,
  amount: number,
  creditsAdded: number
) {
  void (async () => {
    const user = await userEmail(brandId);
    if (!user?.email) return;
    sendEmailAsync({
      to: user.email,
      subject: `Package purchase confirmed — ${packageName}`,
      html: packagePurchasedEmail(user.name, packageName, amount, creditsAdded),
    });
  })();
}

export function notifyNewCampaignToCreators(campaignId: string, campaignTitle: string) {
  void (async () => {
    const creators = await Creator.find({ status: 'approved' });
    for (const creator of creators) {
      const user = await User.findById(creator._id);
      if (!user?.email) continue;
      sendEmailAsync({
        to: user.email,
        subject: `New campaign: ${campaignTitle}`,
        html: newCampaignAvailableEmail(user.fullName, campaignTitle, campaignId),
      });
    }
  })();
}

export function notifyCreatorApplied(campaignId: string, creatorId: string) {
  void (async () => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;
    const brandUser = await userEmail(campaign.brandId.toString());
    const creatorUser = await userEmail(creatorId);
    if (!brandUser?.email) return;
    sendEmailAsync({
      to: brandUser.email,
      subject: `Creator applied: ${campaign.title}`,
      html: creatorAppliedEmail(
        brandUser.name,
        creatorUser?.name ?? 'A creator',
        campaign.title,
        campaignId
      ),
    });
  })();
}

export function notifyCreatorAssigned(campaignId: string, creatorId: string) {
  void (async () => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    const creatorUser = await userEmail(creatorId);
    const brandUser = await userEmail(campaign.brandId.toString());

    if (creatorUser?.email) {
      sendEmailAsync({
        to: creatorUser.email,
        subject: `You've been approved for "${campaign.title}"`,
        html: creatorAssignedEmail(creatorUser.name, campaign.title, campaignId),
      });
    }

    if (brandUser?.email && creatorUser) {
      sendEmailAsync({
        to: brandUser.email,
        subject: `Creator approved for "${campaign.title}"`,
        html: creatorMatchedBrandEmail(
          brandUser.name,
          creatorUser.name,
          campaign.title,
          campaignId
        ),
      });
    }
  })();
}

export function notifyDeliverableSubmitted(campaignId: string, creatorId: string) {
  void (async () => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;
    const brandUser = await userEmail(campaign.brandId.toString());
    const creatorUser = await userEmail(creatorId);
    if (!brandUser?.email) return;
    sendEmailAsync({
      to: brandUser.email,
      subject: `Content uploaded: ${campaign.title}`,
      html: deliverableSubmittedEmail(
        brandUser.name,
        creatorUser?.name ?? 'Creator',
        campaign.title,
        campaignId
      ),
    });
  })();
}

export function notifyDeliverableReviewed(
  campaignId: string,
  creatorId: string,
  status: 'approved' | 'rejected',
  feedback?: string
) {
  void (async () => {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;
    const creatorUser = await userEmail(creatorId);
    if (!creatorUser?.email) return;

    if (status === 'approved') {
      sendEmailAsync({
        to: creatorUser.email,
        subject: `Content approved — payout initiated for "${campaign.title}"`,
        html: deliverableApprovedEmail(creatorUser.name, campaign.title, campaign.payoutAmount ?? 89),
      });
    } else {
      sendEmailAsync({
        to: creatorUser.email,
        subject: `Revision requested: ${campaign.title}`,
        html: deliverableRejectedEmail(
          creatorUser.name,
          campaign.title,
          campaignId,
          feedback
        ),
      });
    }
  })();
}

export function notifyNewMessage(
  recipientId: string,
  senderId: string,
  subject: string,
  body: string
) {
  void (async () => {
    const [recipient, sender] = await Promise.all([
      User.findById(recipientId),
      User.findById(senderId),
    ]);
    if (!recipient?.email || !sender) return;
    const roleLabel = sender.role === 'brand' ? 'Brand' : sender.role === 'creator' ? 'Creator' : 'Admin';
    sendEmailAsync({
      to: recipient.email,
      subject: subject ? `New message: ${subject}` : `New message from ${sender.fullName}`,
      html: newMessageEmail(recipient.fullName, sender.fullName, roleLabel, subject, body),
    });
  })();
}

export function notifyAdminMessage(to: string, subject: string, message: string) {
  sendEmailAsync({
    to,
    subject: subject || 'Message from UGCFlow Admin',
    html: adminMessageEmail(message),
  });
}

export async function hasCampaignRelationship(userA: string, userB: string) {
  const userARecord = await User.findById(userA);
  const userBRecord = await User.findById(userB);
  if (!userARecord || !userBRecord) return false;

  if (userARecord.role === 'brand' && userBRecord.role === 'creator') {
    const campaigns = await Campaign.find({ brandId: userA }).select('_id');
    const ids = campaigns.map((c) => c._id);
    const app = await CampaignApplication.findOne({ campaignId: { $in: ids }, creatorId: userB });
    if (app) return true;
    const assigned = await CampaignCreator.findOne({ campaignId: { $in: ids }, creatorId: userB });
    return !!assigned;
  }

  if (userARecord.role === 'creator' && userBRecord.role === 'brand') {
    return hasCampaignRelationship(userB, userA);
  }

  return false;
}
