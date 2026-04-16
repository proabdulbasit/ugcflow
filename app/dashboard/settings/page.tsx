'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, CreditCard, Settings, User, Globe, Briefcase, Save, Search, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      if (profileData?.role === 'creator') {
        const { data } = await supabase.from('creators').select('*').eq('id', user.id).single();
        setRoleData(data);
      } else if (profileData?.role === 'brand') {
        const { data } = await supabase.from('brands').select('*').eq('id', user.id).single();
        setRoleData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update Profile
    await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id);

    // Update Role Specific Data
    if (profile.role === 'creator') {
      await supabase.from('creators').update({
        portfolio_url: roleData.portfolio_url,
        bio: roleData.bio
      }).eq('id', user.id);
    } else if (profile.role === 'brand') {
      await supabase.from('brands').update({
        company_name: roleData.company_name,
        website_url: roleData.website_url
      }).eq('id', user.id);
    }

    setSaving(false);
    alert('Settings saved successfully!');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const sidebarItems = profile.role === 'admin' ? [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: User, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: User, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ] : profile.role === 'brand' ? [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ] : [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <DashboardLayout role={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} items={sidebarItems}>
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
                      value={roleData.company_name || ''} 
                      onChange={(e) => setRoleData({...roleData, company_name: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input 
                      type="url" 
                      value={roleData.website_url || ''} 
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
                      value={roleData.portfolio_url || ''} 
                      onChange={(e) => setRoleData({...roleData, portfolio_url: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      value={roleData.bio || ''} 
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
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex并发 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
