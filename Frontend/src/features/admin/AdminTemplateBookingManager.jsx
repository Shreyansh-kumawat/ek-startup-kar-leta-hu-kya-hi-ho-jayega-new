import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNotification } from '../../hooks/useNotification';
import {
  setPaymentPercentage,
  updateMeetingStatus,
  updateDevelopmentProgress,
  updateWebsiteUrls,
  setFinalWebsiteUrl,
  addCommunication,
  getAllBookings,
  deleteBooking,
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  debounce
} from '../../services/templateBookingApi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const AdminTemplateBookingManager = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0
  });

  // Form states
  const [formData, setFormData] = useState({
    paymentPercentage: '',
    meetingStatus: '',
    progress: '',
    stage: '',
    developerNotes: '',
    previewUrl: '',
    finalUrl: '',
    downloadUrl: '',
    message: ''
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500),
    []
  );

  // Load bookings
  const loadBookings = async (page = 1, forceReload = false) => {
    try {
      if (forceReload) setLoading(true);
      
      const params = {
        page,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      const response = await getAllBookings(params);
      
      if (response?.success) {
        setBookings(response.data?.bookings || []);
        setPagination(response.data?.pagination);
      } else {
        throw new Error(response?.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showError(error?.message || 'Failed to load bookings');
      setBookings([]);
      setPagination({ currentPage: 1, totalPages: 1, totalBookings: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBookings(1, true);
  }, []);

  // Reload on filter change
  useEffect(() => {
    loadBookings(1, true);
  }, [filters.status, filters.search, filters.sortBy, filters.sortOrder]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle search
  const handleSearchChange = (value) => {
    debouncedSearch(value);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    showSuccess('Filters cleared');
  };

  // Open modal
  const openModal = (type, booking) => {
    setSelectedBooking(booking);
    setModalType(type);

    switch (type) {
      case 'payment':
        setFormData({
          paymentPercentage: booking.paymentDetails?.paymentPercentage || ''
        });
        break;
      case 'meeting':
        setFormData({
          meetingStatus: booking.meetingDetails?.meetingStatus || 'scheduled'
        });
        break;
      case 'progress':
        setFormData({
          progress: booking.developmentStatus?.progress || '',
          stage: booking.developmentStatus?.stage || 'not-started',
          developerNotes: booking.developmentStatus?.developerNotes || ''
        });
        break;
      case 'website':
        setFormData({
          previewUrl: booking.websiteUrls?.previewUrl || '',
          finalUrl: booking.websiteUrls?.finalUrl || '',
          downloadUrl: booking.websiteUrls?.downloadUrl || ''
        });
        break;
      case 'message':
        setFormData({ message: '' });
        break;
      default:
        setFormData({});
    }
    
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalType(null);
    setFormData({});
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId, templateName) => {
    if (!window.confirm(`Are you sure you want to delete booking for "${templateName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setProcessing(true);
      await deleteBooking(bookingId);
      showSuccess('Booking deleted successfully');
      await loadBookings(pagination.currentPage);
    } catch (error) {
      console.error('Delete booking error:', error);
      showError(error?.message || 'Failed to delete booking');
    } finally {
      setProcessing(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setProcessing(true);

      switch (modalType) {
        case 'payment':
          if (!formData.paymentPercentage || formData.paymentPercentage < 0 || formData.paymentPercentage > 100) {
            showError('Please enter valid payment percentage (0-100)');
            return;
          }
          await setPaymentPercentage(selectedBooking._id, formData.paymentPercentage);
          showSuccess('Payment percentage set successfully');
          break;

        case 'meeting':
          await updateMeetingStatus(selectedBooking._id, {
            meetingStatus: formData.meetingStatus
          });
          showSuccess('Meeting status updated successfully');
          break;

        case 'progress':
          if (!formData.progress || formData.progress < 0 || formData.progress > 100) {
            showError('Please enter valid progress (0-100)');
            return;
          }
          await updateDevelopmentProgress(selectedBooking._id, {
            progress: parseInt(formData.progress),
            stage: formData.stage,
            developerNotes: formData.developerNotes
          });
          showSuccess('Development progress updated successfully');
          break;

        case 'website':
          if (!formData.previewUrl && !formData.finalUrl && !formData.downloadUrl) {
            showError('Please provide at least one URL');
            return;
          }

          const remainingAmount = selectedBooking.paymentDetails?.totalAmount - selectedBooking.paymentDetails?.paidAmount;
          
          if (remainingAmount > 0) {
            await updateWebsiteUrls(selectedBooking._id, {
              previewUrl: formData.previewUrl,
              liveUrl: formData.finalUrl,
              sourceCodeUrl: formData.downloadUrl
            });
            showSuccess('Website URLs updated successfully - Preview now available!');
          } else {
            await setFinalWebsiteUrl(selectedBooking._id, {
              finalUrl: formData.finalUrl,
              downloadUrl: formData.downloadUrl
            });
            showSuccess('Final website delivered successfully!');
          }
          break;

        case 'message':
          if (!formData.message.trim()) {
            showError('Please enter a message');
            return;
          }
          
          await addCommunication(selectedBooking._id, {
            message: formData.message.trim(),
            type: 'other'
          });
          showSuccess('Message sent successfully');
          break;

        default:
          showError('Invalid action');
          return;
      }

      closeModal();
      await loadBookings(pagination.currentPage);
    } catch (error) {
      console.error('Error processing request:', error);
      showError(error?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'meeting-scheduled': { bg: '#6498fe', text: 'Meeting Scheduled' },
      'meeting-completed': { bg: '#00ffab', text: 'Meeting Completed' },
      'partial-payment-pending': { bg: '#fbbf24', text: 'Payment Pending' },
      'partial-payment-done': { bg: '#8b5cf6', text: 'Development Started' },
      'development-in-progress': { bg: '#6366f1', text: 'In Development' },
      'website-ready': { bg: '#f97316', text: 'Website Ready' },
      'final-payment-pending': { bg: '#ef4444', text: 'Final Payment Due' },
      'completed': { bg: '#00ffab', text: 'Completed' }
    };

    const config = statusConfig[status] || { bg: '#9ca3af', text: status };
    
    return (
      <span 
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: config.bg }}
      >
        {config.text}
      </span>
    );
  };

  // Render modal content
  const renderModalContent = () => {
    if (!selectedBooking) return null;

    switch (modalType) {
      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-600">💰 Set Payment Percentage</h3>
              <p className="text-gray-600 mb-4">Set the percentage of payment required to start development.</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-500">Template Price</span>
                  <div className="font-bold text-lg">{formatCurrency(selectedBooking.templatePrice)}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-500">Paid Amount</span>
                  <div className="font-bold text-lg">{formatCurrency(selectedBooking.paymentDetails?.paidAmount || 0)}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.paymentPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentPercentage: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                placeholder="Enter percentage (0-100)"
                required
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Required Amount: </span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency((formData.paymentPercentage || 0) / 100 * selectedBooking.templatePrice)}
                </span>
              </div>
            </div>
          </div>
        );

      case 'meeting':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-600">📅 Update Meeting Status</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-500">Date</span>
                  <div className="font-semibold">{formatDate(selectedBooking.meetingDetails?.scheduledDate)}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-500">Time</span>
                  <div className="font-semibold">{selectedBooking.meetingDetails?.scheduledTime}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Meeting Status</label>
              <select
                value={formData.meetingStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingStatus: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-xl font-bold mb-3 text-purple-600">📊 Update Development Progress</h3>
              
              <div className="bg-white p-3 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Progress</span>
                  <span className="font-bold">{selectedBooking.developmentStatus?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${selectedBooking.developmentStatus?.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Progress %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                  placeholder="0-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                  required
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Developer Notes</label>
              <textarea
                value={formData.developerNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, developerNotes: e.target.value }))}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Add notes about current progress..."
              />
            </div>
          </div>
        );

      case 'website':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-bold mb-3 text-green-600">🔗 Update Website URLs</h3>
              <p className="text-gray-600 mb-3">Provide the website URLs for customer access</p>
              
              <div className="bg-white p-3 rounded-lg">
                <div className="text-sm text-gray-600">Payment Status: 
                  <span className="font-semibold ml-2">
                    {selectedBooking.paymentDetails?.totalAmount - selectedBooking.paymentDetails?.paidAmount <= 0 ? '✅ Fully Paid' : '⏳ Partial Payment Done'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Preview URL</label>
                <input
                  type="url"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="https://preview.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Final/Live URL</label>
                <input
                  type="url"
                  value={formData.finalUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalUrl: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Download URL (Source Code)</label>
                <input
                  type="url"
                  value={formData.downloadUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, downloadUrl: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="https://download.example.com/source.zip"
                />
              </div>
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold mb-3 text-blue-600">💬 Communication Center</h3>
              
              <div className="bg-white p-3 rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Customer: </span>
                  <span className="font-semibold">{selectedBooking.userId?.name}</span>
                  <span className="text-gray-400 ml-2">({selectedBooking.userId?.email})</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Template: </span>
                  <span className="font-semibold">{selectedBooking.templateName}</span>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-50 pb-2">
                💬 Previous Messages ({selectedBooking.communications?.length || 0})
              </h4>
              
              {selectedBooking.communications && selectedBooking.communications.length > 0 ? (
                <div className="space-y-3">
                  {selectedBooking.communications
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((comm, index) => (
                      <div key={index} className={`flex ${comm.isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          comm.isAdminMessage 
                            ? 'bg-blue-500 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                        }`}>
                          <div className="text-sm">{comm.message}</div>
                          <div className={`text-xs mt-1 ${comm.isAdminMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                            {comm.isAdminMessage ? 'Admin' : 'Customer'} • {formatDateTime(comm.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2 opacity-30">💬</span>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* New Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Send New Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Type your message to the customer..."
                required
              />
              <div className="text-xs text-gray-500 mt-2">
                Customer will be notified via email about your message
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader size="xl" color="#6498fe" />
          <p className="mt-6 text-xl text-gray-600 font-medium">Loading template bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 md:p-8 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">📋 Template Bookings Manager</h1>
              <p className="text-blue-100 text-lg">Manage B2C template bookings and development progress</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center">
                <span className="text-2xl font-bold block">{pagination.totalBookings}</span>
                <div className="text-xs text-blue-100">Total</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center">
                <span className="text-2xl font-bold block text-green-300">
                  {bookings.filter(b => b.status === 'completed').length}
                </span>
                <div className="text-xs text-blue-100">Completed</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center">
                <span className="text-2xl font-bold block text-orange-300">
                  {bookings.filter(b => b.status === 'development-in-progress').length}
                </span>
                <div className="text-xs text-blue-100">Active</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-center">
                <span className="text-2xl font-bold block text-red-300">
                  {bookings.filter(b => 
                    b.communications && 
                    b.communications.filter(c => !c.isAdminMessage).length > 
                    b.communications.filter(c => c.isAdminMessage).length
                  ).length}
                </span>
                <div className="text-xs text-blue-100">New Messages</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadBookings(pagination.currentPage, true)}
            className="mt-6 flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-semibold transition-all"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 shadow-xl border-0 bg-white">
          <h2 className="text-xl font-bold mb-6 text-gray-800">🔍 Filters & Search</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="meeting-scheduled">Meeting Scheduled</option>
                <option value="meeting-completed">Meeting Completed</option>
                <option value="partial-payment-pending">Payment Pending</option>
                <option value="development-in-progress">In Development</option>
                <option value="website-ready">Website Ready</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                  handleSearchChange(e.target.value);
                }}
                placeholder="Search by template, booking ID, customer..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="templatePrice-desc">Highest Price</option>
                <option value="templatePrice-asc">Lowest Price</option>
                <option value="status-asc">Status A-Z</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="p-16 text-center shadow-xl">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Bookings Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {filters.status || filters.search ? 
                'No bookings match your current filters. Try adjusting your search criteria.' : 
                'No template bookings available yet. New bookings will appear here.'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <Card key={booking._id} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                  {/* Booking Details */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {booking.templateId?.previewImage ? (
                          <img 
                            src={booking.templateId.previewImage.startsWith('http') ? 
                              booking.templateId.previewImage : 
                              `http://localhost:5000${booking.templateId.previewImage}`
                            }
                            alt={booking.templateName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-blue-500">🖼️</div>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 mb-1">{booking.templateName}</div>
                        <div className="text-sm text-gray-500 mb-1">#{booking.bookingId || booking._id.slice(-8)}</div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(booking.templatePrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Meeting */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span className="font-semibold text-gray-900">{booking.userId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <span className="text-gray-600 text-sm">{booking.userId?.email || 'N/A'}</span>
                    </div>
                    {booking.meetingDetails && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">📅</span>
                          <span className="font-semibold text-gray-900">
                            {formatDate(booking.meetingDetails.scheduledDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>⏰</span>
                          <span className="text-gray-600">{booking.meetingDetails.scheduledTime}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Progress & Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-blue-600">
                        {booking.developmentStatus?.progress || 0}%
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold capitalize bg-green-100 text-green-700">
                        {booking.developmentStatus?.stage?.replace('-', ' ') || 'not started'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${booking.developmentStatus?.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="mt-3">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => openModal('payment', booking)}
                      className="p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-blue-500"
                      title="Set Payment"
                    >
                      💰
                    </button>
                    <button
                      onClick={() => openModal('meeting', booking)}
                      className="p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-blue-500"
                      title="Update Meeting"
                    >
                      📅
                    </button>
                    <button
                      onClick={() => openModal('progress', booking)}
                      className="p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-blue-500"
                      title="Update Progress"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => openModal('website', booking)}
                      className="p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-blue-500"
                      title="Set URLs"
                    >
                      🔗
                    </button>
                    <button
                      onClick={() => openModal('message', booking)}
                      className="relative p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-green-500"
                      title="Send Message"
                    >
                      💬
                      {booking.communications && 
                       booking.communications.filter(c => !c.isAdminMessage).length > 
                       booking.communications.filter(c => c.isAdminMessage).length && (
                        <>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking._id, booking.templateName)}
                      className="p-3 rounded-lg text-white hover:opacity-80 transition-opacity shadow-md bg-red-500"
                      title="Delete Booking"
                      disabled={processing}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <button
              disabled={pagination.currentPage === 1 || loading}
              onClick={() => loadBookings(pagination.currentPage - 1)}
              className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-blue-600"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                const pageNumber = pagination.currentPage - 2 + index;
                if (pageNumber < 1 || pageNumber > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => loadBookings(pageNumber)}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: pageNumber === pagination.currentPage ? '#6498fe' : 'transparent',
                      color: pageNumber === pagination.currentPage ? 'white' : '#6b7280'
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-3 bg-gray-100 rounded-xl">
              <span className="text-sm font-semibold text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>

            <button
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              onClick={() => loadBookings(pagination.currentPage + 1)}
              className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-blue-600"
            >
              Next →
            </button>
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={closeModal} 
          size="lg"
          className="border-0 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderModalContent()}
            
            <div className="flex flex-col md:flex-row justify-end gap-4 pt-8 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                disabled={processing}
                className="w-full md:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="w-full md:w-auto flex items-center justify-center px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:shadow-lg"
                style={{ backgroundColor: processing ? '#9ca3af' : '#6498fe' }}
              >
                {processing ? (
                  <>
                    <span className="animate-spin mr-3">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-3">✅</span>
                    Update Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Loading Overlay */}
        {loading && bookings.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
              <Loader size="xl" color="#6498fe" className="mb-4" />
              <p className="text-xl font-semibold text-gray-600">Loading bookings...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTemplateBookingManager;
