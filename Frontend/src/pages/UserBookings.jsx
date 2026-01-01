// Frontend\src\pages\UserBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/helpers';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

   useEffect(() => {
    document.title = "My Bookings | 3Digree";
  }, []);

  // Load bookings
  const loadBookings = async () => {
    try {
      if (bookings.length === 0) setLoading(true);
      
      const response = await fetch('https://ek-startup-kar-leta-hu-kya-hi-ho-jayega.onrender.com/api/website-booking/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      if (bookings.length === 0) {
        showError(error.message || 'Failed to load your bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadBookings();
    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing bookings...');
      loadBookings();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const config = {
      purchased: { color: 'bg-yellow-500', text: 'Just Purchased', emoji: '📦' },
      approved: { color: 'bg-blue-500', text: 'Development Started', emoji: '⚙️' },
      inprogress: { color: 'bg-purple-500', text: 'In Development', emoji: '⚡' },
      readyforcompletion: { color: 'bg-orange-500', text: 'Almost Ready', emoji: '⏳' },
      completed: { color: 'bg-green-500', text: 'Completed', emoji: '✅' }
    };
    return config[status] || { color: 'bg-gray-500', text: status, emoji: '📋' };
  };

  // Time remaining
  const getTimeRemaining = (estimatedCompletionAt) => {
    if (!estimatedCompletionAt) return null;
    const diff = new Date(estimatedCompletionAt) - new Date();
    if (diff <= 0) return '⚠️ Overdue';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `` : ``;
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return booking.templateName?.toLowerCase().includes(search) || 
             booking.bookingId?.toLowerCase().includes(search);
    }
    return true;
  });

  // Stats
  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    inProgress: bookings.filter(b => ['approved', 'inprogress', 'readyforcompletion'].includes(b.status)).length,
    purchased: bookings.filter(b => b.status === 'purchased').length
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Website Bookings 🎯</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Track your website development progress</span>
             
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: '📋' },
            { label: 'Completed', value: stats.completed, icon: '✅' },
            { label: 'Active', value: stats.inProgress, icon: '⚡' }, 
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Filter Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="purchased">📦 Just Purchased</option>
                <option value="approved">⚙️ Development Started</option>
                <option value="inprogress">⚡ In Development</option>
                <option value="readyforcompletion">⏳ Almost Ready</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.status || filters.search 
                ? 'No bookings match your filters.' 
                : "You haven't booked any website yet."}
            </p>
            
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const statusConfig = getStatusConfig(booking.status);
              
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    
                    {/* Image */}
                    <div className="w-40 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {booking.templateImage ? (
                        <img 
                          src={booking.templateImage.startsWith('http') 
                            ? booking.templateImage 
                            : `http://localhost:5000${booking.templateImage}`}
                          alt={booking.templateName}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = '/placeholder-template.jpg'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-3xl">🖼️</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{booking.templateName}</h3>
                          <p className="text-xs text-gray-500">
                            #{booking.bookingId || booking._id.slice(-8).toUpperCase()} • {formatDate(booking.purchasedAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color} text-white flex items-center gap-1`}>
                          <span>{statusConfig.emoji}</span>
                          {statusConfig.text}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress: {booking.progress || 0}%</span>
                          {booking.estimatedCompletionAt && (
                            <span>{getTimeRemaining(booking.estimatedCompletionAt)}</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${booking.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Preview Link */}
                      {booking.status === 'completed' && booking.previewLink && (
                        <a
                          href={booking.previewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                        >
                          🌐 View Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
