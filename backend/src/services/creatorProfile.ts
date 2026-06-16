import {
  MAX_PORTFOLIO_ITEMS,
  MIN_PORTFOLIO_ITEMS,
  type UploadPurpose,
} from '../config/uploads.js';

export type PortfolioMediaItem = {
  url: string;
  type: 'image' | 'video';
  key: string;
};

export function validatePortfolioMedia(items: unknown): string | null {
  if (!Array.isArray(items)) return 'portfolioMedia must be an array';
  if (items.length < MIN_PORTFOLIO_ITEMS) {
    return `Upload at least ${MIN_PORTFOLIO_ITEMS} portfolio samples (images or videos).`;
  }
  if (items.length > MAX_PORTFOLIO_ITEMS) {
    return `Maximum ${MAX_PORTFOLIO_ITEMS} portfolio samples allowed.`;
  }

  for (const item of items) {
    if (!item || typeof item !== 'object') return 'Invalid portfolio item';
    const { url, type, key } = item as PortfolioMediaItem;
    if (!url || typeof url !== 'string') return 'Each portfolio item needs a url';
    if (!key || typeof key !== 'string') return 'Each portfolio item needs a key';
    if (type !== 'image' && type !== 'video') return 'Portfolio item type must be image or video';
  }

  return null;
}

export function normalizePortfolioMedia(items: PortfolioMediaItem[]): PortfolioMediaItem[] {
  return items.map((item) => ({
    url: String(item.url).trim(),
    key: String(item.key).trim(),
    type: item.type,
  }));
}

export function resolveUploadOwner(req: import('express').Request, uploadSessionId?: string) {
  if (req.user?.userId) {
    return { userId: req.user.userId };
  }
  if (uploadSessionId?.trim()) {
    return { uploadSessionId: uploadSessionId.trim() };
  }
  return null;
}

export function purposeAllowsUnauthenticated(purpose: UploadPurpose) {
  return purpose === 'profile-picture' || purpose === 'portfolio';
}
