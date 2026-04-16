'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, DollarSign, LayoutDashboard, Search, Video, XCircle } from 'lucide-react';

type Campaign = any;
type DeliverableRow = any;

export default function CreatorAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [deliverable, setDeliverable] = useState<DeliverableRow | null>(null);

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/creator' },
    { label: 'Browse Jobs', icon: Search, href: '/dashboard/creator/browse' },
    { label: 'My Assignments', icon: Video, href: '/dashboard/creator/assignments' },
    { label: 'Earnings', icon: DollarSign, href: '/dashboard/creator/earnings' },
  ];

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    if (!id) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: campaignData, error: campaignError }, { data: deliverableData, error: deliverableError }] =
      await Promise.all([
        supabase.from('campaigns').select('*, brands(company_name)').eq('id', id).single(),
        supabase
          .from('deliverables')
          .select('*')
          .eq('campaign_id', id)
          .eq('creator_id', user.id)
          .maybeSingle(),
      ]);

    if (campaignError) alert(campaignError.message);
    setCampaign(campaignData ?? null);

    if (deliverableError) alert(deliverableError.message);
    setDeliverable(deliverableData ?? null);

    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    if (!supabase) return;
    fetchData();
  }, [fetchData, supabase]);

  const status = deliverable?.status ?? 'not_started';
  const statusBadge =
    status === 'approved' ? (
      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
        <CheckCircle2 size={14} /> Approved
      </span>
    ) : status === 'pending' ? (
      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
        <Clock size={14} /> Pending Review
      </span>
    ) : status === 'rejected' ? (
      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
        <XCircle size={14} /> Revision Requested
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
        Not Started
      </span>
    );

  if (!supabase) {
    return (
      <DashboardLayout role="Creator" items={sidebarItems}>
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
    <DashboardLayout role="Creator" items={sidebarItems}>
      <div className="mb-6">
        <Link
          href="/dashboard/creator/assignments"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Assignments
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : !campaign ? (
          <div className="text-gray-500">Assignment not found.</div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
                <div className="text-sm text-indigo-600 font-medium mt-1">{campaign.brands?.company_name ?? '—'}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-2">
                  Payout: <span className="text-gray-900">${campaign.payout_amount ?? '—'}</span>
                </div>
              </div>
              <div>{statusBadge}</div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Deliverable</h2>
              {deliverable ? (
                <div className="text-sm text-gray-600">
                  Status: <span className="font-medium text-gray-900">{deliverable.status}</span>
                  {deliverable.feedback ? (
                    <div className="mt-2 p-3 rounded-xl bg-gray-50 text-gray-700 whitespace-pre-wrap">
                      {deliverable.feedback}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  You haven’t submitted anything yet. (Deliverable submission UI can be added here.)
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
