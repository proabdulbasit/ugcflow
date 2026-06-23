import type { ICreator } from '../models/index.js';

export type CreatorPortfolioMedia = {
  url: string;
  type: 'image' | 'video';
  key: string;
};

/** Public creator profile for brands reviewing applicants (no shipping/payout). */
export function creatorProfileForBrandApplicant(
  creator: ICreator | null,
  user: { fullName: string; email: string; id: string } | null
) {
  if (!user) return null;
  return {
    id: user.id,
    profiles: {
      full_name: user.fullName,
      email: user.email,
      portfolio_url: creator?.portfolioUrl,
      profile_picture_url: creator?.profilePictureUrl,
      portfolio_media: creator?.portfolioMedia ?? [],
      bio: creator?.bio,
    },
  };
}

/** Extended profile when creator is assigned to a brand's campaign (includes shipping). */
export function creatorProfileForBrandAssigned(
  creator: ICreator | null,
  user: { fullName: string; email: string; id: string } | null
) {
  const base = creatorProfileForBrandApplicant(creator, user);
  if (!base) return null;
  return {
    ...base,
    profiles: {
      ...base.profiles,
      shipping_details: creator?.address?.trim() || null,
    },
  };
}

/** Payout + ABN fields visible to creator (self) and admin only. */
export function creatorPrivateProfile(creator: ICreator | null) {
  if (!creator) return null;
  return {
    abn: creator.abn ?? null,
    payoutPaypalEmail: creator.payoutPaypalEmail ?? null,
    payoutBankAccountName: creator.payoutBankAccountName ?? null,
    payoutBankBsb: creator.payoutBankBsb ?? null,
    payoutBankAccountNumber: creator.payoutBankAccountNumber ?? null,
    payoutBankName: creator.payoutBankName ?? null,
  };
}
