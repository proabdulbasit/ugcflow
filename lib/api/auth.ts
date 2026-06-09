import { apiFetch, clearToken, saveToken, type ApiUser } from './client';

export interface AuthResponse {
  user: ApiUser;
  token?: string;
  applicationStatus?: string;
  message?: string;
}

export interface MeResponse {
  user: ApiUser;
  roleData: Record<string, unknown> | null;
}

type ApplyPayload = {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  websiteUrl?: string;
  brandGoals?: string;
  portfolioUrl?: string;
  bio?: string;
};

/** Submit brand application — does not log the user in. */
export async function applyBrand(data: Omit<ApplyPayload, 'portfolioUrl' | 'bio'> & {
  companyName: string;
  websiteUrl: string;
  brandGoals: string;
}) {
  clearToken();
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'brand' }),
  });
}

/** Submit creator application — does not log the user in. */
export async function applyCreator(data: Omit<ApplyPayload, 'companyName' | 'websiteUrl' | 'brandGoals'> & {
  portfolioUrl: string;
  bio: string;
}) {
  clearToken();
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'creator' }),
  });
}

export async function login(email: string, password: string) {
  const res = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.token) saveToken(res.token);
  return res;
}

export async function logout() {
  try {
    await apiFetch<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function getMe(token?: string | null) {
  return apiFetch<MeResponse>('/api/auth/me', { token });
}

export async function updateProfile(data: Record<string, unknown>, token?: string | null) {
  return apiFetch<{ ok: boolean }>('/api/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export function applicationStatusMessage(status: string | undefined, role: string) {
  if (status === 'pending') {
    return `Your ${role} application is pending admin approval. Please wait until an admin approves your account.`;
  }
  if (status === 'rejected') {
    return 'Your account was rejected by admin. Please contact support if you believe this is an error.';
  }
  return null;
}
