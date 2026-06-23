'use client';
import DashboardLayout from '@/components/DashboardLayout';
import CreatorPortfolioUpload from '@/components/CreatorPortfolioUpload';
import { User, Globe, Briefcase, Save, CreditCard, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMe, updateProfile } from '@/lib/api/auth';
import type { PortfolioMediaItem } from '@/lib/api/uploads';
import { ApiError } from '@/lib/api/client';
import { MIN_PORTFOLIO_ITEMS } from '@/lib/creator-portfolio';
import { toast } from '@/lib/toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { user, roleData: rd } = await getMe();
        setProfile({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
        });
        if (rd) {
          if (user.role === 'creator') {
            setRoleData({
              portfolio_url: rd.portfolioUrl,
              profile_picture_url: rd.profilePictureUrl,
              portfolio_media: (rd.portfolioMedia as PortfolioMediaItem[]) ?? [],
              bio: rd.bio,
              address: rd.address,
              abn: rd.abn ?? '',
              payout_paypal_email: rd.payoutPaypalEmail ?? '',
              payout_bank_name: rd.payoutBankName ?? '',
              payout_bank_account_name: rd.payoutBankAccountName ?? '',
              payout_bank_bsb: rd.payoutBankBsb ?? '',
              payout_bank_account_number: rd.payoutBankAccountNumber ?? '',
            });
          } else if (user.role === 'brand') {
            setRoleData({
              company_name: rd.companyName,
              website_url: rd.websiteUrl,
              abn: rd.abn ?? '',
            });
          }
        } else {
          setRoleData({});
        }
      } catch (err) {
        if (err instanceof ApiError) console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        fullName: profile.full_name,
      };

      if (profile.role === 'creator') {
        if ((roleData.portfolio_media?.length ?? 0) < MIN_PORTFOLIO_ITEMS) {
          toast.error(`Upload at least ${MIN_PORTFOLIO_ITEMS} portfolio samples.`);
          setSaving(false);
          return;
        }
        payload.portfolioUrl = roleData.portfolio_url;
        payload.profilePictureUrl = roleData.profile_picture_url;
        payload.portfolioMedia = roleData.portfolio_media;
        payload.bio = roleData.bio;
        payload.address = roleData.address;
        payload.abn = roleData.abn;
        payload.payoutPaypalEmail = roleData.payout_paypal_email;
        payload.payoutBankName = roleData.payout_bank_name;
        payload.payoutBankAccountName = roleData.payout_bank_account_name;
        payload.payoutBankBsb = roleData.payout_bank_bsb;
        payload.payoutBankAccountNumber = roleData.payout_bank_account_number;
      } else if (profile.role === 'brand') {
        payload.companyName = roleData.company_name;
        payload.websiteUrl = roleData.website_url;
        payload.abn = roleData.abn;
      }

      await updateProfile(payload);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <div className="p-8 text-center">Loading...</div>;

  const navRole = profile.role as 'admin' | 'brand' | 'creator';

  return (
    <DashboardLayout role={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} navRole={navRole}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              Personal Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
            {profile.role !== 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ABN (Australian Business Number)
                </label>
                <input
                  type="text"
                  value={roleData?.abn || ''}
                  onChange={(e) => setRoleData({ ...roleData, abn: e.target.value })}
                  placeholder="Optional — 11 digits"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Optional. Visible to you and UGCFlow admin only.</p>
              </div>
            ) : null}
          </div>

          {profile.role !== 'admin' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {profile.role === 'brand' ? (
                  <Globe size={18} className="text-indigo-600" />
                ) : (
                  <Briefcase size={18} className="text-indigo-600" />
                )}
                {profile.role === 'brand' ? 'Company Details' : 'Creator Profile'}
              </h3>

              {profile.role === 'brand' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={roleData?.company_name || ''}
                      onChange={(e) => setRoleData({ ...roleData, company_name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={roleData?.website_url || ''}
                      onChange={(e) => setRoleData({ ...roleData, website_url: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <CreatorPortfolioUpload
                    profilePictureUrl={roleData?.profile_picture_url || ''}
                    onProfilePictureChange={(url) => setRoleData({ ...roleData, profile_picture_url: url })}
                    portfolioMedia={roleData?.portfolio_media || []}
                    onPortfolioChange={(items) => setRoleData({ ...roleData, portfolio_media: items })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Details</label>
                    <textarea
                      value={roleData?.address || ''}
                      onChange={(e) => setRoleData({ ...roleData, address: e.target.value })}
                      placeholder="Street address, city, state/province, postal code, country"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Lock size={12} />
                      Private until a brand accepts you for a campaign — then the brand and admin can view.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    <input
                      type="url"
                      value={roleData?.portfolio_url || ''}
                      onChange={(e) => setRoleData({ ...roleData, portfolio_url: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={roleData?.bio || ''}
                      onChange={(e) => setRoleData({ ...roleData, bio: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {profile.role === 'creator' ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                Payout Details
              </h3>
              <p className="text-sm text-gray-600">
                Add PayPal or bank details for creator payouts. Payouts are made within{' '}
                <strong>5 business days</strong> of content approval.
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock size={12} />
                Private — only you and UGCFlow admin can view these details.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                <input
                  type="email"
                  value={roleData?.payout_paypal_email || ''}
                  onChange={(e) => setRoleData({ ...roleData, payout_paypal_email: e.target.value })}
                  placeholder="you@paypal.com"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-bold">Or bank transfer</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={roleData?.payout_bank_name || ''}
                    onChange={(e) => setRoleData({ ...roleData, payout_bank_name: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={roleData?.payout_bank_account_name || ''}
                    onChange={(e) => setRoleData({ ...roleData, payout_bank_account_name: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BSB</label>
                  <input
                    type="text"
                    value={roleData?.payout_bank_bsb || ''}
                    onChange={(e) => setRoleData({ ...roleData, payout_bank_bsb: e.target.value })}
                    placeholder="000-000"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={roleData?.payout_bank_account_number || ''}
                    onChange={(e) => setRoleData({ ...roleData, payout_bank_account_number: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <button
            disabled={saving}
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
