// Frontend/src/features/admin/AdminTemplateBookingManager.jsx
// Standalone /admin/bookings page — same power as WebsiteBookingsManager tab
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  getAllWebsiteBookings,
  approveWebsiteBooking,
  completeWebsiteBooking,
  getWebsiteBookingStats,
  getChatMessages,
  sendChatMessage,
} from './api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

// ─── STATUS CONFIG ──────────────────────────────────────────────────────────
const STATUS = {
  purchased:          { text: 'Just Bought',            emoji: '📦', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  approved:           { text: 'Approved (Timer Running)', emoji: '⚙️', badge: 'bg-blue-100 text-blue-800 border-blue-300'   },
  inprogress:         { text: 'In Development',          emoji: '⚡', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
  readyforcompletion: { text: 'Ready (90%)',              emoji: '⏳', badge: 'bg-orange-100 text-orange-800 border-orange-300' },
  completed:          { text: 'Completed ✅',             emoji: '✅', badge: 'bg-green-100 text-green-800 border-green-300'  },
};

const statusCfg = (s) => STATUS[s] || { text: s, emoji: '📋', badge: 'bg-gray-100 text-gray-700 border-gray-300' };

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const timeLeft = (est) => {
  if (!est) return null;
  const diff = new Date(est) - new Date();
  if (diff <= 0) return '⚠️ Overdue';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `⏱ ${d}d ${h}h left`;
};

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const cfg = statusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
      {cfg.emoji} {cfg.text}
    </span>
  );
};

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const ProgressBar = ({ value = 0, estimatedAt, approvedAt }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-semibold text-gray-600">Development Progress</span>
      <span className="text-sm font-black text-blue-600">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
    {approvedAt && estimatedAt && (
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Auto: 10% → 90% in 3 days</span>
        <span className="font-semibold">{timeLeft(estimatedAt)}</span>
      </div>
    )}
  </div>
);

// ─── STAT PILL ───────────────────────────────────────────────────────────────
const Pill = ({ label, value, color }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 border-${color}-200`}>
    <span className={`text-2xl font-black text-${color}-600`}>{value}</span>
    <span className="text-xs text-gray-500 font-semibold mt-0.5">{label}</span>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminTemplateBookingManager() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [bookings, setBookings]           = useState([]);
  const [stats, setStats]                 = useState({});
  const [loading, setLoading]             = useState(true);
  const [processing, setProcessing]       = useState(false);
  const [statusFilter, setStatusFilter]   = useState('');
  const [searchTerm, setSearchTerm]       = useState('');

  // Modal state
  const [chatOpen, setChatOpen]           = useState(false);
  const [completeOpen, setCompleteOpen]   = useState(false);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMsg, setNewMsg]               = useState('');
  const [previewLink, setPreviewLink]     = useState('');
  const chatEndRef                        = useRef(null);

  // ─── Auth guard ────────────────────────────────────────────────────────────
  const isAdmin = ['admin', 'secondaryAdmin', 'mainAdmin'].includes(user?.role);

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await getAllWebsiteBookings(params);
      if (res.success) setBookings(res.data || []);
    } catch (e) {
      if (!silent) addNotification({ type: 'error', message: e.message || 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getWebsiteBookingStats();
      if (res.success) setStats(res.data || {});
    } catch {}
  };

  useEffect(() => {
    loadBookings();
    loadStats();
    const id = setInterval(() => { loadBookings(true); loadStats(); }, 30000);
    return () => clearInterval(id);
  }, [statusFilter]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm('Approve booking? Auto-progress will start: 10% → 90% over 3 business days.')) return;
    try {
      setProcessing(true);
      const res = await approveWebsiteBooking(id);
      if (res.success) {
        addNotification({ type: 'success', message: '✅ Booking approved! Timer started.' });
        loadBookings(true); loadStats();
      }
    } catch (e) {
      addNotification({ type: 'error', message: e.message || 'Failed to approve' });
    } finally { setProcessing(false); }
  };

  const openComplete = (b) => { setSelected(b); setPreviewLink(''); setCompleteOpen(true); };

  const handleComplete = async () => {
    if (!previewLink.trim()) return addNotification({ type: 'error', message: 'Please enter preview link' });
    if (!/^https?:\/\/.+/.test(previewLink)) return addNotification({ type: 'error', message: 'Enter a valid URL (http/https)' });
    try {
      setProcessing(true);
      const res = await completeWebsiteBooking(selected._id, previewLink);
      if (res.success) {
        addNotification({ type: 'success', message: '🎉 Booking completed! Preview link saved.' });
        setCompleteOpen(false); setSelected(null); setPreviewLink('');
        loadBookings(true); loadStats();
      }
    } catch (e) {
      addNotification({ type: 'error', message: e.message || 'Failed to complete' });
    } finally { setProcessing(false); }
  };

  const openChat = async (b) => {
    setSelected(b); setMessages([]); setNewMsg(''); setChatOpen(true);
    try {
      const res = await getChatMessages(b._id);
      if (res.success) setMessages(res.data.messages || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      const res = await sendChatMessage(selected._id, newMsg.trim());
      if (res.success) { setMessages(res.data.messages || []); setNewMsg(''); }
    } catch (e) {
      addNotification({ type: 'error', message: e.message || 'Failed to send' });
    }
  };

  // ─── Filtered list ─────────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      b.templateName?.toLowerCase().includes(s) ||
      b.userId?.name?.toLowerCase().includes(s) ||
      b.userId?.email?.toLowerCase().includes(s) ||
      b.bookingId?.toLowerCase().includes(s)
    );
  });

  // ─── Auth guard UI ─────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to view bookings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">🌐 All Website Bookings</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs text-gray-500">Live · auto-refreshes every 30s</span>
          </div>
        </div>
        <button
          onClick={() => { loadBookings(); loadStats(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
        >
          🔄 Refresh Now
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Pill label="Total"      value={stats.total      || 0} color="gray"   />
        <Pill label="Just Bought" value={stats.purchased  || 0} color="yellow" />
        <Pill label="Approved"   value={stats.approved   || 0} color="blue"   />
        <Pill label="In Progress" value={stats.inProgress || 0} color="purple" />
        <Pill label="Completed"  value={stats.completed  || 0} color="green"  />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">🔽 Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="purchased">📦 Just Bought</option>
              <option value="approved">⚙️ Approved (Timer Running)</option>
              <option value="inprogress">⚡ In Development</option>
              <option value="readyforcompletion">⏳ Ready (90%)</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">🔍 Search</label>
            <input
              type="text"
              placeholder="Template name, user, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* ── Bookings List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
          <p className="text-gray-500 text-sm">{statusFilter || searchTerm ? 'Try adjusting filters' : 'No website bookings yet'}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Card top accent based on status */}
              <div className={`h-1 w-full ${
                b.status === 'completed' ? 'bg-green-400' :
                b.status === 'readyforcompletion' ? 'bg-orange-400' :
                b.status === 'inprogress' ? 'bg-purple-400' :
                b.status === 'approved' ? 'bg-blue-400' : 'bg-yellow-400'
              }`} />

              <div className="p-5 sm:p-6">

                {/* ── Top row: image + info + status ── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-5">
                  <img
                    src={b.templateImage || '/placeholder.jpg'}
                    alt={b.templateName}
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{b.templateName}</h3>
                      <Badge status={b.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        #{b.bookingId || b._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="ml-2">📅 {fmtDate(b.purchasedAt)}</span>
                    </p>

                    {/* Customer info */}
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700">
                        👤 {b.userId?.name || 'N/A'}
                      </span>
                      <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 break-all">
                        ✉️ {b.userId?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Progress ── */}
                <div className="mb-4">
                  <ProgressBar
                    value={b.progress || 0}
                    estimatedAt={b.estimatedCompletionAt}
                    approvedAt={b.approvedAt}
                  />
                </div>

                {/* ── Meeting ── */}
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-2">📅 Meeting Details</p>
                  {b.meetingDetails ? (
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="text-xs bg-white border border-blue-200 rounded-lg px-2 py-1 text-gray-700">
                        📆 {fmtDate(b.meetingDetails.scheduledDate)}
                      </span>
                      <span className="text-xs bg-white border border-blue-200 rounded-lg px-2 py-1 text-gray-700">
                        ⏰ {b.meetingDetails.scheduledTime}
                      </span>
                      {b.meetingDetails.meetingLink && (
                        <a
                          href={b.meetingDetails.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 font-semibold transition"
                        >
                          📹 Join
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No meeting scheduled</p>
                  )}
                </div>

                {/* ── Preview link (if completed) ── */}
                {b.status === 'completed' && b.previewLink && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-green-700 mb-0.5">🔗 Preview Link</p>
                      <p className="text-xs text-gray-600 truncate">{b.previewLink}</p>
                    </div>
                    <a
                      href={b.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 font-semibold transition"
                    >
                      🌐 View
                    </a>
                  </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {b.status === 'purchased' && (
                    <button
                      onClick={() => handleApprove(b._id)}
                      disabled={processing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition"
                    >
                      ✅ Approve & Start Timer
                    </button>
                  )}

                  {['approved', 'inprogress', 'readyforcompletion'].includes(b.status) && (
                    <button
                      onClick={() => openComplete(b)}
                      disabled={processing}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow transition"
                    >
                      🎯 Mark Complete (→100%)
                    </button>
                  )}

                  <button
                    onClick={() => openChat(b)}
                    className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 text-gray-600 font-bold rounded-xl text-xs transition"
                  >
                    💬 Chat with Customer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ COMPLETE MODAL ══════════ */}
      {completeOpen && selected && (
        <Modal
          isOpen={completeOpen}
          onClose={() => { setCompleteOpen(false); setSelected(null); setPreviewLink(''); }}
          title="🎯 Complete Booking (90% → 100%)"
        >
          <div className="p-6 space-y-5">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="font-bold text-gray-900">{selected.templateName}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Current progress: <strong className="text-blue-600">{selected.progress || 0}%</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🔗 Preview Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://yourpreview.com"
                value={previewLink}
                onChange={(e) => setPreviewLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1.5">Full URL where the finished website can be previewed.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setCompleteOpen(false); setSelected(null); setPreviewLink(''); }}
                className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold hover:border-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={processing || !previewLink.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow transition"
              >
                {processing ? '⏳ Processing...' : '✔️ Mark as Completed'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════ CHAT MODAL ══════════ */}
      {chatOpen && selected && (
        <Modal
          isOpen={chatOpen}
          onClose={() => { setChatOpen(false); setSelected(null); setMessages([]); setNewMsg(''); }}
          title={`💬 Chat — ${selected.templateName}`}
        >
          <div className="flex flex-col" style={{ height: 480 }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow ${
                    m.senderRole === 'admin'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}>
                    <p>{m.message}</p>
                    <p className={`text-xs mt-1.5 ${m.senderRole === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {m.senderRole === 'admin' ? '👨‍💼 Admin' : '👤 Customer'} · {new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white flex gap-3">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition"
              >
                📤 Send
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
