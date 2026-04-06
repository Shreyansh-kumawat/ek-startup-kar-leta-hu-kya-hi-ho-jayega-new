// Frontend/src/features/admin/AdminMailManager.jsx
// /admin/mail — Send bulk or targeted follow-up emails to users
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getAllUsers } from './api';
import apiClient from '../../services/apiClient';

// ─── Email Templates ─────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'followup_general',
    label: '👋 General Follow-up',
    subject: 'Following up from 3Digree 👋',
    body: `Hi {{name}},

Hope you're doing great! We just wanted to check in and see how things are going with your 3Digree experience.

If you have any questions, need help choosing a template, or want to discuss a project — we're just one reply away!

Let's build something great together. 🚀

Warm regards,
The 3Digree Team
https://3digree.in`,
  },
  {
    id: 'offer_credits',
    label: '🎁 Special Offer / Credits',
    subject: '🎁 A Special Gift for You from 3Digree!',
    body: `Hi {{name}},

You've been a valued part of the 3Digree community and we want to say THANK YOU! 🙏

We're giving you bonus credits — use them to book any premium website template on 3Digree.

👉 Visit: https://3digree.in/templates

Offer is valid for a limited time only. Don't miss out!

Cheers,
The 3Digree Team`,
  },
  {
    id: 'booking_nudge',
    label: '📦 Booking Reminder',
    subject: 'Your Website is Waiting — Book Now on 3Digree 🌐',
    body: `Hi {{name}},

We noticed you haven't placed a booking yet on 3Digree — and we'd love to help you get started!

With 100+ battle-tested website designs and a dedicated dev team, your dream website is just a few clicks away.

👉 Browse Templates: https://3digree.in/templates
👉 View Pricing: https://3digree.in/pricing

Let's make it happen!

Best,
The 3Digree Team`,
  },
  {
    id: 'custom',
    label: '✏️ Custom Message',
    subject: '',
    body: '',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const interpolate = (text, name) => text.replace(/{{name}}/g, name || 'there');

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminMailManager() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const isAdmin = ['admin', 'mainAdmin', 'secondaryAdmin'].includes(user?.role);

  // Users
  const [users, setUsers]           = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Mode: 'all' | 'specific'
  const [mode, setMode]             = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Mail content
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [subject, setSubject]       = useState(TEMPLATES[0].subject);
  const [body, setBody]             = useState(TEMPLATES[0].body);

  // Send state
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState(null); // { sent, failed, total }

  // Load users
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllUsers();
        if (res.success) setUsers(res.data || []);
      } catch {}
      finally { setLoadingUsers(false); }
    })();
  }, []);

  // When template changes, pre-fill subject+body
  const handleTemplateChange = (id) => {
    setTemplateId(id);
    setResult(null);
    const tpl = TEMPLATES.find(t => t.id === id);
    if (tpl) { setSubject(tpl.subject); setBody(tpl.body); }
  };

  // Toggle user selection
  const toggleUser = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visible = filteredUsers.map(u => u._id);
    const allSelected = visible.every(id => selectedIds.includes(id));
    setSelectedIds(allSelected
      ? selectedIds.filter(id => !visible.includes(id))
      : [...new Set([...selectedIds, ...visible])]
    );
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const s = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s);
  });

  // Recipients for preview count
  const recipients = mode === 'all' ? users : users.filter(u => selectedIds.includes(u._id));

  // Send
  const handleSend = async () => {
    if (!subject.trim()) return addNotification({ type: 'error', message: 'Subject is required' });
    if (!body.trim())    return addNotification({ type: 'error', message: 'Message body is required' });
    if (mode === 'specific' && selectedIds.length === 0)
      return addNotification({ type: 'error', message: 'Select at least one user' });

    const confirm = window.confirm(
      `Send mail to ${recipients.length} user${recipients.length !== 1 ? 's' : ''}?\nSubject: "${subject}"`
    );
    if (!confirm) return;

    try {
      setSending(true);
      setResult(null);
      const payload = {
        mode,
        userIds: mode === 'specific' ? selectedIds : [],
        subject,
        body,
      };
      const res = await apiClient.post('/admin/mail/send', payload);
      const data = res.data;
      if (data.success) {
        setResult(data.data);
        addNotification({ type: 'success', message: `✅ Emails sent: ${data.data.sent} success, ${data.data.failed} failed` });
      }
    } catch (e) {
      addNotification({ type: 'error', message: e.response?.data?.message || e.message || 'Failed to send emails' });
    } finally {
      setSending(false);
    }
  };

  // ─── Auth guard ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">📧 Mail Manager</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send follow-up or broadcast emails to your users directly from the admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ════ LEFT: Compose ════ */}
        <div className="space-y-5">

          {/* Template picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 mb-3">📋 Email Template</h2>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                    templateId === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">✉️ Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Body */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700">📝 Message Body <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400">Use <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code> for personalization</span>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              placeholder="Write your message here..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-y font-mono"
            />
          </div>

          {/* Preview */}
          {subject && body && recipients.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-blue-700 mb-2">👁️ Preview (first recipient)</p>
              <div className="bg-white rounded-xl p-4 border border-blue-100 text-sm text-gray-700 space-y-1">
                <p><strong>To:</strong> {recipients[0]?.email}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <hr className="my-2" />
                <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">
                  {interpolate(body, recipients[0]?.name)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ════ RIGHT: Recipients ════ */}
        <div className="space-y-5">

          {/* Mode toggle */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-700 mb-3">🎯 Recipients</h2>
            <div className="flex gap-3">
              <button
                onClick={() => { setMode('all'); setSelectedIds([]); }}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                  mode === 'all'
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                📢 All Users
                <span className="block text-xs font-normal mt-0.5 opacity-80">{users.length} users</span>
              </button>
              <button
                onClick={() => setMode('specific')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${
                  mode === 'specific'
                    ? 'border-purple-500 bg-purple-600 text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                🎯 Specific Users
                <span className="block text-xs font-normal mt-0.5 opacity-80">
                  {selectedIds.length} selected
                </span>
              </button>
            </div>
          </div>

          {/* User picker (only in specific mode) */}
          {mode === 'specific' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">Select Users</h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  {filteredUsers.every(u => selectedIds.includes(u._id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 mb-3"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto scrollable-element pr-1">
                {loadingUsers ? (
                  <p className="text-sm text-gray-400 text-center py-4">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                ) : filteredUsers.map(u => (
                  <label
                    key={u._id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border-2 transition ${
                      selectedIds.includes(u._id)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(u._id)}
                      onChange={() => toggleUser(u._id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name || u.username}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' :
                      u.isActive === false ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : u.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Summary + Send */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-700">Ready to send</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} •{' '}
                  {mode === 'all' ? 'Broadcast to all' : 'Targeted send'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                mode === 'all' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {mode === 'all' ? '📢' : '🎯'}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || recipients.length === 0 || !subject.trim() || !body.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
            >
              {sending
                ? '⏳ Sending emails...'
                : `📤 Send to ${recipients.length} User${recipients.length !== 1 ? 's' : ''}`
              }
            </button>

            {/* Result */}
            {result && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${
                result.failed === 0
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-sm font-bold text-gray-800 mb-1">📊 Send Report</p>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <div className="bg-white rounded-lg p-2 border">
                    <p className="text-lg font-black text-gray-700">{result.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border">
                    <p className="text-lg font-black text-green-600">{result.sent}</p>
                    <p className="text-xs text-gray-500">Sent ✅</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border">
                    <p className="text-lg font-black text-red-500">{result.failed}</p>
                    <p className="text-xs text-gray-500">Failed ❌</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
