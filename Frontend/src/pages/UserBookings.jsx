import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Loader from '../components/Loader';
import { formatDate } from '../utils/helpers';
import {
  LuPackage, LuWrench, LuZap, LuClock, LuCheckCircle,
  LuClipboardList, LuImage, LuGlobe, LuTarget, LuTriangleAlert,
} from 'react-icons/lu';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useNotification();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ status: '', search: '' });

  useEffect(() => {
    document.title = "My Bookings | 3Digree";
  }, []);

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
      if (bookings.length === 0) showError(error.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookings();
    const intervalId = setInterval(loadBookings, 30000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, navigate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusConfig = (status) => {
    const config = {
      purchased:          { color: 'bg-yellow-500',  text: 'Just Purchased',      Icon: LuPackage },
      approved:           { color: 'bg-blue-500',    text: 'Development Started', Icon: LuWrench },
      inprogress:         { color: 'bg-purple-500',  text: 'In Development',      Icon: LuZap },
      readyforcompletion: { color: 'bg-orange-500',  text: 'Almost Ready',        Icon: LuClock },
      completed:          { color: 'bg-green-500',   text: 'Completed',           Icon: LuCheckCircle },
    };
    return config[status] || { color: 'bg-gray-500', text: status, Icon: LuClipboardList };
  };

  const getTimeRemaining = (estimatedCompletionAt) => {
    if (!estimatedCompletionAt) return null;
    const diff = new Date(estimatedCompletionAt) - new Date();
    if (diff <= 0) return 'Overdue';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Due soon';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return booking.templateName?.toLowerCase().includes(search) ||
             booking.bookingId?.toLowerCase().includes(search);
    }
    return true;
  });

  const stats = {
    total:      bookings.length,
    completed:  bookings.filter(b => b.status === 'completed').length,
    inProgress: bookings.filter(b => ['approved', 'inprogress', 'readyforcompletion'].includes(b.status)).length,
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',     value: stats.total,      Icon: LuClipboardList, bg: 'bg-blue-50',   fg: 'text-blue-600' },
          { label: 'Completed', value: stats.completed,  Icon: LuCheckCircle,   bg: 'bg-green-50',  fg: 'text-green-600' },
          { label: 'Active',    value: stats.inProgress, Icon: LuZap,           bg: 'bg-purple-50', fg: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.fg}`}>
              <stat.Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="purchased">Just Purchased</option>
              <option value="approved">Development Started</option>
              <option value="inprogress">In Development</option>
              <option value="readyforcompletion">Almost Ready</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Name or Booking ID..."
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <LuClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-500 text-sm">
            {filters.status || filters.search
              ? 'No bookings match your filters.'
              : "You haven't booked any website yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon   = statusConfig.Icon;
            const timeLeft     = getTimeRemaining(booking.estimatedCompletionAt);

            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex gap-4">

                  {/* Template image */}
                  <div className="w-36 h-24 sm:w-40 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
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
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <LuImage className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">{booking.templateName}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          #{booking.bookingId || booking._id.slice(-8).toUpperCase()} · {formatDate(booking.purchasedAt)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color} text-white flex items-center gap-1 flex-shrink-0`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{statusConfig.text}</span>
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress: {booking.progress || 0}%</span>
                        {timeLeft && (
                          <span className={`flex items-center gap-0.5 ${timeLeft === 'Overdue' ? 'text-red-500 font-semibold' : ''}`}>
                            {timeLeft === 'Overdue' && <LuTriangleAlert className="w-3 h-3" />}
                            {timeLeft}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${booking.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* View website link */}
                    {booking.status === 'completed' && booking.previewLink && (
                      <a
                        href={booking.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <LuGlobe className="w-3.5 h-3.5" />
                        View Website
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
  );
};

export default UserBookings;
