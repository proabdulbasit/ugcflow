import { apiFetch } from './client';

// Auth re-exports
export * from './auth';

// Packages
export async function getPackages() {
  return apiFetch<{ packages: any[] }>('/api/packages');
}

export async function getPackage(id: string) {
  return apiFetch<any>(`/api/packages/${id}`);
}

// Brand
export async function getBrandOverview() {
  return apiFetch<any>('/api/brands/overview');
}

export async function getBrandCampaigns() {
  return apiFetch<{ campaigns: any[] }>('/api/brands/campaigns');
}

export async function getBrandCampaign(id: string) {
  return apiFetch<any>(`/api/brands/campaigns/${id}`);
}

export async function createBrandCampaign(data: {
  title: string;
  brief: string;
  referenceVideoUrl?: string;
  productUrl?: string;
  targetPlatform?: string;
  videoFormat?: string;
  talkingPoints?: string;
  dosAndDonts?: string;
}) {
  return apiFetch<any>('/api/brands/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getBrandBilling() {
  return apiFetch<any>('/api/brands/billing');
}

// Creator
export async function getCreatorOverview() {
  return apiFetch<any>('/api/creators/overview');
}

export async function browseCampaigns() {
  return apiFetch<{ campaigns: any[] }>('/api/creators/browse');
}

export async function applyToCampaign(campaignId: string) {
  return apiFetch<any>('/api/creators/applications', {
    method: 'POST',
    body: JSON.stringify({ campaignId }),
  });
}

export async function getCreatorAssignments() {
  return apiFetch<{ assignments: any[] }>('/api/creators/assignments');
}

export async function getCreatorAssignment(campaignId: string) {
  return apiFetch<any>(`/api/creators/assignments/${campaignId}`);
}

export async function getCreatorEarnings() {
  return apiFetch<{ earnings: any[] }>('/api/creators/earnings');
}

// Admin
export async function getAdminOverview() {
  return apiFetch<any>('/api/admin/overview');
}

export async function getAdminCreators() {
  return apiFetch<{ creators: any[] }>('/api/creators');
}

export async function updateCreatorStatus(id: string, status: 'approved' | 'rejected') {
  return apiFetch<any>(`/api/creators/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminBrands() {
  return apiFetch<{ brands: any[] }>('/api/brands');
}

export async function updateBrandStatus(id: string, status: 'approved' | 'rejected') {
  return apiFetch<any>(`/api/brands/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminCampaigns() {
  return apiFetch<{ campaigns: any[] }>('/api/campaigns');
}

export async function getAdminCampaign(id: string) {
  return apiFetch<any>(`/api/campaigns/${id}`);
}

export async function assignCreatorToCampaign(campaignId: string, creatorId: string) {
  return apiFetch<any>(`/api/campaigns/${campaignId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ creatorId }),
  });
}

export async function getAdminSubmissions(status?: string) {
  const q = status && status !== 'all' ? `?status=${status}` : '';
  return apiFetch<{ deliverables: any[] }>(`/api/deliverables/admin${q}`);
}

export async function submitDeliverable(campaignId: string, fileUrl: string) {
  return apiFetch<any>('/api/deliverables', {
    method: 'POST',
    body: JSON.stringify({ campaignId, fileUrl }),
  });
}

export async function reviewDeliverable(id: string, status: 'approved' | 'rejected', feedback?: string) {
  return apiFetch<any>(`/api/deliverables/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, feedback }),
  });
}

export async function getAdminPayments() {
  return apiFetch<{ payments: any[] }>('/api/payments/admin');
}

export async function getAdminProfiles() {
  return apiFetch<{ profiles: any[] }>('/api/users/profiles');
}
