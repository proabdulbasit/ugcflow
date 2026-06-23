'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { getAdminProfiles, sendMessage as sendMessageApi } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { Search, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type ProfileRow = any;

function mapProfile(p: any): ProfileRow {
  return {
    ...p,
    full_name: p.full_name ?? p.fullName,
    created_at: p.created_at ?? p.createdAt,
  };
}

export default function AdminMessagingPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { profiles: data } = await getAdminProfiles();
      setProfiles(data.map(mapProfile));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const filtered = profiles.filter((p: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const email = (p.email ?? '').toLowerCase();
    const name = (p.full_name ?? '').toLowerCase();
    const role = (p.role ?? '').toLowerCase();
    return email.includes(q) || name.includes(q) || role.includes(q);
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !message.trim()) return;
    setSending(true);
    try {
      await sendMessageApi({
        recipientId,
        subject: subject.trim() || undefined,
        body: message.trim(),
      });
      setSubject('');
      setMessage('');
      toast.success('Message sent successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role="Admin" navRole="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messaging</h1>
        <p className="text-gray-500 text-sm">Send a direct message to a brand or creator. They receive an email notification.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Compose</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (email)</label>
              <input
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  const match = profiles.find((p) => p.email === e.target.value.trim());
                  setRecipientId(match?.id ?? '');
                }}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40"
                placeholder="Write your message…"
                required
              />
            </div>
            <button
              disabled={sending}
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Users</h3>
            <button
              onClick={fetchProfiles}
              className="px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-all"
            >
              Refresh
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2 mb-4">
            <Search size={16} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Search email, name, role…"
            />
          </div>

          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 italic">No users found.</div>
            ) : (
              filtered.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setRecipientEmail(p.email);
                    setRecipientId(p.id);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{p.full_name ?? 'Unnamed'}</div>
                      <div className="text-xs text-gray-500 truncate">{p.email}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-50 text-indigo-600">
                      {p.role}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
