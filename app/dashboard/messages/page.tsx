'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { getMessageContacts, getMessages, sendMessage } from '@/lib/api';
import { getMe } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toast } from '@/lib/toast';
import { MessageSquare, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function MessagesPage() {
  const [role, setRole] = useState<'admin' | 'brand' | 'creator'>('brand');
  const [displayRole, setDisplayRole] = useState('Brand');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { user } = await getMe();
      const navRole = user.role as 'admin' | 'brand' | 'creator';
      setRole(navRole);
      setDisplayRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
      const [inbox, contactList] = await Promise.all([getMessages(), getMessageContacts()]);
      setMessages(inbox.messages ?? []);
      setContacts(contactList.contacts ?? []);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !body.trim()) return;
    setSending(true);
    try {
      await sendMessage({ recipientId, subject: subject.trim() || undefined, body: body.trim() });
      setSubject('');
      setBody('');
      toast.success('Message sent');
      fetchData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role={displayRole} navRole={role}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm">
          Send messages to your campaign contacts. Recipients are emailed when they receive a new message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={18} className="text-indigo-600" />
            Compose
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Select recipient…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.role}) — {c.email}
                  </option>
                ))}
              </select>
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
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-36"
                placeholder="Write your message…"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !recipientId}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600" />
            Inbox
          </h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No messages yet.</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border ${m.isMine ? 'border-indigo-100 bg-indigo-50/40' : 'border-gray-100 bg-gray-50/50'}`}
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      {m.isMine ? `To: ${m.recipient?.fullName}` : `From: ${m.sender?.fullName}`}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  {m.subject ? <p className="text-xs font-semibold text-gray-700 mb-1">{m.subject}</p> : null}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
