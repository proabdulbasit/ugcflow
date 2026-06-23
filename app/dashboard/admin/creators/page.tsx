'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Check, ExternalLink, Film, ImageIcon, Search, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { getAdminCreators, updateCreatorStatus } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';

type CreatorRow = any;

function mapCreator(c: any): CreatorRow {
  return {
    ...c,
    created_at: c.created_at ?? c.createdAt,
    profiles: c.profiles
      ? {
          full_name: c.profiles.full_name ?? c.profiles.fullName,
          email: c.profiles.email,
        }
      : null,
    address: c.address,
    abn: c.abn,
    payoutPaypalEmail: c.payoutPaypalEmail,
    payoutBankName: c.payoutBankName,
    payoutBankAccountName: c.payoutBankAccountName,
    payoutBankBsb: c.payoutBankBsb,
    payoutBankAccountNumber: c.payoutBankAccountNumber,
    profilePictureUrl: c.profilePictureUrl,
    portfolioMedia: c.portfolioMedia ?? [],
    bio: c.bio,
    portfolioUrl: c.portfolioUrl,
  };
}

function DetailField({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{children}</dd>
    </div>
  );
}

function CreatorDetailModal({
  creator,
  updatingId,
  onClose,
  onUpdateStatus,
}: {
  creator: CreatorRow;
  updatingId: string | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
}) {
  const portfolioCount = creator.portfolioMedia?.length ?? 0;
  const imageCount = creator.portfolioMedia?.filter((item: any) => item.type === 'image').length ?? 0;
  const videoCount = creator.portfolioMedia?.filter((item: any) => item.type === 'video').length ?? 0;

  const statusBadge = (status: string) => (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        status === 'approved'
          ? 'bg-green-50 text-green-600'
          : status === 'rejected'
            ? 'bg-red-50 text-red-600'
            : 'bg-orange-50 text-orange-600'
      }`}
    >
      {status}
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Creator Application</h2>
            <p className="text-sm text-gray-500">Review profile details and portfolio samples</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
              {creator.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creator.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
                  No photo
                </div>
              )}
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 flex-1">
              <DetailField label="Name">
                {creator.profiles?.full_name?.trim() || '—'}
              </DetailField>
              <DetailField label="Email">
                {creator.profiles?.email ? (
                  <a href={`mailto:${creator.profiles.email}`} className="text-indigo-600 hover:underline">
                    {creator.profiles.email}
                  </a>
                ) : (
                  '—'
                )}
              </DetailField>
              <DetailField label="Status">{statusBadge(creator.status ?? 'pending')}</DetailField>
              <DetailField label="Applied">
                {creator.created_at ? new Date(creator.created_at).toLocaleString() : '—'}
              </DetailField>
              <DetailField label="Portfolio URL" className="sm:col-span-2">
                {creator.portfolioUrl ? (
                  <a
                    href={creator.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline break-all"
                  >
                    {creator.portfolioUrl}
                    <ExternalLink size={14} className="shrink-0" />
                  </a>
                ) : (
                  '—'
                )}
              </DetailField>
              <DetailField label="Shipping Details" className="sm:col-span-2">
                <span className="whitespace-pre-wrap">{creator.address?.trim() || '—'}</span>
              </DetailField>
              <DetailField label="ABN">
                {creator.abn?.trim() || '—'}
              </DetailField>
              <DetailField label="Bio" className="sm:col-span-2">
                <span className="whitespace-pre-wrap">{creator.bio?.trim() || '—'}</span>
              </DetailField>
              <DetailField label="Portfolio Samples">
                {portfolioCount > 0 ? (
                  <span>
                    {portfolioCount} uploaded
                    <span className="text-gray-500">
                      {' '}
                      ({imageCount} image{imageCount === 1 ? '' : 's'}, {videoCount} video
                      {videoCount === 1 ? '' : 's'})
                    </span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">None uploaded</span>
                )}
              </DetailField>
              <DetailField label="Profile Picture">
                {creator.profilePictureUrl ? (
                  <span className="text-green-700 font-medium">Uploaded</span>
                ) : (
                  <span className="text-gray-500">Not provided</span>
                )}
              </DetailField>
            </dl>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Portfolio Gallery</h3>
              <span className="text-xs font-bold text-gray-500">{portfolioCount} / 10 samples</span>
            </div>

            {portfolioCount === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No portfolio samples uploaded.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {creator.portfolioMedia.map((item: any, index: number) => (
                  <div
                    key={`${item.key}-${index}`}
                    className="relative rounded-xl overflow-hidden border border-gray-100 aspect-[4/5] bg-gray-50"
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} controls className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={`Portfolio sample ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center gap-1">
                      {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                      Sample {index + 1} · {item.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Private — Payout Details</h3>
            <p className="text-xs text-gray-600">
              Payouts are made within 5 business days of content approval.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <DetailField label="PayPal Email">
                {creator.payoutPaypalEmail ? (
                  <a href={`mailto:${creator.payoutPaypalEmail}`} className="text-indigo-600 hover:underline">
                    {creator.payoutPaypalEmail}
                  </a>
                ) : (
                  '—'
                )}
              </DetailField>
              <DetailField label="Bank Name">{creator.payoutBankName?.trim() || '—'}</DetailField>
              <DetailField label="Account Name">{creator.payoutBankAccountName?.trim() || '—'}</DetailField>
              <DetailField label="BSB">{creator.payoutBankBsb?.trim() || '—'}</DetailField>
              <DetailField label="Account Number">{creator.payoutBankAccountNumber?.trim() || '—'}</DetailField>
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onUpdateStatus(creator.id, 'approved')}
              disabled={updatingId === creator.id || creator.status === 'approved'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={18} /> Approve Creator
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(creator.id, 'rejected')}
              disabled={updatingId === creator.id || creator.status === 'rejected'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
            >
              <X size={18} /> Reject Creator
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 sm:ml-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<CreatorRow | null>(null);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { creators: data } = await getAdminCreators();
      setCreators(data.map(mapCreator));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleUpdateCreatorStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await updateCreatorStatus(id, status);
      fetchCreators();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = creators.filter((c: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const name = (c.profiles?.full_name ?? '').toLowerCase();
    const email = (c.profiles?.email ?? '').toLowerCase();
    const status = (c.status ?? '').toLowerCase();
    const address = (c.address ?? '').toLowerCase();
    const abn = (c.abn ?? '').toLowerCase();
    return name.includes(q) || email.includes(q) || status.includes(q) || address.includes(q) || abn.includes(q);
  });

  const statusBadge = (status: string) => (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        status === 'approved'
          ? 'bg-green-50 text-green-600'
          : status === 'rejected'
            ? 'bg-red-50 text-red-600'
            : 'bg-orange-50 text-orange-600'
      }`}
    >
      {status}
    </span>
  );

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Creators</h1>
        <p className="text-gray-500 text-sm">Approve or reject creator applications. Click View Profile to see ABN and full details.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          <Search size={18} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or status…"
          className="flex-1 p-3 outline-none text-sm"
        />
        <button
          onClick={fetchCreators}
          className="px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[920px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Creator</th>
              <th className="px-6 py-4">ABN</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Portfolio</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Applied</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                  Loading creators…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">
                  No creators found.
                </td>
              </tr>
            ) : (
              filtered.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{c.profiles?.full_name ?? 'Unnamed creator'}</div>
                    <div className="text-xs text-gray-500">{c.profiles?.email ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.abn?.trim() ? (
                      <div className="text-sm font-mono text-gray-800">{c.abn.trim()}</div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-xs whitespace-pre-wrap">{c.address || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCreator(c)}
                      className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                      View Profile ({c.portfolioMedia?.length ?? 0})
                    </button>
                  </td>
                  <td className="px-6 py-4">{statusBadge(c.status ?? 'pending')}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCreatorStatus(c.id, 'approved')}
                        disabled={updatingId === c.id || c.status === 'approved'}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateCreatorStatus(c.id, 'rejected')}
                        disabled={updatingId === c.id || c.status === 'rejected'}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {selectedCreator ? (
        <CreatorDetailModal
          creator={selectedCreator}
          updatingId={updatingId}
          onClose={() => setSelectedCreator(null)}
          onUpdateStatus={async (id, status) => {
            await handleUpdateCreatorStatus(id, status);
            setSelectedCreator(null);
          }}
        />
      ) : null}
    </DashboardLayout>
  );
}
