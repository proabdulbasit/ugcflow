export type PackageTier = 'starter' | 'growth' | 'scale';

export const CREDITS_PER_VIDEO = 89;

export const CAMPAIGN_CREDIT_COST = CREDITS_PER_VIDEO;

export function packageCredits(videoCount: number) {
  return videoCount * CREDITS_PER_VIDEO;
}

export type PackageDisplay = {
  tier: PackageTier;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  videoCount: number;
  creatorCount: number;
  features: string[];
};

export const PACKAGE_DISPLAY: PackageDisplay[] = [
  {
    tier: 'starter',
    name: 'Starter Package',
    tagline: 'Best for brands testing UGC for the first time.',
    price: 179,
    currency: 'AUD',
    videoCount: 1,
    creatorCount: 1,
    features: [
      '1 x UGC creator',
      '1 x UGC video',
      'Standard creator matching',
      'Basic brief submission support',
      '5 business day turnaround',
      'Paid and organic usage rights',
    ],
  },
  {
    tier: 'growth',
    name: 'Growth Package',
    tagline: 'Best for brands building consistent content and testing multiple hooks.',
    price: 449,
    currency: 'AUD',
    videoCount: 3,
    creatorCount: 3,
    features: [
      'Up to 3 x UGC creators',
      '3 x UGC videos',
      'Creator selection prioritisation',
      'Light script/hook guidance',
      '1 revision round per video',
      '5 business day turnaround',
      'Paid ad + organic usage rights',
    ],
  },
  {
    tier: 'scale',
    name: 'Scale Package',
    tagline: 'Best for performance marketing, paid ads, and scaling content output.',
    price: 899,
    currency: 'AUD',
    videoCount: 6,
    creatorCount: 6,
    features: [
      'Up to 6 x UGC creators',
      '6 x UGC videos',
      'Priority creator matching',
      'Advanced brief support (hooks, angles, ad strategy suggestions)',
      '2 revision rounds per video',
      'Fast-track prioritised delivery queue',
      'Full paid ads usage + whitelisting rights included',
      'Campaign optimisation suggestions',
    ],
  },
];

export type PricingPackage = PackageDisplay & {
  id?: string;
  stripe_price_id?: string;
};

function tierFromApiPackage(pkg: Record<string, unknown>): PackageTier | null {
  const tier = pkg.tier as string | undefined;
  if (tier === 'starter' || tier === 'growth' || tier === 'scale') return tier;
  const name = String(pkg.name ?? '').toLowerCase();
  if (name.includes('growth')) return 'growth';
  if (name.includes('scale')) return 'scale';
  if (name.includes('starter')) return 'starter';
  return null;
}

/** Always show canonical package copy; attach API ids for checkout when available. */
export function mergePackagesForPricing(apiPackages: Record<string, unknown>[] = []): PricingPackage[] {
  return PACKAGE_DISPLAY.map((display) => {
    const api = apiPackages.find((p) => tierFromApiPackage(p) === display.tier);
    return {
      ...display,
      id: api?.id as string | undefined,
      stripe_price_id: (api?.stripe_price_id ?? api?.stripePriceId) as string | undefined,
    };
  });
}

export function formatPackagePrice(price: number, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function packageFeatures(pkg: { features?: string[]; description?: string }): string[] {
  if (Array.isArray(pkg.features) && pkg.features.length > 0) return pkg.features;
  if (pkg.description) {
    return pkg.description.split('\n').map((line) => line.trim()).filter(Boolean);
  }
  return [];
}
