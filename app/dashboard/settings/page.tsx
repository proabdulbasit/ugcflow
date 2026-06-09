'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Globe, Briefcase, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMe, updateProfile } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
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
              bio: rd.bio,
            });
          } else if (user.role === 'brand') {
            setRoleData({
              company_name: rd.companyName,
              website_url: rd.websiteUrl,
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
        payload.portfolioUrl = roleData.portfolio_url;
        payload.bio = roleData.bio;
      } else if (profile.role === 'brand') {
        payload.companyName = roleData.company_name;
        payload.websiteUrl = roleData.website_url;
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
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" disabled value={profile.email} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          {profile.role !== 'admin' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                {profile.role === 'brand' ? <Globe size={18} className="text-indigo-600" /> : <Briefcase size={18} className="text-indigo-600" />}
                {profile.role === 'brand' ? 'Company Details' : 'Creator Profile'}
              </h3>
              
              {profile.role === 'brand' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={roleData?.company_name || ''} 
                      onChange={(e) => setRoleData({...roleData, company_name: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input 
                      type="url" 
                      value={roleData?.website_url || ''} 
                      onChange={(e) => setRoleData({...roleData, website_url: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                    <input 
                      type="url" 
                      value={roleData?.portfolio_url || ''} 
                      onChange={(e) => setRoleData({...roleData, portfolio_url: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      value={roleData?.bio || ''} 
                      onChange={(e) => setRoleData({...roleData, bio: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                    />
                  </div>
                </>
              )}
            </div>
          )}

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
