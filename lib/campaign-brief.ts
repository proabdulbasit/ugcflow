export const TARGET_PLATFORMS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram Reels' },
  { value: 'youtube', label: 'YouTube Shorts' },
  { value: 'meta', label: 'Meta Ads (Facebook/Instagram)' },
  { value: 'other', label: 'Other / Multi-platform' },
] as const;

export const VIDEO_FORMATS = [
  { value: 'vertical_9_16', label: '9:16 Vertical (TikTok / Reels)' },
  { value: 'square_1_1', label: '1:1 Square' },
  { value: 'horizontal_16_9', label: '16:9 Horizontal' },
] as const;

export type TargetPlatform = (typeof TARGET_PLATFORMS)[number]['value'];
export type VideoFormat = (typeof VIDEO_FORMATS)[number]['value'];

export function formatPlatform(value?: string | null) {
  return TARGET_PLATFORMS.find((p) => p.value === value)?.label ?? value ?? '—';
}

export function formatVideoFormat(value?: string | null) {
  return VIDEO_FORMATS.find((f) => f.value === value)?.label ?? value ?? '—';
}

export type CampaignBriefFields = {
  title: string;
  brief: string;
  referenceVideoUrl?: string;
  productUrl?: string;
  targetPlatform?: string;
  videoFormat?: string;
  talkingPoints?: string;
  dosAndDonts?: string;
};

export function mapCampaignResponse(c: Record<string, unknown>) {
  return {
    ...c,
    id: (c.id as string) ?? (c._id as { toString(): string })?.toString?.(),
    referenceVideoUrl: c.referenceVideoUrl ?? c.reference_video_url,
    productUrl: c.productUrl ?? c.product_url,
    targetPlatform: c.targetPlatform ?? c.target_platform,
    videoFormat: c.videoFormat ?? c.video_format,
    talkingPoints: c.talkingPoints ?? c.talking_points,
    dosAndDonts: c.dosAndDonts ?? c.dos_and_donts,
    payoutAmount: c.payoutAmount ?? c.payout_amount,
    createdAt: c.createdAt ?? c.created_at,
  };
}
