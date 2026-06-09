'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Search, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { browseCampaigns, applyToCampaign } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { formatPlatform, formatVideoFormat } from '@/lib/campaign-brief';
import { toast } from '@/lib/toast';

export default function CreatorBrowse() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { campaigns: campaignData } = await browseCampaigns();
      setCampaigns(
        campaignData.map((c: any) => ({
          ...c,
          id: c.id ?? c._id?.toString(),
          created_at: c.created_at ?? c.createdAt,
          brands: c.brands ?? (c.brand ? { company_name: c.brand.companyName } : null),
        }))
      );
      setAppliedIds(new Set(campaignData.filter((c: any) => c.hasApplied).map((c: any) => c.id ?? c._id?.toString())));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (campaignId: string) => {
    try {
      await applyToCampaign(campaignId);
      setAppliedIds((prev) => new Set(prev).add(campaignId));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to apply');
    }
  };

  return (
    <DashboardLayout role="Creator" navRole="creator">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Open Campaigns</h1>
        <p className="text-gray-500 text-sm">Vetted creator opportunities managed by the UGCFlow team.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading campaigns...</div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center text-red-700">{error}</div>
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
                  $89 / video
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {campaign.targetPlatform ? (
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {formatPlatform(campaign.targetPlatform)}
                  </span>
                ) : null}
                {campaign.videoFormat ? (
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {formatVideoFormat(campaign.videoFormat)}
                  </span>
                ) : null}
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {campaign.brief}
              </p>

              {campaign.referenceVideoUrl ? (
                <a
                  href={campaign.referenceVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 font-medium hover:underline mb-4 inline-block"
                >
                  View reference video →
                </a>
              ) : null}

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
