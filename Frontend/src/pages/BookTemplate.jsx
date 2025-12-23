// kaam ka hi nahi hai!
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { getTemplateById } from '../features/template/api';
import { 
  getAvailableMeetingSlots, 
  bookTemplate 
} from '../services/templateBookingApi';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatCurrency } from '../utils/helpers';
import { useNotification } from '../hooks/useNotification';

const BookTemplate = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // States
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  
  // 🔥 NEW: Available slots management
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Meeting form data
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    message: ''
  });

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        const response = await getTemplateById(templateId);
        let templateData = response?.data || response?.template || response;
        
        if (templateData) {
          setTemplate(templateData);
        } else {
          throw new Error('Template not found');
        }
      } catch (error) {
        console.error('❌ Error fetching template:', error);
        showError('Failed to load template details');
        navigate('/templates');
      } finally {
        setLoading(false);
      }
    };

    if (templateId && isAuthenticated) {
      fetchTemplate();
    }
  }, [templateId, isAuthenticated, navigate, showError]);

  // 🔥 NEW: Load available slots when date changes
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!meetingData.date) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        
        const response = await getAvailableMeetingSlots(meetingData.date);
        setAvailableSlots(response.data.slots || []);
        
        // Clear selected time if it's no longer available
        if (meetingData.time) {
          const selectedSlot = response.data.slots?.find(slot => slot.time === meetingData.time);
          if (!selectedSlot || !selectedSlot.available) {
            setMeetingData(prev => ({ ...prev, time: '' }));
          }
        }
      } catch (error) {
        console.error('❌ Error loading slots:', error);
        showError('Failed to load available time slots');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [meetingData.date, showError]);

  // Get minimum date (24 hours from now)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔥 NEW: Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    setMeetingData(prev => ({
      ...prev,
      time: prev.time === time ? '' : time
    }));
  };

  // Handle booking process
  const handleBookTemplate = () => {
    if (!template || template.price === 0) {
      showError('This template cannot be booked');
      return;
    }
    setShowMeetingForm(true);
  };

  // 🔥 UPGRADED: Handle meeting booking with new API
  const handleBookMeeting = async () => {
    if (!meetingData.date || !meetingData.time) {
      showError('Please select date and time for the meeting');
      return;
    }

    setIsBooking(true);
    
    try {
      const bookingData = {
        scheduledDate: meetingData.date,
        scheduledTime: meetingData.time,
        additionalRequirements: meetingData.message.trim()
      };

      const response = await bookTemplate(templateId, bookingData);
      
      showSuccess(
        `Template booked successfully! Meeting scheduled for ${meetingData.date} at ${meetingData.time}. Get the link from Dashboard > My Bookings.`
      );

      //  showSuccess(
      //   `Template booked successfully! Meeting scheduled for ${meetingData.date} at ${meetingData.time}. Check your email for meeting link.`
      // );
      
      // Navigate to user bookings instead of meetings
      navigate('/dashboard/bookings');
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      showError(error.message || 'Failed to book template. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Get template image
  const getImageSrc = () => {
    if (template?.previewImage) {
      if (template.previewImage.startsWith('http')) {
        return template.previewImage;
      }
      return `http://localhost:5000${template.previewImage}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 px-4">
        <div className="text-center bg-gradient-to-br from-white to-orange-50 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border-2 md:border-4 border-orange-300 max-w-md w-full">
          <Loader size="xl" />
          <p className="mt-3 md:mt-4 text-orange-800 font-semibold text-sm sm:text-base md:text-lg">🪔 Loading template booking... ✨</p>
          <div className="mt-3 md:mt-4 flex justify-center space-x-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 px-4">
        <Card className="p-4 sm:p-6 md:p-8 text-center max-w-md w-full bg-gradient-to-br from-white to-orange-50 border-2 md:border-4 border-orange-300 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl">
          <div className="text-4xl sm:text-5xl md:text-6xl mx-auto mb-3 md:mb-4">🪔</div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 md:mb-4">Template Not Found</h2>
          <p className="text-gray-700 mb-4 md:mb-6 text-sm md:text-base">The template you're trying to book doesn't exist.</p>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base shadow-lg border-2 border-orange-400"
            style={{ borderRadius: "50px" }} 
            onClick={() => navigate('/templates')}
          >
            Browse Templates ✨
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-4 sm:py-6 md:py-8">
      {/* Decorative Diwali Border Top */}
      <div className="h-2 md:h-3 bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600"></div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6">
        
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/templates/${templateId}`)}
            className="mb-3 sm:mb-4 text-xs sm:text-sm md:text-base border border-orange-300 text-orange-700 hover:bg-orange-50 py-2 px-3 sm:px-4"
          >
            <span className="mr-1 sm:mr-2">⬅️</span>
            Back to Template
          </Button>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-purple-700 bg-clip-text text-transparent mb-2">
            ✨ Book Template
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium">
            🪔 Schedule a meeting with our developer
          </p>
        </div>

        {/* 🔥 MOBILE-OPTIMIZED LAYOUT with order utilities */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          
          {/* 🔥 BOOKING FORM - order-1 on mobile (appears first), order-2 on lg+ (appears second) */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            
            {!showMeetingForm ? (
              // Initial booking card
              <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-orange-50 border-2 md:border-4 border-orange-300 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
                  🪔 Ready to Book?
                </h2>
                
                <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8">
                  <div className="flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-green-500 mr-2 sm:mr-3 flex-shrink-0 text-base sm:text-lg md:text-xl">✅</span>
                    <span className="text-xs sm:text-sm md:text-base text-gray-700">Meet with our expert developer</span>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-green-500 mr-2 sm:mr-3 flex-shrink-0 text-base sm:text-lg md:text-xl">✅</span>
                    <span className="text-xs sm:text-sm md:text-base text-gray-700">Discuss your requirements in detail</span>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-green-500 mr-2 sm:mr-3 flex-shrink-0 text-base sm:text-lg md:text-xl">✅</span>
                    <span className="text-xs sm:text-sm md:text-base text-gray-700">Get customization timeline</span>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-green-500 mr-2 sm:mr-3 flex-shrink-0 text-base sm:text-lg md:text-xl">✅</span>
                    <span className="text-xs sm:text-sm md:text-base text-gray-700">Start with partial payment (25%-50%)</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full text-sm sm:text-base md:text-lg py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold border-2 border-orange-400 shadow-lg md:shadow-xl"
                  onClick={handleBookTemplate}
                >
                  <span className="mr-1 sm:mr-2">📅</span>
                  Book Mini Meeting with Developer
                </Button>
                
                <p className="text-xs sm:text-sm text-gray-600 text-center mt-2 sm:mt-3 md:mt-4 leading-relaxed font-medium px-2">
                  ✨ Consult with our developer in a quick meeting to finalize this Design
                </p>
              </Card>
            ) : (
              // 🔥 UPGRADED: Meeting booking form
              <Card className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-orange-50 border-2 md:border-4 border-orange-300 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6">
                  🪔 Schedule Meeting
                </h2>
                
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* User Info Display */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-2.5 sm:p-3 md:p-4 rounded-lg md:rounded-xl border border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">👤 Your Details</h3>
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-1.5 sm:mr-2 flex-shrink-0">👤</span>
                        <span className="text-gray-700 truncate">{user.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-orange-500 mr-1.5 sm:mr-2 flex-shrink-0">📧</span>
                        <span className="break-all text-gray-700 text-xs">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <span className="text-orange-500 mr-1.5 sm:mr-2 flex-shrink-0">📞</span>
                          <span className="text-gray-700">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-bold text-orange-900 mb-1.5 sm:mb-2">
                      <span className="inline mr-1 sm:mr-2">📅</span>
                      Select Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={meetingData.date}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      ⏰ Schedule at least 24 hours in advance
                    </p>
                  </div>

                  {/* 🔥 NEW: Time Selection with Available Slots */}
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-bold text-orange-900 mb-1.5 sm:mb-2">
                      <span className="inline mr-1 sm:mr-2">⏰</span>
                      Select Time
                    </label>
                    
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-4 sm:py-6 md:py-8 border border-orange-300 rounded-md bg-gradient-to-r from-orange-50 to-yellow-50">
                        <span className="animate-spin text-orange-500 mr-2 text-base sm:text-lg md:text-xl">⏳</span>
                        <span className="text-gray-700 text-xs sm:text-sm md:text-base font-medium">Loading slots...</span>
                      </div>
                    ) : meetingData.date && availableSlots.length > 0 ? (
                     <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
  {availableSlots.map((slot) => (
    <button
      key={slot.time}
      type="button"
      onClick={() => slot.available ? handleTimeSlotSelect(slot.time) : null}
      disabled={!slot.available}
      className={`p-2 sm:p-2.5 md:p-3 lg:p-4 text-xs sm:text-sm md:text-base rounded-lg border transition-all duration-200 font-semibold ${
        meetingData.time === slot.time
          ? 'border-orange-500 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 ring-2 ring-orange-300'
          : slot.available
          ? 'border-orange-300 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 text-gray-700'
          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      <div className="font-bold">{slot.time}</div>
      
      {/* Fully Booked */}
      {!slot.available && (
        <div className="text-xs text-red-500 mt-0.5 sm:mt-1">
          Booked
        </div>
      )}
      
      {/* Only show when exactly 1 slot is left */}
      {slot.available && slot.bookedCount === 1 && (
        <div className="text-xs text-red-600 mt-0.5 sm:mt-1 font-semibold animate-pulse">
          ⚠️ Only 1 Slot Left!
        </div>
      )}
      
    </button>
  ))}
</div>


                      
                    ) : meetingData.date ? (
                      <div className="text-center py-4 sm:py-6 md:py-8 border border-orange-300 rounded-md bg-gradient-to-r from-orange-50 to-yellow-50">
                        <span className="text-orange-400 text-lg sm:text-xl md:text-2xl mx-auto mb-1 sm:mb-2 block">ℹ️</span>
                        <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">No slots available</div>
                        <div className="text-xs text-gray-600 mt-0.5 sm:mt-1">Try another date</div>
                      </div>
                    ) : (
                      <div className="text-center py-4 sm:py-6 md:py-8 border border-dashed border-orange-300 rounded-md bg-gradient-to-r from-orange-50 to-yellow-50">
                        <span className="text-orange-400 text-lg sm:text-xl md:text-2xl mx-auto mb-1 sm:mb-2 block">📅</span>
                        <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">Select a date first</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="block text-xs sm:text-sm md:text-base font-bold text-orange-900 mb-1.5 sm:mb-2">
                      💬 Additional Requirements (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={meetingData.message}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us about any specific requirements..."
                      className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {meetingData.message.length}/1000 characters
                    </p>
                  </div>

                  {/* 🔥 NEW: Meeting Info */}
                  {meetingData.date && meetingData.time && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2.5 sm:p-3 md:p-4 rounded-lg md:rounded-xl border border-green-300">
                      <h4 className="font-bold text-green-900 mb-1 sm:mb-1.5 md:mb-2 flex items-center text-xs sm:text-sm md:text-base">
                        <span className="mr-1 sm:mr-2">📹</span>
                        Meeting Scheduled ✨
                      </h4>
                      <div className="text-xs sm:text-sm text-green-800 space-y-0.5 sm:space-y-1 font-medium">
                        <div>📅 Date: {new Date(meetingData.date).toLocaleDateString('en-IN')}</div>
                        <div>🕐 Time: {meetingData.time}</div>
                        <div>📧 Google Meet link sent to email</div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMeetingForm(false);
                        setMeetingData({ date: '', time: '', message: '' });
                      }}
                      disabled={isBooking}
                      className="w-full sm:flex-1 text-xs sm:text-sm md:text-base border border-orange-300 text-orange-700 hover:bg-orange-50 py-2 sm:py-2.5"
                    >
                      ⬅️ Back
                    </Button>
                    <Button
                      onClick={handleBookMeeting}
                      disabled={isBooking || !meetingData.date || !meetingData.time}
                      className="w-full sm:flex-1 text-xs sm:text-sm md:text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold border-2 border-orange-400 py-2 sm:py-2.5"
                    >
                      {isBooking ? (
                        <>
                          <span className="animate-spin mr-1 sm:mr-2">⏳</span>
                          Booking...
                        </>
                      ) : (
                        <>
                          <span className="mr-1 sm:mr-2">✅</span>
                          Confirm Book Meeting
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Process Info */}
            <Card className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 border-2 md:border-4 border-orange-300 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
              <h4 className="font-bold text-orange-900 mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base flex items-center">
                <span className="mr-1 sm:mr-2">🪔</span>
                What Happens Next?
              </h4>
              <ul className="text-xs sm:text-sm text-gray-900 space-y-0.5 sm:space-y-1 font-medium">
                <li>• Developer joins at scheduled time</li>
                <li>• Discuss requirements & customizations</li>
                <li>• Get timeline & payment details</li>
                <li>• Start after payment confirmation</li>
                <li>• Track progress in dashboard</li>
              </ul>
            </Card>
          </div>

          {/* 🔥 TEMPLATE PREVIEW - order-2 on mobile (appears second), order-1 on lg+ (appears first) */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
            <Card className="overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 md:border-4 border-orange-200 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
              <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 border-b-2 md:border-b-4 border-orange-300">
                {getImageSrc() ? (
                  <img loading="lazy" 
                    src={getImageSrc()}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-orange-400">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">🪔</div>
                    <div className="text-xs sm:text-sm md:text-base font-medium">No Preview</div>
                  </div>
                )}
              </div>
              
              <div className="p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-2.5 md:mb-3">
                  {template.name} ✨
                </h3>
                <p className="text-gray-700 mb-3 sm:mb-4 md:mb-5 text-xs sm:text-sm md:text-base leading-relaxed">
                  {template.description || 'Professional website template ready for customization.'}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    <span className="mr-0.5 sm:mr-1">₹</span>
                    {formatCurrency(template.price)}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(template.liveDemo || template.templateLink, '_blank')}
                    className="w-full sm:w-auto text-xs sm:text-sm md:text-base border border-orange-300 text-orange-700 hover:bg-orange-50 py-2"
                  >
                    View Live Demo 🔗
                  </Button>
                </div>
                <div className='text-sm sm:text-base md:text-lg lg:text-xl font-bold text-orange-900 bg-gradient-to-r from-yellow-200 to-orange-200 w-fit px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg md:rounded-xl my-2 sm:my-3 md:my-4 border border-orange-300'>
                  {template.price >= 1400 ? '🪔 Free Domain + Hosting' : '🪔 Free Web Hosting'}
                </div>
              </div>
            </Card>

            {/* Template Information */}
            <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-white to-yellow-50 border-2 md:border-4 border-orange-200 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                📋 Template Information
              </h3>
              
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-xs sm:text-sm md:text-base">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <span className="text-gray-700 font-medium">Template ID:</span>
                  <span className="font-mono text-xs sm:text-sm bg-orange-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-orange-300">#{template._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <span className="text-gray-700 font-medium">Category:</span>
                  <span className="text-orange-800 font-semibold text-xs sm:text-sm">{template.category || 'Web Template'}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                  <span className="text-gray-700 font-medium">Responsive:</span>
                  <span className="text-green-600 font-semibold text-xs sm:text-sm">✅ Mobile Friendly</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Decorative Diwali Border Bottom */}
      <div className="h-2 md:h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-orange-600 mt-6 sm:mt-8"></div>
    </div>
  );
};

export default BookTemplate;



// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../features/auth/useAuth';
// import { getTemplateById } from '../features/template/api';
// import { 
//   getAvailableMeetingSlots, 
//   bookTemplate 
// } from '../services/templateBookingApi';
// import Button from '../components/Button';
// import Card from '../components/Card';
// import Loader from '../components/Loader';
// import { formatCurrency } from '../utils/helpers';
// import { useNotification } from '../hooks/useNotification';

// const BookTemplate = () => {
//   const { templateId } = useParams();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useAuth();
//   const { showSuccess, showError } = useNotification();
  
//   // States
//   const [template, setTemplate] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isBooking, setIsBooking] = useState(false);
//   const [showMeetingForm, setShowMeetingForm] = useState(false);
  
//   // 🔥 NEW: Available slots management
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);
  
//   // Meeting form data
//   const [meetingData, setMeetingData] = useState({
//     date: '',
//     time: '',
//     message: ''
//   });

//   // Fetch template data
//   useEffect(() => {
//     const fetchTemplate = async () => {
//       if (!isAuthenticated) {
//         navigate('/login');
//         return;
//       }

//       try {
//         setLoading(true);
//         // console.log('🔍 Fetching template for booking:', templateId);
        
//         const response = await getTemplateById(templateId);
//         let templateData = response?.data || response?.template || response;
        
//         if (templateData) {
//           setTemplate(templateData);
//         } else {
//           throw new Error('Template not found');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching template:', error);
//         showError('Failed to load template details');
//         navigate('/templates');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (templateId && isAuthenticated) {
//       fetchTemplate();
//     }
//   }, [templateId, isAuthenticated, navigate, showError]);

//   // 🔥 NEW: Load available slots when date changes
//   useEffect(() => {
//     const loadAvailableSlots = async () => {
//       if (!meetingData.date) {
//         setAvailableSlots([]);
//         return;
//       }

//       try {
//         setLoadingSlots(true);
//         // console.log('🔍 Loading available slots for:', meetingData.date);
        
//         const response = await getAvailableMeetingSlots(meetingData.date);
//         setAvailableSlots(response.data.slots || []);
        
//         // Clear selected time if it's no longer available
//         if (meetingData.time) {
//           const selectedSlot = response.data.slots?.find(slot => slot.time === meetingData.time);
//           if (!selectedSlot || !selectedSlot.available) {
//             setMeetingData(prev => ({ ...prev, time: '' }));
//           }
//         }
//       } catch (error) {
//         console.error('❌ Error loading slots:', error);
//         showError('Failed to load available time slots');
//         setAvailableSlots([]);
//       } finally {
//         setLoadingSlots(false);
//       }
//     };

//     loadAvailableSlots();
//   }, [meetingData.date, showError]);

//   // Get minimum date (24 hours from now)
//   const getMinDate = () => {
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     return tomorrow.toISOString().split('T')[0];
//   };

//   // Get maximum date (30 days from now)
//   const getMaxDate = () => {
//     const maxDate = new Date();
//     maxDate.setDate(maxDate.getDate() + 30);
//     return maxDate.toISOString().split('T')[0];
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setMeetingData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // 🔥 NEW: Handle time slot selection
//   const handleTimeSlotSelect = (time) => {
//     setMeetingData(prev => ({
//       ...prev,
//       time: prev.time === time ? '' : time
//     }));
//   };

//   // Handle booking process
//   const handleBookTemplate = () => {
//     if (!template || template.price === 0) {
//       showError('This template cannot be booked');
//       return;
//     }
//     setShowMeetingForm(true);
//   };

//   // 🔥 UPGRADED: Handle meeting booking with new API
//   const handleBookMeeting = async () => {
//     if (!meetingData.date || !meetingData.time) {
//       showError('Please select date and time for the meeting');
//       return;
//     }

//     setIsBooking(true);
    
//     try {
   

//       const bookingData = {
//         scheduledDate: meetingData.date,
//         scheduledTime: meetingData.time,
//         additionalRequirements: meetingData.message.trim()
//       };

//       const response = await bookTemplate(templateId, bookingData);
      
//       // console.log('✅ Template booking successful:', response);
      
//       showSuccess(
//         `Template booked successfully! Meeting scheduled for ${meetingData.date} at ${meetingData.time}. Check your email for meeting link.`
//       );
      
//       // Navigate to user bookings instead of meetings
//       navigate('/dashboard/bookings');
      
//     } catch (error) {
//       console.error('❌ Booking error:', error);
//       showError(error.message || 'Failed to book template. Please try again.');
//     } finally {
//       setIsBooking(false);
//     }
//   };

//   // Get template image
//   const getImageSrc = () => {
//     if (template?.previewImage) {
//       if (template.previewImage.startsWith('http')) {
//         return template.previewImage;
//       }
//       return `http://localhost:5000${template.previewImage}`;
//     }
//     return null;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//         <div className="text-center">
//           <Loader size="xl" />
//           <p className="mt-4 text-gray-600 text-base md:text-lg">Loading template booking...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!template) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//         <Card className="p-6 md:p-8 text-center max-w-md w-full">
//           <div className="text-5xl md:text-6xl text-yellow-500 mx-auto mb-4">⚠️</div>
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Template Not Found</h2>
//           <p className="text-gray-600 mb-6 text-sm md:text-base">The template you're trying to book doesn't exist.</p>
//           <Button 
//             className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 md:px-8 py-3 md:py-4 shadow-lg hover:bg-blue-700 transition-all duration-200"
//             style={{ borderRadius: "50px" }} 
//             onClick={() => navigate('/templates')}
//           >
//             Browse Templates
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-6 md:py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <Button 
//             variant="outline" 
//             onClick={() => navigate(`/templates/${templateId}`)}
//             className="mb-4 text-sm md:text-base"
//           >
//             <span className="mr-2">⬅️</span>
//             Back to Template
//           </Button>
          
//           <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
//             Book Template
//           </h1>
//           <p className="text-gray-600 text-base md:text-lg">
//             Schedule a meeting with our developer to discuss your requirements
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          
//           {/* Template Preview */}
//           <div className="space-y-4 md:space-y-6">
//             <Card className="overflow-hidden">
//               <div className="aspect-w-16 aspect-h-12 bg-gray-200 flex items-center justify-center h-48 md:h-64 lg:h-72">
//                 {getImageSrc() ? (
//                   <img loading="lazy" 
//                     src={getImageSrc()}
//                     alt={template.name}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="text-center text-gray-400">
//                     <div className="text-3xl md:text-4xl mb-2">🖼️</div>
//                     <div className="text-sm md:text-base">No Preview</div>
//                   </div>
//                 )}
//               </div>
              
//               <div className="p-4 md:p-6">
//                 <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
//                   {template.name}
//                 </h3>
//                 <p className="text-gray-600 mb-4 md:mb-5 text-sm md:text-base leading-relaxed">
//                   {template.description || 'Professional website template ready for customization.'}
//                 </p>
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                   <div className="flex items-center text-xl md:text-2xl lg:text-3xl font-bold text-green-700">
//                     <span className="mr-1">₹</span>
//                     {formatCurrency(template.price)}
//                   </div>
                  
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => window.open(template.liveDemo || template.templateLink, '_blank')}
//                     className="w-full sm:w-auto text-sm md:text-base"
//                   >
//                     View Live Demo
//                   </Button>
//                 </div>
//                  <div className='text-2xl font-semibold text-blue-500 bg-blue-600/15 w-fit  p-2 rounded-xl my-4'>
//                 {template.price >= 1400 ? 'Free Domain + Web Hosting' : 'Free Web Hosting'
//                 }
//               </div>
//               </div>
//             </Card>

//             {/* Template Information */}
//             <Card className="p-4 md:p-6">
//               <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-3 md:mb-4">
//                 Template Information
//               </h3>
              
//               <div className="space-y-3 text-sm md:text-base">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Template ID:</span>
//                   <span className="font-mono text-xs md:text-sm">#{template._id.slice(-8)}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Category:</span>
//                   <span>{template.category || 'Web Template/Design'}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Responsive:</span>
//                   <span className="text-green-600 text-sm md:text-base">✅ Mobile Friendly</span>
//                 </div>
                
//               </div>
//             </Card>
//           </div>

//           {/* Booking Form */}
//           <div className="space-y-4 md:space-y-6">
            
//             {!showMeetingForm ? (
//               // Initial booking card
//               <Card className="p-4 md:p-6">
//                 <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
//                   Ready to Book?
//                 </h2>
                
//                 <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
//                   <div className="flex items-center">
//                     <span className="text-green-500 mr-3 flex-shrink-0">✅</span>
//                     <span className="text-sm md:text-base">Meet with our expert developer</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-green-500 mr-3 flex-shrink-0">✅</span>
//                     <span className="text-sm md:text-base">Discuss your requirements in detail</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-green-500 mr-3 flex-shrink-0">✅</span>
//                     <span className="text-sm md:text-base">Get customization timeline</span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-green-500 mr-3 flex-shrink-0">✅</span>
//                     <span className="text-sm md:text-base">Start with partial payment (usually 25%-50%)</span>
//                   </div>
//                 </div>

//                 <Button
//                   size="lg"
//                   className="w-full text-sm md:text-base lg:text-lg py-3 md:py-4"
//                   onClick={handleBookTemplate}
//                 >
//                   <span className="mr-2">📅</span>
//                   Book Mini Meeting with Developer
//                 </Button>
                
//                 <p className="text-xs md:text-sm text-gray-500 text-center mt-3 md:mt-4 leading-relaxed">
//                   Consult with our developer in a quick meeting to finalize this Design and Get Your Website Ready Quickly
//                 </p>
//               </Card>
//             ) : (
//               // 🔥 UPGRADED: Meeting booking form
//               <Card className="p-4 md:p-6">
//                 <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
//                   Schedule Meeting
//                 </h2>
                
//                 <div className="space-y-4 md:space-y-6">
//                   {/* User Info Display */}
//                   <div className="bg-gray-50 p-3 md:p-4 rounded-lg md:rounded-xl">
//                     <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Your Details</h3>
//                     <div className="space-y-2 text-xs md:text-sm">
//                       <div className="flex items-center">
//                         <span className="text-gray-400 mr-2 flex-shrink-0">👤</span>
//                         <span>{user.name}</span>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="text-gray-400 mr-2 flex-shrink-0">📧</span>
//                         <span className="break-all">{user.email}</span>
//                       </div>
//                       {user.phone && (
//                         <div className="flex items-center">
//                           <span className="text-gray-400 mr-2 flex-shrink-0">📞</span>
//                           <span>{user.phone}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Date Selection */}
//                   <div>
//                     <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
//                       <span className="inline mr-2">📅</span>
//                       Select Date
//                     </label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={meetingData.date}
//                       onChange={handleInputChange}
//                       min={getMinDate()}
//                       max={getMaxDate()}
//                       className="w-full px-3 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md md:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       required
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       Meetings must be scheduled at least 24 hours in advance
//                     </p>
//                   </div>

//                   {/* 🔥 NEW: Time Selection with Available Slots */}
//                   <div>
//                     <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
//                       <span className="inline mr-2">⏰</span>
//                       Select Time
//                     </label>
                    
//                     {loadingSlots ? (
//                       <div className="flex items-center justify-center py-6 md:py-8 border border-gray-300 rounded-md md:rounded-lg">
//                         <span className="animate-spin text-blue-500 mr-2">⏳</span>
//                         <span className="text-gray-600 text-sm md:text-base">Loading available slots...</span>
//                       </div>
//                     ) : meetingData.date && availableSlots.length > 0 ? (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
//                         {availableSlots.map((slot) => (
//                           <button
//                             key={slot.time}
//                             type="button"
//                             onClick={() => slot.available ? handleTimeSlotSelect(slot.time) : null}
//                             disabled={!slot.available}
//                             className={`p-3 md:p-4 text-sm md:text-base rounded-lg border-2 transition-all duration-200 ${
//                               meetingData.time === slot.time
//                                 ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
//                                 : slot.available
//                                 ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
//                                 : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
//                             }`}
//                           >
//                             <div className="font-medium">{slot.time}</div>
//                             {!slot.available && (
//                               <div className="text-xs text-red-500 mt-1">
//                                 Booked ({slot.bookedCount}/{slot.maxSlots})
//                               </div>
//                             )}
//                             {slot.available && slot.bookedCount > 0 && (
//                               <div className="text-xs text-green-600 mt-1">
//                                 {slot.maxSlots - slot.bookedCount} slots left
//                               </div>
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                     ) : meetingData.date ? (
//                       <div className="text-center py-6 md:py-8 border border-gray-300 rounded-md md:rounded-lg">
//                         <span className="text-gray-400 text-xl md:text-2xl mx-auto mb-2 block">ℹ️</span>
//                         <div className="text-gray-500 text-sm md:text-base">No available slots for this date</div>
//                         <div className="text-xs text-gray-400 mt-1">Please try another date</div>
//                       </div>
//                     ) : (
//                       <div className="text-center py-6 md:py-8 border-2 border-dashed border-gray-300 rounded-md md:rounded-lg">
//                         <span className="text-gray-400 text-xl md:text-2xl mx-auto mb-2 block">📅</span>
//                         <div className="text-gray-400 text-sm md:text-base">Please select a date first</div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Additional Message */}
//                   <div>
//                     <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
//                       Additional Requirements (Optional)
//                     </label>
//                     <textarea
//                       name="message"
//                       value={meetingData.message}
//                       onChange={handleInputChange}
//                       rows="3"
//                       placeholder="Tell us about any specific requirements or questions you have..."
//                       className="w-full px-3 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-md md:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       maxLength={1000}
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       {meetingData.message.length}/1000 characters
//                     </p>
//                   </div>

//                   {/* 🔥 NEW: Meeting Info */}
//                   {meetingData.date && meetingData.time && (
//                     <div className="bg-green-50 p-3 md:p-4 rounded-lg md:rounded-xl border border-green-200">
//                       <h4 className="font-semibold text-green-900 mb-2 flex items-center text-sm md:text-base">
//                         <span className="mr-2">📹</span>
//                         Meeting Scheduled
//                       </h4>
//                       <div className="text-xs md:text-sm text-green-800 space-y-1">
//                         <div>📅 Date: {new Date(meetingData.date).toLocaleDateString('en-IN')}</div>
//                         <div>🕐 Time: {meetingData.time}</div>
//                         <div>📧 Google Meet link will be sent to your email</div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Action Buttons */}
//                   <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setShowMeetingForm(false);
//                         setMeetingData({ date: '', time: '', message: '' });
//                       }}
//                       disabled={isBooking}
//                       className="w-full sm:flex-1 text-sm md:text-base"
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       onClick={handleBookMeeting}
//                       disabled={isBooking || !meetingData.date || !meetingData.time}
//                       className="w-full sm:flex-1 text-sm md:text-base"
//                     >
//                       {isBooking ? (
//                         <>
//                           <span className="animate-spin mr-2">⏳</span>
//                           Booking...
//                         </>
//                       ) : (
//                         <>
//                           <span className="mr-2">✅</span>
//                           Confirm Book Meeting
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             )}

//             {/* Process Info */}
//             <Card className="p-3 md:p-4 bg-blue-50 border-blue-200">
//               <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">
//                 📋 What Happens Next?
//               </h4>
//               <ul className="text-xs md:text-sm text-blue-700 space-y-1">
//                 <li>• Developer will join the meeting at scheduled time</li>
//                 <li>• Discuss your requirements and customizations</li>
//                 <li>• Get timeline and partial payment details</li>
//                 <li>• Start development after payment confirmation</li>
//                 <li>• Track progress in your dashboard</li>
//               </ul>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BookTemplate;