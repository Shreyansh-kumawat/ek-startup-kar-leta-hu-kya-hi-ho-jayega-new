import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import { getUserBookings } from '../services/templateBookingApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/helpers';

// AI Video Tutorial Component for Bookings Page (Video 14)
const AIVideoTutorialBookings = memo(() => {
  // Check for video 14 ticket (after booking redirect to /dashboard/bookings)
  const hasVideo14Ticket = sessionStorage.getItem('video14Ticket') === 'active';
  
  const [isVisible, setIsVisible] = useState(hasVideo14Ticket);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const frameSkipCounter = useRef(0);
  const hasTriggeredJoinMeetingBlink = useRef(false);
  const hasTriggeredViewDetailsBlink17s = useRef(false);
  const hasStartedContinuousBlink = useRef(false);

  useEffect(() => {
    if (hasVideo14Ticket) {
      sessionStorage.removeItem('video14Ticket'); // Use ticket once
      console.log('🎫 Video 14 ticket used on Bookings page!');
    }
  }, [hasVideo14Ticket]);

  const handleVideoEnd = () => {
    console.log('✅ Video 14 completed - Showing text overlay');
    setShowTextOverlay(true); // Show text overlay when video ends
  };

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsVisible(false);
    setShowTextOverlay(false);
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.paused || video.ended) return;

    frameSkipCounter.current++;
    if (frameSkipCounter.current % 2 !== 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true 
    });

    const scale = 0.5;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    // HORIZONTAL FLIP - Mirror the video
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = new Uint32Array(imageData.data.buffer);

    const topLimit = Math.floor(canvas.height * 1);
    const leftLimit = Math.floor(canvas.width * 0.4);

    // Green screen removal (adjusted for flipped video)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const inGreenArea = y < topLimit || (canvas.width - x) < leftLimit;
        
        if (inGreenArea) {
          const i = y * canvas.width + x;
          const pixel = data[i];
          
          const r = pixel & 0xff;
          const g = (pixel >> 8) & 0xff;
          const b = (pixel >> 16) & 0xff;
          
          if (g > 100 && g > r * 1.5 && g > b * 1.5) {
            data[i] = pixel & 0x00ffffff;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    if (videoRef.current && isVisible) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        // Trigger Join Meeting button blink at 10 seconds
        if (video.currentTime >= 10 && video.currentTime < 10.5 && !hasTriggeredJoinMeetingBlink.current) {
          console.log('🔥 BLINK Join Meeting Button at 10s!');
          const blinkEvent = new CustomEvent('blinkJoinMeetingButton');
          window.dispatchEvent(blinkEvent);
          hasTriggeredJoinMeetingBlink.current = true;
        }

        // Trigger View Details button blink at 17 seconds (one-time 3 blinks)
        if (video.currentTime >= 17 && video.currentTime < 17.5 && !hasTriggeredViewDetailsBlink17s.current) {
          console.log('🔥 BLINK View Details Button at 17s (one-time)!');
          const blinkEvent = new CustomEvent('blinkViewDetailsButton');
          window.dispatchEvent(blinkEvent);
          hasTriggeredViewDetailsBlink17s.current = true;
        }

        // Start continuous blink at 21 seconds (and keep it going forever)
        if (video.currentTime >= 21 && !hasStartedContinuousBlink.current) {
          console.log('🔥 START Continuous BLINK at 21s - Will continue forever!');
          hasStartedContinuousBlink.current = true;
          
          // Trigger continuous blink event to start the loop
          const startEvent = new CustomEvent('startContinuousBlink');
          window.dispatchEvent(startEvent);
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      
      frameSkipCounter.current = 0;
      hasTriggeredJoinMeetingBlink.current = false;
      hasTriggeredViewDetailsBlink17s.current = false;
      hasStartedContinuousBlink.current = false;
      
      video.load();
      video.play().then(() => {
        processFrame();
      }).catch(err => {
        console.log('Video 14 play failed:', err);
      });

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isVisible, processFrame]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50" 
      style={{ width: "15vw", minWidth: "200px" }}
    >
      <div className="relative bg-transparent rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          onEnded={handleVideoEnd}
          className="hidden"
          crossOrigin="anonymous"
        >
          <source src="/tutorials/14.mp4" type="video/mp4" />
        </video>

        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg"
        />

        {/* Text Overlay - Shows after video ends */}
        {showTextOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-pulse-scale border-2 border-white">
              <p className="text-center font-bold text-sm leading-tight">
                Click on<br />View Details
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10"
          aria-label="Close tutorial"
        >
          ×
        </button>
      </div>

      {/* Custom Animation for Text Overlay */}
      <style>{`
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

AIVideoTutorialBookings.displayName = 'AIVideoTutorialBookings';

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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0
  });

  // Check if video 14 should show
  const [showTutorial] = useState(() => {
    const hasVideo14 = sessionStorage.getItem('video14Ticket') === 'active';
    console.log('🎫 UserBookings - Checking video14Ticket:', hasVideo14);
    return hasVideo14;
  });

  // State for button blinks (only for TOP booking)
  const [isJoinMeetingBlinking, setIsJoinMeetingBlinking] = useState(false);
  const [isViewDetailsBlinking, setIsViewDetailsBlinking] = useState(false);
  const continuousBlinkIntervalRef = useRef(null);

  // Listen for blink events
  useEffect(() => {
    const handleBlinkJoinMeeting = () => {
      setIsJoinMeetingBlinking(true);
      setTimeout(() => {
        setIsJoinMeetingBlinking(false);
      }, 3000); // 3 blinks (1 second each)
    };

    const handleBlinkViewDetails = () => {
      setIsViewDetailsBlinking(true);
      setTimeout(() => {
        setIsViewDetailsBlinking(false);
      }, 3000); // 3 blinks (1 second each) - at 17s
    };

    const handleStartContinuousBlink = () => {
      console.log('🔄 Starting CONTINUOUS blink pattern');
      
      // Clear any existing interval
      if (continuousBlinkIntervalRef.current) {
        clearInterval(continuousBlinkIntervalRef.current);
      }

      // Function to trigger blink
      const triggerBlink = () => {
        console.log('✨ Triggering 2 blinks');
        setIsViewDetailsBlinking(true);
        setTimeout(() => {
          setIsViewDetailsBlinking(false);
        }, 2000); // 2 blinks (1 second each)
      };

      // Start with first blink immediately
      triggerBlink();

      // Then repeat every 4 seconds (2s blink + 2s gap)
      continuousBlinkIntervalRef.current = setInterval(() => {
        triggerBlink();
      }, 4000); // 2 seconds blink + 2 seconds gap = 4 seconds total cycle
    };

    window.addEventListener('blinkJoinMeetingButton', handleBlinkJoinMeeting);
    window.addEventListener('blinkViewDetailsButton', handleBlinkViewDetails);
    window.addEventListener('startContinuousBlink', handleStartContinuousBlink);

    return () => {
      window.removeEventListener('blinkJoinMeetingButton', handleBlinkJoinMeeting);
      window.removeEventListener('blinkViewDetailsButton', handleBlinkViewDetails);
      window.removeEventListener('startContinuousBlink', handleStartContinuousBlink);
      
      // Cleanup interval on unmount
      if (continuousBlinkIntervalRef.current) {
        clearInterval(continuousBlinkIntervalRef.current);
        continuousBlinkIntervalRef.current = null;
      }
    };
  }, []);

  const loadBookings = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };
      const response = await getUserBookings(params);

      setBookings(response.data.bookings || []);
      setPagination(response.data.pagination || {});

    } catch (error) {
      console.error('Error loading bookings:', error);
      showError('Failed to load your bookings');
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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadBookings(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      meeting_scheduled: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Meeting Scheduled',
        emoji: '📅'
      },
      meeting_completed: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Meeting Completed',
        emoji: '✅'
      },
      partial_payment_pending: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgLight: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        text: 'Payment Pending',
        emoji: '💳'
      },
      partial_payment_done: {
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
        text: 'Development Started',
        emoji: '🔧'
      },
      development_in_progress: {
        color: 'bg-indigo-500',
        textColor: 'text-indigo-800',
        bgLight: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        text: 'In Development',
        emoji: '⚡'
      },
      website_ready: {
        color: 'bg-orange-500',
        textColor: 'text-orange-800',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
        text: 'Website Ready',
        emoji: '🎯'
      },
      final_payment_pending: {
        color: 'bg-red-500',
        textColor: 'text-red-800',
        bgLight: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Final Payment Due',
        emoji: '💰'
      },
      completed: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'Completed',
        emoji: '🚀'
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

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${config.bgLight} ${config.textColor} ${config.borderColor} border`}>
        <span className="text-sm sm:text-base">{config.emoji}</span>
        <span className="whitespace-nowrap">{config.text}</span>
      </div>
    );
  };

  const getProgress = (booking) => {
    if (booking.developmentProgress) {
      return booking.developmentProgress.progress || 0;
    }

    const statusProgress = {
      meeting_scheduled: 10,
      meeting_completed: 20,
      partial_payment_pending: 25,
      partial_payment_done: 30,
      development_in_progress: 60,
      website_ready: 85,
      final_payment_pending: 90,
      completed: 100
    };

    return statusProgress[booking.status] || 0;
  };

 const handleViewDetails = (bookingId) => {
  // Stop continuous blink when user clicks View Details
  if (continuousBlinkIntervalRef.current) {
    clearInterval(continuousBlinkIntervalRef.current);
    continuousBlinkIntervalRef.current = null;
    setIsViewDetailsBlinking(false);
    console.log('⏹️ Stopped continuous blink - User clicked View Details');
  }
  
  // ✅ CREATE VIDEO 15 TICKET - So video plays on BookingDetails page
  sessionStorage.setItem('video15Ticket', 'active');
  console.log('🎫 Created video15Ticket for BookingDetails page');
  
  navigate(`/dashboard/bookings/${bookingId}`);
};

  const bookingStats = React.useMemo(() => {
    if (!Array.isArray(bookings)) return { total: 0, completed: 0, inProgress: 0 };

    return {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      inProgress: bookings.filter(b => ['development_in_progress', 'website_ready', 'partial_payment_done'].includes(b.status)).length,
      pending: bookings.filter(b => ['partial_payment_pending', 'final_payment_pending'].includes(b.status)).length
    };
  }, [bookings]);

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-8 sm:p-12 rounded-3xl shadow-2xl max-w-sm w-full">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-base sm:text-lg">Loading your bookings...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* AI Video Tutorial - Video 14 */}
      {showTutorial && <AIVideoTutorialBookings />}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Enhanced Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    My Bookings 📋
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base lg:text-xl">
                    Track your Website bookings and development progress
                  </p>
                </div>
                
                <div className="flex sm:hidden w-full gap-2">
                  <div className="flex-1 text-center bg-white/10 backdrop-blur-md rounded-xl p-3">
                    <div className="text-white font-bold text-xl">{bookingStats.total}</div>
                    <div className="text-white/80 text-xs">Total</div>
                  </div>
                  <div className="flex-1 text-center bg-white/10 backdrop-blur-md rounded-xl p-3">
                    <div className="text-white font-bold text-xl">{bookingStats.inProgress}</div>
                    <div className="text-white/80 text-xs">In Progress</div>
                  </div>
                </div>
                
                <div className="hidden sm:flex lg:flex items-center gap-3 lg:gap-4">
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4">
                    <div className="text-white font-bold text-xl lg:text-2xl">{bookingStats.total}</div>
                    <div className="text-white/80 text-xs lg:text-sm">Total Bookings</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4">
                    <div className="text-white font-bold text-xl lg:text-2xl">{bookingStats.inProgress}</div>
                    <div className="text-white/80 text-xs lg:text-sm">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Bookings', value: bookingStats.total, icon: '📋', color: 'blue' },
            { label: 'Completed', value: bookingStats.completed, icon: '🚀', color: 'blue' },
            { label: 'In Progress', value: bookingStats.inProgress, icon: '⚡', color: 'purple' },
            { label: 'Pending Payment', value: bookingStats.pending, icon: '💳', color: 'yellow' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters - Mobile Optimized */}
        <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-gray-50">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Filters & Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <span className="inline mr-2 text-blue-500">🔽</span>
                  Filter by Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 transition-all bg-white shadow-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="meeting_scheduled">Meeting Scheduled</option>
                  <option value="meeting_completed">Meeting Completed</option>
                  <option value="partial_payment_pending">Payment Pending</option>
                  <option value="development_in_progress">In Development</option>
                  <option value="website_ready">Website Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  <span className="inline mr-2" style={{ color: '#6498fe' }}>🔍</span>
                  Search Websites
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by Website name..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none transition-all bg-white shadow-sm"
                  style={{ 
                    focusBorderColor: '#6498fe',
                    ':focus': { borderColor: '#6498fe' }
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6498fe'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Bookings List - Mobile Optimized */}
        {bookings.length === 0 ? (
          <Card className="p-6 sm:p-8 lg:p-12 text-center border-0 rounded-2xl sm:rounded-3xl shadow-2xl bg-white">
            <div className="text-5xl sm:text-6xl lg:text-8xl mb-4 sm:mb-6">📋</div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No Bookings Found</h3>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
              {filters.status || filters.search 
                ? 'No bookings match your current filters. Try adjusting your search criteria.' 
                : "You haven't booked any Website yet. Start by browsing our amazing collection!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                onClick={() => navigate('/templates')}
                className="bg-blue-600 to-blue-600 hover:to-blue-700 text-white font-bold text-sm sm:text-base w-full sm:w-auto"
                style={{ borderRadius: '20px' }}
              >
                Browse Websites
              </Button>
              {(filters.status || filters.search) && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="text-sm sm:text-base w-full sm:w-auto"
                  style={{ borderRadius: '20px' }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {bookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const isTopBooking = index === 0; // ✅ Check if this is the TOP (first) booking
              
              return (
                <Card 
                  key={booking._id} 
                  className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 overflow-hidden bg-white"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
                      
                      {/* Template Image - Mobile Optimized */}
                      <div className="w-full xl:w-64 h-40 sm:h-48 bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                        {booking.templateId?.previewImage ? (
                          <img loading="lazy" 
                            src={booking.templateId.previewImage.startsWith('http') 
                              ? booking.templateId.previewImage 
                              : `http://localhost:5000${booking.templateId.previewImage}`}
                            alt={booking.templateName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center">
                              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🖼️</div>
                              <div className="text-xs sm:text-sm font-medium">No Preview</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Booking Details - Mobile Optimized */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                              {booking.templateName}
                            </h3>
                            <p className="text-gray-600 font-medium text-xs sm:text-sm">
                              Booking ID: #{booking.bookingId || booking._id.slice(-8)}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        {/* Meeting Info - Mobile Optimized with BLINK */}
                        {booking.meetingDetails && (
                          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                              <span className="text-blue-500">📅</span>
                              Meeting Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 text-xs sm:text-sm">📅</span>
                                </div>
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-600">Date</div>
                                  <div className="font-semibold text-xs sm:text-base">{formatDate(booking.meetingDetails.scheduledDate)}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-purple-600 text-xs sm:text-sm">⏰</span>
                                </div>
                                <div>
                                  <div className="text-xs sm:text-sm text-gray-600">Time</div>
                                  <div className="font-semibold text-xs sm:text-base">{booking.meetingDetails.scheduledTime}</div>
                                </div>
                              </div>
                            </div>
                            {booking.meetingDetails.meetingLink && (
                              <div className="mt-3 sm:mt-4">
                                <Button
                                  size="sm"
                                  className={`text-white text-xs sm:text-sm w-full sm:w-auto transition-all ${
                                    isTopBooking && isJoinMeetingBlinking 
                                      ? 'animate-join-meeting-blink' 
                                      : 'bg-blue-500 hover:bg-blue-600'
                                  }`}
                                  onClick={() => window.open(booking.meetingDetails.meetingLink, '_blank')}
                                  style={{ borderRadius: '12px' }}
                                >
                                  <span className="mr-2">📹</span>
                                  Join Meeting
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Progress Section - Mobile Optimized */}
                        <div className="mb-4 sm:mb-6">
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                              <span style={{ color: '#6498fe' }}>📊</span>
                              Progress
                            </h4>
                            <span className="text-base sm:text-lg font-bold text-blue-600">{getProgress(booking)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-1000 shadow-lg"
                              style={{ width: `${getProgress(booking)}%` }}
                            />
                          </div>
                        </div>

                        {/* Payment Info - Mobile Optimized */}
                        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4" style={{ background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)' }}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#c7e2ff' }}>
                                <span style={{ color: '#6498fe' }} className="text-sm sm:text-base">₹</span>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-medium" style={{ color: '#6498fe' }}>Total Price</div>
                                <div className="font-bold text-blue-900 text-sm sm:text-base lg:text-lg">{formatCurrency(booking.templatePrice)}</div>
                              </div>
                            </div>
                          </div>
                          {booking.paymentDetails && (
                            <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 text-sm sm:text-base">✅</span>
                                </div>
                                <div>
                                  <div className="text-xs sm:text-sm text-blue-600 font-medium">Amount Paid</div>
                                  <div className="font-bold text-blue-900 text-sm sm:text-base lg:text-lg">{formatCurrency(booking.paymentDetails.paidAmount || 0)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Smart Website URLs - Mobile Optimized */}
                        {booking.websiteUrls && (Object.keys(booking.websiteUrls).some(key => booking.websiteUrls[key])) && (() => {
                          const showPreview = booking.websiteUrls.previewUrl && 
                            ['partial_payment_done', 'development_in_progress', 'website_ready', 'final_payment_pending'].includes(booking.status);
                          
                          const showLive = booking.websiteUrls.finalUrl && 
                            ['completed'].includes(booking.status);
                          
                          const showSourceCode = booking.websiteUrls.downloadUrl && 
                            ['completed'].includes(booking.status);

                          if (!showPreview && !showLive && !showSourceCode) return null;

                          return (
                            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Website Links</h4>
                              {showPreview && (
                                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border" 
                                  style={{ 
                                    background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)',
                                    borderColor: '#6498fe'
                                  }}>
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                                    style={{ backgroundColor: '#6498fe' }}>
                                    <span className="text-white text-xs sm:text-sm">🌐</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-blue-900 text-xs sm:text-sm truncate">🔥 Preview Website</div>
                                    {booking.status === 'final_payment_pending' && (
                                      <div className="text-xs text-blue-700 hidden sm:block">Complete payment for live site</div>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    className="text-white hover:opacity-90 text-xs sm:text-sm flex-shrink-0"
                                    onClick={() => window.open(booking.websiteUrls.previewUrl, '_blank')}
                                    style={{ borderRadius: '12px', backgroundColor: '#6498fe' }}
                                  >
                                    View
                                  </Button>
                                </div>
                              )}
                              
                              {showLive && (
                                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">🚀</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-blue-900 text-xs sm:text-sm truncate">🚀 Live Website</div>
                                    <div className="text-xs text-blue-700 hidden sm:block">Your website is live!</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm flex-shrink-0"
                                    onClick={() => window.open(booking.websiteUrls.finalUrl, '_blank')}
                                    style={{ borderRadius: '12px' }}
                                  >
                                    Open
                                  </Button>
                                </div>
                              )}
                              
                              {showSourceCode && (
                                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-purple-50 rounded-xl sm:rounded-2xl border border-purple-200">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs sm:text-sm">📦</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-purple-900 text-xs sm:text-sm truncate">📦 Source Code</div>
                                    <div className="text-xs text-purple-700 hidden sm:block">Download your files</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm flex-shrink-0"
                                    onClick={() => window.open(booking.websiteUrls.downloadUrl, '_blank')}
                                    style={{ borderRadius: '12px' }}
                                  >
                                    Download
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Actions - Mobile Optimized with BLINK */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 lg:gap-4">
                          <Button
                            onClick={() => handleViewDetails(booking._id)}
                            className={`text-white font-semibold text-xs sm:text-sm w-full sm:w-auto transition-all ${
                              isTopBooking && isViewDetailsBlinking
                                ? 'animate-view-details-blink'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            }`}
                            style={{ borderRadius: '15px' }}
                          >
                            <span className="mr-2">👁️</span>
                            View Details
                          </Button>
                          
                          {booking.communications && booking.communications.length > 0 && (
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/dashboard/bookings/${booking._id}`, { 
                                state: { scrollTo: 'communication' }
                              })}
                              className="border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 font-semibold text-xs sm:text-sm w-full sm:w-auto"
                              style={{ borderRadius: '15px' }}
                            >
                              <span className="mr-2">💬</span>
                              Messages ({booking.communications.length})
                            </Button>
                          )}

                          {(booking.status === 'partial_payment_pending' || booking.status === 'final_payment_pending') && (
                            <Button
                              onClick={() => handleViewDetails(booking._id)}
                              className="text-white font-semibold hover:opacity-90 transition-opacity text-xs sm:text-sm w-full sm:w-auto"
                              style={{ 
                                borderRadius: '15px',
                                background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)'
                              }}
                            >
                              <span className="mr-2">₹</span>
                              Make Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination - Mobile Optimized */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 sm:mt-12 px-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => loadBookings(pagination.currentPage - 1)}
                className="border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-xs sm:text-sm flex-1 sm:flex-none"
                style={{ borderRadius: '12px' }}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-3 sm:px-6 py-1.5 sm:py-2 text-gray-600 font-medium bg-gray-50 rounded-xl sm:rounded-2xl text-xs sm:text-sm whitespace-nowrap">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.totalPages || loading}
                onClick={() => loadBookings(pagination.currentPage + 1)}
                className="border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-xs sm:text-sm flex-1 sm:flex-none"
                style={{ borderRadius: '12px' }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Loading Overlay - Mobile Optimized */}
        {loading && bookings.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-center max-w-xs w-full">
              <Loader size="lg" className="mb-3 sm:mb-4" />
              <p className="text-gray-700 font-medium text-sm sm:text-base">Loading bookings...</p>
            </div>
          </div>
        )}
      </div>

      {/* CSS ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }

        /* Join Meeting Button Blink - bg-blue-400 to bg-blue-500 */
        @keyframes joinMeetingBlink {
          0%, 100% {
            background-color: rgb(59, 130, 246); /* bg-blue-500 */
          }
          50% {
            background-color: rgb(96, 165, 250); /* bg-blue-400 */
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.8);
          }
        }
        
        .animate-join-meeting-blink {
          animation: joinMeetingBlink 1s ease-in-out 3;
        }

        /* View Details Button Blink - from-blue-600 to-purple-600 AND from-blue-500 to-purple-500 */
        @keyframes viewDetailsBlink {
          0%, 100% {
            background: linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)); /* from-blue-600 to-purple-600 */
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          50% {
            background: linear-gradient(to right, rgb(59, 130, 246), rgb(168, 85, 247)); /* from-blue-500 to-purple-500 */
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(59, 130, 246, 0.4);
            transform: scale(1.02);
          }
        }
        
        .animate-view-details-blink {
          animation: viewDetailsBlink 1s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default UserBookings;
