'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CampaignBriefDetails from '@/components/CampaignBriefDetails';
import { assignCreatorToCampaign, getAdminCampaign } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

function mapCreator(c: any) {
  return {
    ...c,
    profiles: c.profiles
      ? {
          full_name: c.profiles.full_name ?? c.profiles.fullName,
          email: c.profiles.email,
        }
      : null,
  };
}

export default function AdminCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [assignedCreators, setAssignedCreators] = useState<any[]>([]);
  const [availableCreators, setAvailableCreators] = useState<any[]>([]);
  const [assigningCreatorId, setAssigningCreatorId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const data = await getAdminCampaign(id);
      const c = data.campaign;
      setCampaign(
        c
          ? {
              ...c,
              id: c.id ?? c._id?.toString(),
              brands: data.brand ? { company_name: data.brand.companyName } : c.brands,
            }
          : null
      );
      setApplicants((data.applicants ?? []).map(mapCreator));
      setAssignedCreators((data.assignedCreators ?? []).map(mapCreator));
      setAvailableCreators((data.availableCreators ?? []).map(mapCreator));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignCreator = useCallback(
    async (creatorId: string) => {
      if (!id || !campaign) return;
      setAssigningCreatorId(creatorId);

      try {
        await assignCreatorToCampaign(id, creatorId);

        const creator =
          applicants.find((c) => c.id === creatorId) ??
          availableCreators.find((c) => c.id === creatorId);
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

        toast.success('Creator assigned to campaign');
        fetchData();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to assign creator');
      } finally {
        setAssigningCreatorId(null);
      }
    },
    [applicants, availableCreators, campaign, fetchData, id]
  );

  const renderAssignButton = (creator: any) => {
    if (creator.isAssigned) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-bold">
          <CheckCircle2 size={16} /> Assigned
        </span>
      );
    }
    return (
      <button
        onClick={() => assignCreator(creator.id)}
        disabled={assigningCreatorId === creator.id}
        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
      >
        {assigningCreatorId === creator.id ? 'Assigning…' : 'Assign'}
      </button>
    );
  };

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="mb-6">
        <Link
          href="/dashboard/admin/campaigns"
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
            <div className="text-sm text-gray-500 mt-1">
              Brand: <span className="font-medium text-gray-700">{campaign.brands?.company_name ?? '—'}</span>
            </div>

            <CampaignBriefDetails campaign={campaign} showTitle />

            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Campaign applicants</h2>
              {applicants.length === 0 ? (
                <div className="text-gray-400 italic">No creator applications yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applicants.map((creator) => (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/30"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{creator.profiles?.full_name ?? 'Unnamed creator'}</div>
                        <div className="text-xs text-gray-500">{creator.profiles?.email ?? '—'}</div>
                        <div className="text-[10px] font-bold uppercase text-indigo-600 mt-1">Applied</div>
                      </div>
                      {renderAssignButton(creator)}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Assigned creators</h2>
              {assignedCreators.length === 0 ? (
                <div className="text-gray-400 italic">No creators assigned yet.</div>
              ) : (
                <div className="space-y-2">
                  {assignedCreators.map((creator) => (
                    <div key={creator.id} className="p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{creator.profiles?.full_name ?? 'Unnamed creator'}</div>
                        <div className="text-xs text-gray-500">{creator.profiles?.email ?? '—'}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {creator.deliverable
                          ? `Deliverable: ${creator.deliverable.status}`
                          : 'Awaiting submission'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-3">All approved creators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{creator.profiles?.full_name ?? 'Unnamed creator'}</div>
                      <div className="text-xs text-gray-500">{creator.profiles?.email ?? '—'}</div>
                    </div>
                    {renderAssignButton(creator)}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
