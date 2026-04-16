'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, CreditCard, LayoutDashboard, Settings, Video, XCircle } from 'lucide-react';

type Campaign = any;
type DeliverableRow = any;

export default function BrandCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/brand' },
    { label: 'My Campaigns', icon: Video, href: '/dashboard/brand/campaigns' },
    { label: 'Billing', icon: CreditCard, href: '/dashboard/brand/billing' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    if (!id) return;
    setLoading(true);

    const [{ data: campaignData, error: campaignError }, { data: deliverablesData, error: deliverablesError }] =
      await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id).single(),
        supabase
          .from('deliverables')
          .select('*, creators(id, profiles(full_name, email))')
          .eq('campaign_id', id)
          .order('created_at', { ascending: false }),
      ]);

    if (campaignError) alert(campaignError.message);
    setCampaign(campaignData ?? null);

    if (deliverablesError) alert(deliverablesError.message);
    setDeliverables(deliverablesData ?? []);

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    if (!supabase) return;
    fetchData();
  }, [fetchData, supabase]);

  const handleReview = useCallback(
    async (deliverableId: string, status: 'approved' | 'rejected') => {
      if (!supabase) return;
      if (!id || !campaign) return;

      const feedback =
        status === 'rejected'
          ? window.prompt('Optional feedback for the creator (shown in notification).', '') ?? undefined
          : undefined;

      setReviewingId(deliverableId);
      const { error } = await supabase.from('deliverables').update({ status, feedback }).eq('id', deliverableId);

      if (error) {
        alert(error.message);
        setReviewingId(null);
        return;
      }

      const deliverable = deliverables.find((d) => d.id === deliverableId);
      const creatorEmail = deliverable?.creators?.profiles?.email;
      const creatorName = deliverable?.creators?.profiles?.full_name;

      if (creatorEmail) {
        await fetch('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            type: 'DELIVERABLE_REVIEWED',
            data: {
              creatorEmail,
              creatorName,
              campaignTitle: campaign.title,
              status,
              feedback,
              campaignId: id,
            },
          }),
        });
      }

      setReviewingId(null);
      fetchData();
    },
    [campaign, deliverables, fetchData, id, supabase]
  );

  if (!supabase) {
    return (
      <DashboardLayout role="Brand" items={sidebarItems}>
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
    <DashboardLayout role="Brand" items={sidebarItems}>
      <div className="mb-6">
        <Link
          href="/dashboard/brand/campaigns"
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              {campaign.brief ? <p className="text-gray-600 mt-2 whitespace-pre-wrap">{campaign.brief}</p> : null}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Deliverables</h2>
                <div className="text-xs text-gray-500">{deliverables.length} total</div>
              </div>

              {deliverables.length === 0 ? (
                <div className="text-gray-400 italic">No deliverables submitted yet.</div>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-xl border border-gray-100"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {d.creators?.profiles?.full_name ?? 'Creator'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{d.creators?.profiles?.email ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            d.status === 'approved'
                              ? 'bg-green-50 text-green-600'
                              : d.status === 'rejected'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          {d.status === 'approved' ? <CheckCircle2 size={14} /> : null}
                          {d.status === 'rejected' ? <XCircle size={14} /> : null}
                          {d.status === 'pending' ? <Clock size={14} /> : null}
                          {d.status ?? 'pending'}
                        </span>

                        <button
                          onClick={() => handleReview(d.id, 'approved')}
                          disabled={reviewingId === d.id || d.status === 'approved'}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(d.id, 'rejected')}
                          disabled={reviewingId === d.id || d.status === 'rejected'}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
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
