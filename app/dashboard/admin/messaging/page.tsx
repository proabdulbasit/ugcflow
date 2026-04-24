'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, LayoutDashboard, MessageSquare, Search, Send, Settings, TrendingUp, Users, Video } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ProfileRow = any;

export default function AdminMessagingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const sidebarItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
    { label: 'Analytics', icon: TrendingUp, href: '/dashboard/admin/analytics' },
    { label: 'Creators', icon: Users, href: '/dashboard/admin/creators' },
    { label: 'Brands', icon: Users, href: '/dashboard/admin/brands' },
    { label: 'Campaigns', icon: Video, href: '/dashboard/admin/campaigns' },
    { label: 'Submissions', icon: Video, href: '/dashboard/admin/submissions' },
    { label: 'Messaging', icon: MessageSquare, href: '/dashboard/admin/messaging' },
    { label: 'Payments', icon: CreditCard, href: '/dashboard/admin/payments' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const fetchProfiles = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) alert(error.message);
    setProfiles((data ?? []) as any);
    setLoading(false);
  }, [supabase]);

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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ADMIN_MESSAGE',
          data: {
            to: recipientEmail.trim(),
            subject: subject.trim() || 'Message from UGCFLOW Admin',
            message: message.trim(),
          },
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        alert(json?.error ?? 'Failed to send message.');
      } else {
        setSubject('');
        setMessage('');
        alert('Message queued (see server logs).');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role="Admin" items={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messaging</h1>
        <p className="text-gray-500 text-sm">Send a direct message to a brand or creator (currently logged via `/api/notifications`).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Compose</h3>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (email)</label>
              <input
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
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
                  onClick={() => setRecipientEmail(p.email)}
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

