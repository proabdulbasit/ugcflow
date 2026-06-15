'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CampaignBriefDetails from '@/components/CampaignBriefDetails';
import { getBrandCampaign, reviewDeliverable } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Users, XCircle } from 'lucide-react';

function mapDeliverable(d: any) {
  return {
    ...d,
    id: d.id ?? d._id?.toString(),
    created_at: d.created_at ?? d.createdAt,
    creators: d.creators ?? null,
  };
}

export default function BrandCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const data = await getBrandCampaign(id);
      const c = data.campaign;
      setCampaign(c ? { ...c, id: c.id ?? c._id?.toString() } : null);
      setDeliverables((data.deliverables ?? []).map(mapDeliverable));
      setApplications(data.applications ?? []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReview = useCallback(
    async (deliverableId: string, status: 'approved' | 'rejected') => {
      if (!id || !campaign) return;

      const feedback =
        status === 'rejected'
          ? window.prompt('Optional feedback for the creator (shown in notification).', '') ?? undefined
          : undefined;

      setReviewingId(deliverableId);
      try {
        await reviewDeliverable(deliverableId, status, feedback);

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

        toast.success(status === 'approved' ? 'Deliverable approved' : 'Deliverable rejected');
        fetchData();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Review failed');
      } finally {
        setReviewingId(null);
      }
    },
    [campaign, deliverables, fetchData, id]
  );

  return (
    <DashboardLayout role="Brand" navRole="brand">
      <div className="mb-6">
        <Link
          href="/dashboard/brand/campaigns"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : !campaign ? (
          <div className="text-gray-500">Campaign not found.</div>
        ) : (
          <>
            <CampaignBriefDetails campaign={campaign} showTitle />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-gray-900">Creator sourcing</h2>
                <span className="text-xs text-gray-500">({applications.length})</span>
              </div>
              {applications.length === 0 ? (
                <div className="text-gray-400 italic text-sm">
                  Our team is sourcing vetted creators for your brief. You&apos;ll see matched creators here once assigned.
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{app.creators?.profiles?.full_name ?? 'Creator'}</div>
                        <div className="text-xs text-gray-500">{app.creators?.profiles?.email ?? '—'}</div>
                        {app.creators?.profiles?.address ? (
                          <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                            {app.creators.profiles.address}
                          </div>
                        ) : null}
                        {app.creators?.profiles?.portfolio_url ? (
                          <a
                            href={app.creators.profiles.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View portfolio <ExternalLink size={12} />
                          </a>
                        ) : null}
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                UGCFlow manages creator matching and briefing — you review finished video ads below.
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Video deliverables</h2>
                <div className="text-xs text-gray-500">{deliverables.length} total</div>
              </div>

              {deliverables.length === 0 ? (
                <div className="text-gray-400 italic text-sm">No deliverables submitted yet.</div>
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
                        {d.fileUrl ? (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-2 break-all"
                          >
                            View submission <ExternalLink size={12} />
                          </a>
                        ) : null}
                        <div className="text-xs text-gray-500 mt-1">
                          Submitted: {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
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
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
