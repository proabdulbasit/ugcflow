'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CampaignBriefDetails from '@/components/CampaignBriefDetails';
import { getCreatorAssignment, submitDeliverable } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Upload, XCircle } from 'lucide-react';

export default function CreatorAssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [deliverable, setDeliverable] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const data = await getCreatorAssignment(id);
      const c = data.campaign;
      setCampaign(
        c
          ? {
              ...c,
              id: c.id ?? c._id?.toString(),
              payout_amount: c.payout_amount ?? c.payoutAmount,
            }
          : null
      );
      setDeliverable(data.deliverable ?? null);
      if (data.deliverable?.fileUrl) setFileUrl(data.deliverable.fileUrl);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !fileUrl.trim()) {
      toast.error('Please enter a video or file URL');
      return;
    }

    setSubmitting(true);
    try {
      await submitDeliverable(id, fileUrl.trim());
      toast.success('Deliverable submitted for review');
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !deliverable || deliverable.status === 'rejected';
  const status = deliverable?.status ?? 'not_started';

  return (
    <DashboardLayout role="Creator" navRole="creator">
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
              <div className="text-sm text-gray-500">
                Brand: <span className="font-medium text-gray-700">{campaign.brands?.company_name ?? '—'}</span>
                <span className="mx-2">·</span>
                Payout: <span className="font-medium text-gray-900">${campaign.payout_amount ?? campaign.payoutAmount ?? 89}</span>
              </div>
              <div>
                {status === 'approved' ? (
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
                )}
              </div>
            </div>

            <CampaignBriefDetails campaign={campaign} showTitle />

            {deliverable?.feedback ? (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="text-xs font-bold uppercase text-red-700 mb-1">Brand feedback</div>
                <p className="text-sm text-red-800 whitespace-pre-wrap">{deliverable.feedback}</p>
              </div>
            ) : null}

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Submit deliverable</h2>
              <p className="text-sm text-gray-500 mb-4">
                Paste a link to your video (Google Drive, Dropbox, Vimeo, etc.).
              </p>

              {deliverable?.fileUrl && status !== 'rejected' ? (
                <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold uppercase text-gray-500 mb-1">Submitted link</div>
                  <a
                    href={deliverable.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline break-all"
                  >
                    {deliverable.fileUrl}
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : null}

              {canSubmit ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="url"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Upload size={18} />
                    {submitting ? 'Submitting...' : deliverable?.status === 'rejected' ? 'Resubmit' : 'Submit for review'}
                  </button>
                </form>
              ) : status === 'pending' ? (
                <p className="text-sm text-gray-500">Your submission is awaiting brand review.</p>
              ) : status === 'approved' ? (
                <p className="text-sm text-green-600 font-medium">This deliverable has been approved. Great work!</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
