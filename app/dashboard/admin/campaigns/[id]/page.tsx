'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, LayoutDashboard, Settings, Users, Video } from 'lucide-react';

type Campaign = any;
type CreatorRow = any;

export default function AdminCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [availableCreators, setAvailableCreators] = useState<CreatorRow[]>([]);
  const [assigningCreatorId, setAssigningCreatorId] = useState<string | null>(null);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    if (!id) return;
    setLoading(true);

    const [{ data: campaignData, error: campaignError }, { data: creatorsData, error: creatorsError }] =
      await Promise.all([
        supabase.from('campaigns').select('*, brands(company_name)').eq('id', id).single(),
        supabase.from('creators').select('id, profiles(full_name, email), status').eq('status', 'approved').limit(100),
      ]);

    if (campaignError) {
      alert(campaignError.message);
    } else {
      setCampaign(campaignData ?? null);
    }

    if (creatorsError) {
      alert(creatorsError.message);
    } else {
      setAvailableCreators(creatorsData ?? []);
    }

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    if (!supabase) return;
    fetchData();
  }, [fetchData, supabase]);

  const assignCreator = useCallback(
    async (creatorId: string) => {
      if (!supabase) return;
      if (!id || !campaign) return;
      setAssigningCreatorId(creatorId);

      const { error } = await supabase.from('campaign_creators').insert({ campaign_id: id, creator_id: creatorId });
      if (error) {
        alert(error.message);
        setAssigningCreatorId(null);
        return;
      }

      const creator = availableCreators.find((c) => c.id === creatorId);
      const creatorEmail = creator?.profiles?.email;
      const creatorName = creator?.profiles?.full_name;

      if (creatorEmail) {
        await fetch('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            type: 'CREATOR_ASSIGNED',
            data: {
              creatorEmail,
              creatorName,
              campaignTitle: campaign.title,
              campaignId: id,
            },
          }),
        });
      }

      setAssigningCreatorId(null);
      fetchData();
    },
    [availableCreators, campaign, fetchData, id, supabase]
  );

  if (!supabase) {
    return (
      <DashboardLayout role="Admin" items={sidebarItems}>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-900 font-bold mb-1">Missing Supabase env</div>
          <div className="text-sm text-gray-500">
            Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to use this page.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="mb-6">
        <Link
          href="/dashboard/admin/campaigns"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : !campaign ? (
          <div className="text-gray-500">Campaign not found.</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
                <div className="text-sm text-gray-500 mt-1">
                  Brand: <span className="font-medium text-gray-700">{campaign.brands?.company_name ?? '—'}</span>
                </div>
                {campaign.brief ? <p className="text-gray-600 mt-3 whitespace-pre-wrap">{campaign.brief}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    campaign.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : campaign.status === 'completed'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {campaign.status ?? 'unknown'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Assign a creator</h2>
              {availableCreators.length === 0 ? (
                <div className="text-gray-400 italic">No approved creators found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{creator.profiles?.full_name ?? 'Unnamed creator'}</div>
                        <div className="text-xs text-gray-500">{creator.profiles?.email ?? '—'}</div>
                      </div>
                      <button
                        onClick={() => assignCreator(creator.id)}
                        disabled={assigningCreatorId === creator.id}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {assigningCreatorId === creator.id ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
