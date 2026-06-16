import { API_URL, ApiError, getStoredToken } from './client';

export type PortfolioMediaItem = {
  url: string;
  type: 'image' | 'video';
  key: string;
};

export type UploadPurpose = 'profile-picture' | 'portfolio';

export async function uploadCreatorMediaFile(
  file: File,
  purpose: UploadPurpose,
  uploadSessionId?: string
): Promise<PortfolioMediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  if (uploadSessionId) formData.append('uploadSessionId', uploadSessionId);

  const token = getStoredToken();
  const res = await fetch(`${API_URL}/api/uploads/file`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || res.statusText || 'Upload failed', res.status);
  }

  return {
    url: data.url,
    key: data.key,
    type: data.type,
  };
}

export async function presignCreatorMediaUpload(
  filename: string,
  contentType: string,
  purpose: UploadPurpose,
  uploadSessionId?: string
) {
  const token = getStoredToken();
  const res = await fetch(`${API_URL}/api/uploads/presign`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ filename, contentType, purpose, uploadSessionId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || res.statusText || 'Presign failed', res.status);
  }

  return data as {
    uploadUrl: string;
    publicUrl: string;
    key: string;
    type: 'image' | 'video';
  };
}

export async function uploadCreatorMediaViaPresign(
  file: File,
  purpose: UploadPurpose,
  uploadSessionId?: string
): Promise<PortfolioMediaItem> {
  const presigned = await presignCreatorMediaUpload(
    file.name,
    file.type,
    purpose,
    uploadSessionId
  );

  const putRes = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!putRes.ok) {
    throw new ApiError('Failed to upload file to storage', putRes.status);
  }

  return {
    url: presigned.publicUrl,
    key: presigned.key,
    type: presigned.type,
  };
}
