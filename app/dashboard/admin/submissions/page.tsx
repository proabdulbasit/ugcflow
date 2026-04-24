'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DeliverableRow = any;

export default function AdminSubmissionsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [query, setQuery] = useState('');

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Submissions', icon: Video, href: '/dashboard/admin/submissions' },
    { label: 'Messaging', icon: MessageSquare, href: '/dashboard/admin/messaging' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const fetchDeliverables = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let q = supabase
      .from('deliverables')
      .select(
        `
        *,
        campaigns (
          id,
          title,
          brands ( company_name )
        ),
        creators (
          id,
          profiles ( full_name, email )
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (statusFilter !== 'all') q = q.eq('status', statusFilter);

    const { data, error } = await q;
    if (error) alert(error.message);
    setDeliverables((data ?? []) as any);
    setLoading(false);
  }, [statusFilter, supabase]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const handleReview = useCallback(
    async (deliverableId: string, status: 'approved' | 'rejected') => {
      if (!supabase) return;

      const feedback =
        status === 'rejected'
          ? window.prompt('Optional feedback for the creator (shown in notification).', '') ?? undefined
          : undefined;

      setReviewingId(deliverableId);
      const { error } = await supabase.from('deliverables').update({ status, feedback }).eq('id', deliverableId);
      if (error) alert(error.message);

      const deliverable = deliverables.find((d) => d.id === deliverableId);
      const creatorEmail = deliverable?.creators?.profiles?.email;
      const creatorName = deliverable?.creators?.profiles?.full_name;
      const campaignTitle = deliverable?.campaigns?.title;

      if (creatorEmail) {
        await fetch('/api/notifications', {
          method: 'POST',
          body: JSON.stringify({
            type: 'DELIVERABLE_REVIEWED',
            data: {
              creatorEmail,
              creatorName,
              campaignTitle,
              status,
              feedback,
              campaignId: deliverable?.campaign_id,
            },
          }),
        });
      }

      setReviewingId(null);
      fetchDeliverables();
    },
    [deliverables, fetchDeliverables, supabase]
  );

  const filtered = deliverables.filter((d: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const creator = (d.creators?.profiles?.full_name ?? '').toLowerCase();
    const email = (d.creators?.profiles?.email ?? '').toLowerCase();
    const campaign = (d.campaigns?.title ?? '').toLowerCase();
    const brand = (d.campaigns?.brands?.company_name ?? '').toLowerCase();
    return creator.includes(q) || email.includes(q) || campaign.includes(q) || brand.includes(q);
  });

  const statusPill = (status: string) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        status === 'approved'
          ? 'bg-green-50 text-green-600'
          : status === 'rejected'
            ? 'bg-red-50 text-red-600'
            : 'bg-orange-50 text-orange-600'
      }`}
    >
      {status === 'approved' ? <CheckCircle2 size={14} /> : null}
      {status === 'rejected' ? <XCircle size={14} /> : null}
      {status === 'pending' ? <Clock size={14} /> : null}
      {status}
    </span>
  );

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-500 text-sm">Review creator deliverables across all campaigns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
            <Search size={18} />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creator, brand, or campaign…"
            className="flex-1 p-3 outline-none text-sm"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Creator</th>
              <th className="px-6 py-4">Campaign</th>
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  Loading submissions…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                  No submissions found.
                </td>
              </tr>
            ) : (
              filtered.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{d.creators?.profiles?.full_name ?? 'Creator'}</div>
                    <div className="text-xs text-gray-500">{d.creators?.profiles?.email ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{d.campaigns?.title ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{d.campaigns?.brands?.company_name ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">{statusPill(d.status ?? 'pending')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

