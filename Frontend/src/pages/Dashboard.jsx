import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import templateBookingAPI from '../services/templateBookingApi';
import { formatDate } from '../utils/helpers';

// ✅ CUSTOM DATE & TIME PICKER - FULLY RESPONSIVE
const CustomDateTimePicker = memo(({ selectedDate, selectedTime, onDateSelect, onTimeSelect }) => {
  const getAvailableDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    
    let startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      dates.push({
        date: date,
        displayDate: date.getDate(),
        displayMonth: date.toLocaleDateString('en-US', { month: 'short' }),
        displayDay: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toISOString().split('T')[0]
      });
    }
    
    return dates;
  }, []);

  const getAvailableTimeSlots = useMemo(() => {
    const allSlots = ['10:00', '12:00', '14:00', '16:00', '20:00'];
    
    if (!selectedDate) return [];
    
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (selectedDateTime.getTime() === tomorrow.getTime()) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinutes;
      
      return allSlots.filter(slot => {
        const [slotHour] = slot.split(':').map(Number);
        const slotTimeInMinutes = slotHour * 60;
        return currentTimeInMinutes < slotTimeInMinutes;
      });
    }
    
    return allSlots;
  }, [selectedDate]);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          📅 Select Meeting Date <span className="text-red-500">*</span>
        </label>
        {/* ✅ RESPONSIVE GRID: 3 columns on mobile, 5 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {getAvailableDates.map((dateObj, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onDateSelect(dateObj.fullDate)}
              className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 ${
                selectedDate === dateObj.fullDate
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-105'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-gray-900'
              }`}
            >
              <span className="text-xs font-medium opacity-75 mb-1">{dateObj.displayDay}</span>
              <div className='flex justify-center items-baseline gap-1'>
                <span className="text-xl sm:text-2xl font-bold">{dateObj.displayDate}</span>
                <span className="text-xs font-medium opacity-75">{dateObj.displayMonth}</span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          ⏰ Meetings scheduled at least 24 hours in advance
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          🕐 Select Meeting Time <span className="text-red-500">*</span>
        </label>
        
        {!selectedDate ? (
          <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <span className="text-gray-500 text-sm font-medium">👆 Select a date first</span>
          </div>
        ) : getAvailableTimeSlots.length > 0 ? (
          // ✅ RESPONSIVE GRID: 2 columns on mobile, 3 on desktop
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {getAvailableTimeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onTimeSelect(time)}
                className={`p-3 sm:p-4 text-sm font-bold rounded-xl border-2 transition-all duration-200 ${
                  selectedTime === time
                    ? 'border-green-600 bg-green-600 text-white shadow-lg scale-105'
                    : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50 text-gray-900'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 border-2 border-gray-300 rounded-xl bg-gray-50">
            <div className="text-gray-600 text-sm font-medium">😔 No slots available for this date</div>
            <div className="text-xs text-gray-500 mt-1">Please select another date</div>
          </div>
        )}
      </div>
    </div>
  );
});

CustomDateTimePicker.displayName = 'CustomDateTimePicker';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateCredits } = useAuth();
  const { addNotification } = useNotification();
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [websiteId, setWebsiteId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [wantMeeting, setWantMeeting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const credits = user?.credits ?? 0;

   useEffect(() => {
    document.title = "Dashboard | 3Digree";
  }, []);

  // ✅ IMPROVED BODY SCROLL LOCK
  useEffect(() => {
    if (showBookingModal) {
      const scrollY = window.scrollY;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
  }, [showBookingModal]);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
      loadRecentBookings();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await templateBookingAPI.getDashboardStats();
      setDashboardStats(response.data || {});
    } catch (error) {
      console.error('❌ Dashboard API Error:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

 const loadRecentBookings = async () => {
  try {
    // ✅ NEW: Use website-booking API
    const response = await fetch('https://ek-startup-kar-leta-hu-kya-hi-ho-jayega.onrender.com/api/website-booking/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      // ✅ FIXED: data.data is the array
      if (data.success && Array.isArray(data.data)) {
        setRecentBookings(data.data.slice(0, 3));
      } else {
        setRecentBookings([]);
      }
    }
  } catch (error) {
    console.error('❌ Recent bookings error:', error);
    setRecentBookings([]);
  }
};


  const handleWebsiteIdChange = async (e) => {
    const id = e.target.value.trim();
    setWebsiteId(id);
    setSelectedTemplate(null);

    if (id.length >= 6) {
      try {
        setSearchLoading(true);
        
        let response;
        if (id.match(/^#?3di-[a-f0-9]{6}$/i)) {
          const cleanId = id.replace(/^#?3di-/i, '');
          response = await fetch(`http://localhost:5000/api/templates/display/${cleanId}`);
        } else {
          response = await fetch(`http://localhost:5000/api/templates/website/${id}`);
        }

        if (response.ok) {
          const data = await response.json();
          setSelectedTemplate(data.data);
          addNotification({
            type: 'success',
            message: `✅ Template "${data.data.name}" found!`
          });
        } else {
          setSelectedTemplate(null);
          if (id.length > 6) {
            addNotification({
              type: 'error',
              message: '❌ Template not found with this ID'
            });
          }
        }
      } catch (error) {
        console.error('Template lookup error:', error);
        setSelectedTemplate(null);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleLivePreview = () => {
    if (selectedTemplate?.liveDemo || selectedTemplate?.templateLink) {
      window.open(selectedTemplate.liveDemo || selectedTemplate.templateLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBuyClick = () => {
    if (credits < 1) {
      addNotification({
        type: 'error',
        message: '⚠️ Insufficient credits! Buy more credits first.'
      });
      return;
    }

    if (!selectedTemplate) {
      addNotification({
        type: 'error',
        message: '⚠️ Please enter a valid Website ID first'
      });
      return;
    }

    setWantMeeting(false);
    setSelectedDate('');
    setSelectedTime('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (wantMeeting && (!selectedDate || !selectedTime)) {
      addNotification({
        type: 'error',
        message: '⚠️ Please select both date and time for the meeting'
      });
      return;
    }

    if (!selectedTemplate) {
      addNotification({
        type: 'error',
        message: '⚠️ Template not found'
      });
      return;
    }

    try {
      setBookingLoading(true);
      
      const templateDisplayId = websiteId.startsWith('#') 
        ? websiteId 
        : `#3di-${websiteId.replace(/^3di-/i, '')}`;
      
      const meetingDetails = wantMeeting ? {
        meetingDate: selectedDate,
        meetingTime: selectedTime
      } : {};

      const response = await templateBookingAPI.purchaseWebsite(templateDisplayId, meetingDetails);
      
      const message = wantMeeting 
        ? `✅ Website booked! Meeting scheduled for ${selectedDate} at ${selectedTime}. (${credits - 1} credits remaining)`
        : `✅ Website booked successfully! (${credits - 1} credits remaining)`;

      addNotification({
        type: 'success',
        message
      });

      if (updateCredits) {
        updateCredits(credits - 1);
      }

      setWebsiteId('');
      setSelectedTemplate(null);
      setShowBookingModal(false);
      loadDashboardData();
      loadRecentBookings();
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Booking failed. Please try again.'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      addNotification({
        type: 'info',
        message: 'Meeting link will be shared before the scheduled time'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      

      {/* Website ID Paste Booking Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-3xl border border-blue-100">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-blue-600">🎯</span>
          Quick Book by Website ID
        </h3>
        
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Website ID (e.g., #3di-43275f)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste Website ID here"
                  value={websiteId}
                  onChange={handleWebsiteIdChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-lg pr-12"
                  disabled={bookingLoading}
                />
                {searchLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Copy ID from template catalog and paste here
              </p>
            </div>

            {selectedTemplate && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-blue-200 animate-fadeIn">
                <div className="flex items-start gap-3 sm:gap-4">
                  <img
                    src={selectedTemplate.previewImage || '/placeholder-template.jpg'}
                    alt={selectedTemplate.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">
                      {selectedTemplate.name}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-mono font-bold rounded-lg">
                        {websiteId}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleLivePreview}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                      </svg>
                      Live Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTemplate && (
              <button
                onClick={handleBuyClick}
                disabled={credits < 1}
                className={`w-full py-3 sm:py-4 px-6 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  credits >= 1
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="text-xl">🚀</span>
                Book This Website (1 Credit)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ FULLY RESPONSIVE MODAL */}
      {showBookingModal && (
        <div 
          className="fixed inset-0 z-[9999] h-full overflow-y-auto"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowBookingModal(false)}
        >
          <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 flex items-center justify-center">
            <div 
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col relative"
              style={{ maxHeight: '95vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">🎉 Confirm Booking</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              {/* ✅ SCROLLABLE CONTENT */}
              <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
                {/* Template Preview - Hidden when meeting toggle is ON */}
                {selectedTemplate && !wantMeeting && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedTemplate.previewImage || '/placeholder-template.jpg'}
                        alt={selectedTemplate.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-gray-900">{selectedTemplate.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">ID: {websiteId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meeting Toggle */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 mb-4">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">Want a free meeting with 3Digree?</p>
                      <p className="text-xs text-gray-600 mt-1">Discuss your requirements in a 10-min call</p>
                    </div>
                    
                    <button
                      onClick={() => setWantMeeting(!wantMeeting)}
                      className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                        wantMeeting ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white transition-transform ${
                          wantMeeting ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Meeting Scheduler */}
                {wantMeeting && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 animate-fadeIn">
                    <CustomDateTimePicker
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onDateSelect={setSelectedDate}
                      onTimeSelect={setSelectedTime}
                    />
                  </div>
                )}
              </div>

              {/* Footer - Fixed */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 flex gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading || (wantMeeting && (!selectedDate || !selectedTime))}
                  className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base rounded-xl transition-all ${
                    !bookingLoading && (!wantMeeting || (selectedDate && selectedTime))
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Booking...</span>
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">Book Website (1 Credit)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="text-4xl mb-2">📋</div>
              No bookings yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.templateImage || booking.templateId?.previewImage || '/placeholder-template.jpg'}
                      alt={booking.templateName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                        {booking.templateName}
                      </h4>
                      {booking.meetingDetails ? (
                        <p className="text-xs text-gray-600 mt-1">
                          📅 {formatDate(booking.meetingDetails.scheduledDate)} • 
                          🕐 {booking.meetingDetails.scheduledTime}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 mt-1">
                          📅 {formatDate(booking.purchasedAt || booking.createdAt)}
                        </p>
                      )}
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {booking.meetingDetails?.meetingLink && (
                      <button
                        onClick={() => handleJoinMeeting(booking.meetingDetails.meetingLink)}
                        className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex-shrink-0"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



{/* Credits & Stats Header */}
     
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Credits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{credits}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              credits > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {credits > 0 ? '🎫' : '⚠️'}
            </div>
          </div>
          {credits === 0 ? (
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2 underline"
            >
              Buy Credits Now →
            </button>
          ) : (
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-gray-600 hover:text-blue-600 font-medium mt-2"
            >
              Buy More Credits
            </button>
          )}
        </div>

          
 
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
