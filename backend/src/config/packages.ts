export type PackageTier = 'starter' | 'growth' | 'scale';

export type PackageDefinition = {
  name: string;
  tagline: string;
  price: number;
  currency: string;
  videoCount: number;
  creatorCount: number;
  revisionRounds: number;
  turnaroundDays: number;
  matchingTier: string;
  tier: PackageTier;
  features: string[];
};

export const CREDITS_PER_VIDEO = 89;

export const CAMPAIGN_CREDIT_COST = CREDITS_PER_VIDEO;

export const PACKAGE_DEFINITIONS: PackageDefinition[] = [
  {
    name: 'Starter Package',
    tagline: 'Best for brands testing UGC for the first time.',
    price: 179,
    currency: 'AUD',
    videoCount: 1,
    creatorCount: 1,
    revisionRounds: 0,
    turnaroundDays: 5,
    matchingTier: 'standard',
    tier: 'starter',
    features: [
      '1 x UGC creator',
      '1 x 30–60 second UGC video',
      'Standard creator matching',
      'Basic brief submission support',
      '5 business day turnaround',
      'Paid and organic usage rights',
    ],
  },
  {
    name: 'Growth Package',
    tagline: 'Best for brands building consistent content and testing multiple hooks.',
    price: 449,
    currency: 'AUD',
    videoCount: 3,
    creatorCount: 3,
    revisionRounds: 1,
    turnaroundDays: 5,
    matchingTier: 'priority',
    tier: 'growth',
    features: [
      'Up to 3 x UGC creators',
      '3 x 30–60 second UGC videos',
      'Creator selection prioritisation',
      'Light script/hook guidance',
      '1 revision round per video',
      '5 business day turnaround',
      'Paid ad + organic usage rights',
    ],
  },
  {
    name: 'Scale Package',
    tagline: 'Best for performance marketing, paid ads, and scaling content output.',
    price: 899,
    currency: 'AUD',
    videoCount: 6,
    creatorCount: 6,
    revisionRounds: 2,
    turnaroundDays: 5,
    matchingTier: 'priority_plus',
    tier: 'scale',
    features: [
      'Up to 6 x UGC creators',
      '6 x 30–60 second UGC videos',
      'Priority creator matching',
      'Advanced brief support (hooks, angles, ad strategy suggestions)',
      '2 revision rounds per video',
      'Fast-track prioritised delivery queue',
      'Full paid ads usage + whitelisting rights included',
      'Campaign optimisation suggestions',
    ],
  },
];

const TIER_RANK: Record<PackageTier, number> = {
  starter: 1,
  growth: 2,
  scale: 3,
};

export function tierFromPackageName(name: string): PackageTier {
  const lower = name.toLowerCase();
  if (lower.includes('growth')) return 'growth';
  if (lower.includes('scale')) return 'scale';
  return 'starter';
}

export function tierConfig(tier: PackageTier) {
  const def = PACKAGE_DEFINITIONS.find((p) => p.tier === tier) ?? PACKAGE_DEFINITIONS[0];
  return {
    maxCreators: def.creatorCount,
    revisionRounds: def.revisionRounds,
    matchingTier: def.matchingTier,
    turnaroundDays: def.turnaroundDays,
  };
}

export function higherTier(current: PackageTier | undefined | null, next: PackageTier): PackageTier {
  if (!current) return next;
  return TIER_RANK[next] > TIER_RANK[current] ? next : current;
}

export function creditsForPackage(videoCount: number, name?: string): number {
  if (videoCount > 0) return videoCount * CREDITS_PER_VIDEO;
  if (name) {
    const def = PACKAGE_DEFINITIONS.find((p) => p.name === name);
    if (def) return def.videoCount * CREDITS_PER_VIDEO;
    const tier = tierFromPackageName(name);
    const videos = tier === 'growth' ? 3 : tier === 'scale' ? 6 : 1;
    return videos * CREDITS_PER_VIDEO;
  }
  return CREDITS_PER_VIDEO;
}
