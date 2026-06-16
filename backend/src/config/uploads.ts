export const MIN_PORTFOLIO_ITEMS = 5;
export const MAX_PORTFOLIO_ITEMS = 10;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
]);

export const ALLOWED_UPLOAD_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
]);

export type UploadPurpose = 'profile-picture' | 'portfolio';

export function mediaTypeFromContentType(contentType: string): 'image' | 'video' | null {
  if (ALLOWED_IMAGE_TYPES.has(contentType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.has(contentType)) return 'video';
  return null;
}
