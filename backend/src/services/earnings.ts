import { Campaign, CreatorEarning, Deliverable } from '../models/index.js';

export async function onDeliverableApproved(deliverableId: string) {
  const deliverable = await Deliverable.findById(deliverableId);
  if (!deliverable || deliverable.status !== 'approved') return;

  const existing = await CreatorEarning.findOne({ deliverableId: deliverable._id });
  if (existing) return;

  const campaign = await Campaign.findById(deliverable.campaignId);
  if (!campaign) return;

  await CreatorEarning.create({
    creatorId: deliverable.creatorId,
    campaignId: deliverable.campaignId,
    deliverableId: deliverable._id,
    amount: campaign.payoutAmount ?? 89,
    status: 'pending',
  });
}
