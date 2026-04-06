// Frontend\src\features\admin\WebsiteBookingsManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  getAllWebsiteBookings,
  approveWebsiteBooking,
  completeWebsiteBooking,
  getWebsiteBookingStats,
  getChatMessages,
  sendChatMessage
} from './api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';


const WebsiteBookingsManager = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // States
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [previewLink, setPreviewLink] = useState('');

  // ✅ NEW: Auto-refresh every 30 seconds
  useEffect(() => {
    // Initial load
    loadBookings();
    loadStats();

    // Set interval for auto-refresh
    const intervalId = setInterval(() => {
      console.log('🔄 Admin: Auto-refreshing bookings...');
      loadBookings();
      loadStats();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      console.log('🛑 Admin: Auto-refresh stopped');
    };
  }, [statusFilter]); // Re-run when filter changes

  // ✅ UPDATED: Load bookings (no loading spinner on auto-refresh)
  const loadBookings = async () => {
    try {
      // ✅ Don't show loading spinner on auto-refresh
      if (bookings.length === 0) {
        setLoading(true);
      }
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await getAllWebsiteBookings(params);
      
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('❌ Load bookings error:', error);
      // Only show error on initial load, not auto-refresh
      if (bookings.length === 0) {
        addNotification({
          type: 'error',
          message: error.message || 'Failed to load bookings'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await getWebsiteBookingStats();
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (error) {
      console.error('❌ Load stats error:', error);
    }
  };

  // Handle approve booking (START TIMER)
  const handleApprove = async (bookingId) => {
    if (!window.confirm(' Approve booking? Auto-progress will start: 10% → 90% over 3 business days (54 min per 1%).')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await approveWebsiteBooking(bookingId);
      
      if (response.success) {
        addNotification({
          type: 'success',
          message: '✅ Booking approved! Timer started. Progress: 10% → 90% (3 days).'
        });
        loadBookings();
        loadStats();
      }
    } catch (error) {
      console.error('❌ Approve error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to approve booking'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Open complete modal
  const openCompleteModal = (booking) => {
    setSelectedBooking(booking);
    setPreviewLink('');
    setShowCompleteModal(true);
  };

  // Handle complete booking (90% → 100%)
  const handleComplete = async () => {
    if (!previewLink.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter preview link'
      });
      return;
    }

    // Basic URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(previewLink)) {
      addNotification({
        type: 'error',
        message: 'Please enter valid URL (must start with http:// or https://)'
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await completeWebsiteBooking(selectedBooking._id, previewLink);
      
      if (response.success) {
        addNotification({
          type: 'success',
          message: '🎉 Booking completed! Preview link added. Progress: 100%.'
        });
        setShowCompleteModal(false);
        setSelectedBooking(null);
        setPreviewLink('');
        loadBookings();
        loadStats();
      }
    } catch (error) {
      console.error('❌ Complete error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to complete booking'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Open chat modal
  const openChatModal = async (booking) => {
    setSelectedBooking(booking);
    setShowChatModal(true);
    setNewMessage('');
    
    try {
      const response = await getChatMessages(booking._id);
      if (response.success) {
        setChatMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('❌ Load chat error:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter a message'
      });
      return;
    }

    try {
      const response = await sendChatMessage(selectedBooking._id, newMessage.trim());
      
      if (response.success) {
        setChatMessages(response.data.messages || []);
        setNewMessage('');
        addNotification({
          type: 'success',
          message: '✅ Message sent'
        });
      }
    } catch (error) {
      console.error('❌ Send message error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Failed to send message'
      });
    }
  };

  // ✅ SYNCED: Status config matching admin statuses
  const getStatusConfig = (status) => {
    const statusConfig = {
      purchased: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgLight: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        text: 'Just Bought',
        emoji: '📦'
      },
      approved: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Approved (Timer Running)',
        emoji: '⚙️'
      },
      inprogress: {
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
        text: 'In Development',
        emoji: '⚡'
      },
      readyforcompletion: {
        color: 'bg-orange-500',
        textColor: 'text-orange-800',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
        text: 'Ready (90%)',
        emoji: '⏳'
      },
      completed: {
        color: 'bg-green-500',
        textColor: 'text-green-800',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Completed (100%)',
        emoji: '✅'
      }
    };
    
    return statusConfig[status] || {
      color: 'bg-gray-500',
      textColor: 'text-gray-800',
      bgLight: 'bg-gray-50',
      borderColor: 'border-gray-200',
      text: status,
      emoji: '📋'
    };
  };

  // ✅ SYNCED: Status badge
  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${config.bgLight} ${config.textColor} ${config.borderColor} border`}>
        <span className="text-sm sm:text-base">{config.emoji}</span>
        <span className="whitespace-nowrap">{config.text}</span>
      </div>
    );
  };

  // ✅ SYNCED: Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ SYNCED: Format time remaining
  const getTimeRemaining = (estimatedCompletionAt) => {
    if (!estimatedCompletionAt) return null;
    
    const now = new Date();
    const completion = new Date(estimatedCompletionAt);
    const diff = completion - now;
    
    if (diff <= 0) return '⚠️ Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `⏱️ ${days}d ${hours}h left`;
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(booking => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.templateName?.toLowerCase().includes(search) ||
        booking.userId?.name?.toLowerCase().includes(search) ||
        booking.userId?.email?.toLowerCase().includes(search) ||
        booking.bookingId?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ SYNCED: Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              🌐 Website Bookings - Admin Panel
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Credit-based system • 10% → 90% auto (3 days, 54 min per 1%) • Admin completes 90% → 100%
            </p>
            {/* ✅ NEW: Auto-update indicator */}
            <div className="flex items-center gap-2 mt-2">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Live updates • Refreshes every 30 sec</span>
            </div>
          </div>
          
          <button
            onClick={() => {
              loadBookings();
              loadStats();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            🔄 Refresh Now
          </button>
        </div>

        {/* ✅ SYNCED: Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Total', value: stats.total || 0, color: 'gray' },
            { label: 'Just Bought', value: stats.purchased || 0, color: 'yellow' },
            { label: 'Approved', value: stats.approved || 0, color: 'blue' },
            { label: 'In Progress', value: stats.inProgress || 0, color: 'purple' },
            { label: 'Completed', value: stats.completed || 0, color: 'green' }
          ].map((stat) => (
            <div key={stat.label} className={`bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-${stat.color}-100`}>
              <div className="text-center">
                <div className={`text-xl sm:text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SYNCED: Filters */}
      <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                <span className="inline mr-2 text-blue-500">🔽</span>
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 transition-all bg-white shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="purchased">📦 Just Bought</option>
                <option value="approved">⚙️ Approved (Timer Running)</option>
                <option value="inprogress">⚡ In Development</option>
                <option value="readyforcompletion">⏳ Ready (90%)</option>
                <option value="completed">✅ Completed (100%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                <span className="inline mr-2 text-blue-500">🔍</span>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by template, user, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 transition-all bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ✅ SYNCED: Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-6 sm:p-8 lg:p-12 text-center border-0 rounded-2xl sm:rounded-3xl shadow-2xl bg-white">
          <div className="text-5xl sm:text-6xl lg:text-8xl mb-4 sm:mb-6">📭</div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No Bookings Found</h3>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            {statusFilter || searchTerm ? 'Try adjusting your filters' : 'No website bookings yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {filteredBookings.map((booking, index) => (
            <Card 
              key={booking._id} 
              className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 overflow-hidden bg-white"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {/* ✅ SYNCED: Template Image + Info + Status */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.templateImage || '/placeholder.jpg'}
                      alt={booking.templateName}
                      className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl sm:rounded-2xl object-cover border-4 border-blue-100 shadow-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                        {booking.templateName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Booking ID:</span>{' '}
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {booking.bookingId || booking._id.slice(-8).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        📅 Purchased: {formatDate(booking.purchasedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-gray-200 lg:w-64">
                    <div className="text-sm space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Customer</div>
                        <div className="font-bold text-gray-900 text-sm">
                          👤 {booking.userId?.name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Email</div>
                        <div className="text-gray-700 text-xs break-all">
                          ✉️ {booking.userId?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-start">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* ✅ SYNCED: Meeting Section */}
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-blue-500">📅</span>
                    Meeting Details
                  </h4>
                  
                  {booking.meetingDetails ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-xs text-gray-600 mb-1">Date</div>
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">
                            📆 {formatDate(booking.meetingDetails.scheduledDate)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="text-xs text-gray-600 mb-1">Time</div>
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">
                            ⏰ {booking.meetingDetails.scheduledTime}
                          </div>
                        </div>
                      </div>
                      
                      {booking.meetingDetails.meetingLink && (
                        <a
                          href={booking.meetingDetails.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg"
                        >
                          📹 Join Meeting
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 text-center">
                      <div className="text-2xl mb-2">📭</div>
                      <div className="text-gray-600 font-medium text-sm">No Meeting Scheduled</div>
                    </div>
                  )}
                </div>

                {/* ✅ SYNCED: Progress Section */}
                <div className="mb-4 sm:mb-6 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <span style={{ color: '#6498fe' }}>📊</span>
                      Development Progress
                    </h4>
                    <span className="text-lg sm:text-2xl font-bold text-blue-600">{booking.progress || 0}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-300 rounded-full h-3 sm:h-4 shadow-inner mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-1000 shadow-lg flex items-center justify-end pr-2"
                      style={{ width: `${booking.progress || 0}%` }}
                    >
                      {booking.progress >= 10 && (
                        <span className="text-white text-xs font-bold">
                          {booking.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {booking.approvedAt && booking.estimatedCompletionAt && (
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span>Auto-progress: 10% → 90% (3 days)</span>
                      <span className="font-semibold">{getTimeRemaining(booking.estimatedCompletionAt)}</span>
                    </div>
                  )}
                </div>

                {/* ✅ SYNCED: Preview Link Section (Only if completed) */}
                {booking.status === 'completed' && booking.previewLink && (
                  <div className="mb-4 sm:mb-6 bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm sm:text-base">
                          <span className="text-lg">🔗</span>
                          Website Preview Link
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 break-all">
                          {booking.previewLink}
                        </div>
                      </div>
                      <a
                        href={booking.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        🌐 View Site
                      </a>
                    </div>
                  </div>
                )}

                {/* ✅ SYNCED: Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-4 border-t-2 border-gray-200">
                  {/* APPROVE BUTTON - Only for "purchased" status */}
                  {booking.status === 'purchased' && (
                    <Button
                      onClick={() => handleApprove(booking._id)}
                      disabled={processing}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm w-full sm:w-auto"
                    >
                      ✅ Approve & Start Timer (10% → 90%)
                    </Button>
                  )}

                  {/* COMPLETE BUTTON - For approved/inprogress/ready status */}
                  {['approved', 'inprogress', 'readyforcompletion'].includes(booking.status) && (
                    <Button
                      onClick={() => openCompleteModal(booking)}
                      disabled={processing}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm w-full sm:w-auto"
                    >
                      🎯 Complete Booking (90% → 100%)
                    </Button>
                  )}

                  {/* CHAT BUTTON - Always available */}
                  <Button
                    onClick={() => openChatModal(booking)}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 font-semibold transition-all text-xs sm:text-sm w-full sm:w-auto"
                  >
                    💬 Chat with Customer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ SYNCED: Complete Modal */}
      {showCompleteModal && selectedBooking && (
        <Modal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedBooking(null);
            setPreviewLink('');
          }}
          title="🎯 Complete Booking (90% → 100%)"
        >
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-gray-700 mb-2">
                <strong className="text-lg">{selectedBooking.templateName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Current Progress: <strong className="text-blue-600">{selectedBooking.progress || 0}%</strong>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🔗 Preview Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/preview"
                value={previewLink}
                onChange={(e) => setPreviewLink(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-medium"
              />
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Enter the full URL where the completed website can be previewed
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedBooking(null);
                  setPreviewLink('');
                }}
                className="border-2"
              >
                ❌ Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={processing || !previewLink.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg"
              >
                {processing ? '⏳ Processing...' : '✔️ Mark as Completed (100%)'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ SYNCED: Chat Modal */}
      {showChatModal && selectedBooking && (
        <Modal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedBooking(null);
            setChatMessages([]);
            setNewMessage('');
          }}
          title={`💬 Chat - ${selectedBooking.templateName}`}
        >
          <div className="flex flex-col h-[500px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-500 font-medium">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-xl shadow-md ${
                        msg.senderRole === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border-2 border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-2 ${msg.senderRole === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.senderRole === 'admin' ? '👨‍💼 Admin' : '👤 Customer'} • {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t-2 border-gray-200 p-4 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md px-6"
                >
                  📤 Send
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ SYNCED: CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
};

export default WebsiteBookingsManager;
