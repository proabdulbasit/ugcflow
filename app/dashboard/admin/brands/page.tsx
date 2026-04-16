'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Search, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CreatorBrowse() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch active campaigns
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('*, brands(company_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    // 2. Fetch existing applications for this creator
    const { data: applications } = await supabase
      .from('campaign_applications')
      .select('campaign_id')
      .eq('creator_id', user.id);

    if (campaignData) setCampaigns(campaignData);
    if (applications) {
      setAppliedIds(new Set(applications.map((a: any) => a.campaign_id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (campaignId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        creator_id: user.id,
        status: 'pending'
      });

    if (error) {
      alert(error.message);
    } else {
      setAppliedIds(prev => new Set(prev).add(campaignId));
    }
  };

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
  ];

  return (
    <DashboardLayout role="Creator" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Open Campaigns</h1>
        <p className="text-gray-500 text-sm">Find brands looking for creators like you.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900">No active campaigns</h3>
          <p className="text-gray-500">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{campaign.title}</h3>
                  <div className="text-indigo-600 text-sm font-medium">{campaign.brands?.company_name}</div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  ${campaign.payout_amount || 150} / video
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3 mb-6">
                {campaign.brief}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="text-xs text-gray-400">
                  Posted {new Date(campaign.created_at).toLocaleDateString()}
                </div>
                {appliedIds.has(campaign.id) ? (
                  <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    Applied
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApply(campaign.id)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
