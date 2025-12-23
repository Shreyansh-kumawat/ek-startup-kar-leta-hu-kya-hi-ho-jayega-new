import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import { 
  getBookingDetails, 
  addCommunication,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
} from '../services/templateBookingApi';
import { initializePayment } from '../services/razorpay';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';

// AI Video Tutorial 15 Component - BookingDetails Page

// AI Video Tutorial 15 Component - BookingDetails Page (WITH TICKET SYSTEM)
const AIVideoTutorial15 = memo(() => {
  // ✅ Check for video 15 ticket - Only play if ticket exists
  const hasVideo15Ticket = sessionStorage.getItem('video15Ticket') === 'active';
  
  const [isVisible, setIsVisible] = useState(hasVideo15Ticket);
  const [showText, setShowText] = useState(''); // '', 'thankyou', or '3digree'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const frameSkipCounter = useRef(0);

  useEffect(() => {
    if (hasVideo15Ticket) {
      sessionStorage.removeItem('video15Ticket'); // ✅ Use ticket once and remove it
      console.log('🎫 Video 15 ticket used on BookingDetails page!');
    }
  }, [hasVideo15Ticket]);

  const handleVideoEnd = () => {
    console.log('✅ Video 15 completed - Showing Thank You message');
    setShowText('thankyou');
    
    // After 1 second, show 3Digree
    setTimeout(() => {
      setShowText('3digree');
      
      // After 1 more second, hide everything
      setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    }, 1000);
  };

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsVisible(false);
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
      
      frameSkipCounter.current = 0;
      video.load();
      video.play().then(() => {
        processFrame();
      }).catch(err => {
        console.log('Video 15 play failed:', err);
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isVisible, processFrame]);

  // ✅ Don't render if no ticket
  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50" 
      style={{ width: "15vw", minWidth: "200px" }}
    >
      <div className="relative bg-transparent rounded-lg overflow-hidden">
        {!showText && (
          <>
            <video
              ref={videoRef}
              onEnded={handleVideoEnd}
              className="hidden"
              crossOrigin="anonymous"
            >
              <source src="/tutorials/15.mp4" type="video/mp4" />
            </video>

            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg"
            />
          </>
        )}

        {/* Text Overlays - Shows after video ends */}
        {showText === 'thankyou' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <div className="text-center animate-fade-in-scale">
              <p className="text-white font-bold text-2xl">Thank You</p>
            </div>
          </div>
        )}

        {showText === '3digree' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg">
            <div className="text-center animate-fade-in-scale">
              <p className="text-white font-bold text-3xl">3Digree</p>
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
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

AIVideoTutorial15.displayName = 'AIVideoTutorial15';



// 🔥 Enhanced PaymentButton Component - Mobile Optimized
const PaymentButton = ({ booking, onPaymentSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { showSuccess, showError } = useNotification();

  const loadPaymentHistory = async () => {
    try {
      const response = await getPaymentHistory(booking._id);
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  useEffect(() => {
    if (booking && (booking.status === 'partial_payment_pending' || booking.status === 'final_payment_pending')) {
      loadPaymentHistory();
    }
  }, [booking]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      const paymentType = booking.status === 'partial_payment_pending' ? 'partial' : 'final';
      
      showSuccess('Creating payment order...');
      const orderResponse = await createPaymentOrder(booking._id, paymentType);
      
      showSuccess('Opening payment gateway...');
      
      const paymentOptions = {
        orderId: orderResponse.data.razorpayOrder.id,
        amount: orderResponse.data.paymentDetails.amount,
        currency: orderResponse.data.razorpayOrder.currency,
        description: `${paymentType === 'partial' ? 'Partial' : 'Final'} payment for ${booking.templateName}`,
        prefill: {
          name: orderResponse.data.customerDetails.name,
          email: orderResponse.data.customerDetails.email,
          phone: orderResponse.data.customerDetails.phone,
        },
        notes: {
          bookingId: booking._id,
          paymentType: paymentType,
          templateName: booking.templateName
        }
      };
      
      const paymentResult = await initializePayment(paymentOptions);
      
      if (paymentResult.success) {
        showSuccess('Verifying payment...');
        
        const verificationResult = await verifyPayment(booking._id, {
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_signature: paymentResult.razorpay_signature
        });
        
        showSuccess(`🎉 Payment successful! ₹${orderResponse.data.paymentDetails.amount} paid.`);
        
        if (onPaymentSuccess) {
          await onPaymentSuccess();
        }
        await loadPaymentHistory();
        
      } else {
        throw new Error('Payment was not successful');
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      showError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentAmount = () => {
    if (booking.status === 'partial_payment_pending') {
      return Math.round((booking.templatePrice * booking.paymentDetails.paymentPercentage) / 100);
    } else if (booking.status === 'final_payment_pending') {
      return booking.templatePrice - (booking.paymentDetails.paidAmount || 0);
    }
    return 0;
  };

  const paymentAmount = getPaymentAmount();

  if (!paymentAmount || paymentAmount <= 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl sm:text-2xl">💸</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-green-900">Payment Required</h3>
              <p className="text-green-700 text-xs sm:text-sm">
                {booking.status === 'partial_payment_pending' 
                  ? `Pay ${booking.paymentDetails.paymentPercentage}% to start development`
                  : 'Complete final payment to get your live website'
                }
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-2xl sm:text-3xl font-bold text-green-900 mb-1">
              {formatCurrency(paymentAmount)}
            </div>
            <div className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs sm:text-sm font-medium inline-block">
              {booking.status === 'partial_payment_pending' 
                ? `${booking.paymentDetails.paymentPercentage}% Payment`
                : 'Final Payment'
              }
            </div>
          </div>
        </div>
        
        <Button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
          size="lg"
        >
          {processing ? (
            <>
              <span className="animate-spin mr-2 sm:mr-3">⏳</span>
              Processing Payment...
            </>
          ) : (
            <>
              <span className="mr-2 sm:mr-3">💳</span>
              Pay {formatCurrency(paymentAmount)} Securely
            </>
          )}
        </Button>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-3 sm:mt-4 text-xs sm:text-sm text-green-700">
          <div className="flex items-center gap-2">
            <span className="text-green-500">🔒</span>
            <span>256-bit SSL Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">R</div>
            <span>Powered by Razorpay</span>
          </div>
        </div>

        {paymentHistory.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full border-green-300 text-green-700 hover:bg-green-100 text-sm"
            >
              <span className="mr-2">📜</span>
              {showHistory ? 'Hide' : 'Show'} Payment History ({paymentHistory.length})
            </Button>
            
            {showHistory && (
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200">
                <h4 className="font-bold text-green-900 text-sm sm:text-base">Previous Payments</h4>
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-3 bg-green-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-green-900 capitalize text-sm sm:text-base">{payment.paymentType} Payment</div>
                      <div className="text-xs sm:text-sm text-green-700">{formatDateTime(payment.createdAt)}</div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-green-600 text-base sm:text-lg">{formatCurrency(payment.amount)}</div>
                      <div className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${
                        payment.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {payment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();  
  const communicationRef = useRef(null);  
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // ✅ Check if video 15 should show (based on ticket)
  const [showTutorial] = useState(() => {
    const hasVideo15 = sessionStorage.getItem('video15Ticket') === 'active';
    console.log('🎫 BookingDetails - Checking video15Ticket:', hasVideo15);
    return hasVideo15;
  });

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await getBookingDetails(bookingId);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error loading booking details:', error);
      showError('Failed to load booking details');
      navigate('/dashboard/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.scrollTo === 'communication' && communicationRef.current) {
      setTimeout(() => {
        communicationRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId, isAuthenticated, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      showError('Please enter a message');
      return;
    }

    try {
      setSendingMessage(true);
      
      await addCommunication(bookingId, {
        message: newMessage.trim(),
        type: 'other'
      });

      setNewMessage('');
      showSuccess('Message sent successfully');
      await loadBookingDetails();
      
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard!');
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      meeting_scheduled: {
        color: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: '📅',
        text: 'Meeting Scheduled',
        description: 'Your meeting with 3Digree is scheduled',
        emoji: '📅'
      },
      meeting_completed: {
        color: 'bg-green-500',
        textColor: 'text-green-800',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '✅',
        text: 'Meeting Completed',
        description: 'Meeting completed, waiting for payment setup',
        emoji: '✅'
      },
      partial_payment_pending: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgLight: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '💳',
        text: 'Payment Pending',
        description: 'Partial payment required to start development',
        emoji: '💳'
      },
      partial_payment_done: {
        color: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: '🔧',
        text: 'Development Started',
        description: 'Development has begun on your website',
        emoji: '🔧'
      },
      development_in_progress: {
        color: 'bg-indigo-500',
        textColor: 'text-indigo-800',
        bgLight: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        icon: '⚡',
        text: 'In Development',
        description: 'Your website is being developed',
        emoji: '⚡'
      },
      website_ready: {
        color: 'bg-orange-500',
        textColor: 'text-orange-800',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: '🎯',
        text: 'Website Ready',
        description: 'Website is ready for review and final payment',
        emoji: '🎯'
      },
      final_payment_pending: {
        color: 'bg-red-500',
        textColor: 'text-red-800',
        bgLight: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '💰',
        text: 'Final Payment Due',
        description: 'Complete final payment to get live website',
        emoji: '💰'
      },
      completed: {
        color: 'bg-green-500',
        textColor: 'text-green-800',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '🚀',
        text: 'Completed',
        description: 'Project completed successfully',
        emoji: '🚀'
      }
    };

    return statusConfig[status] || {
      color: 'bg-gray-500',
      textColor: 'text-gray-800',
      bgLight: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '📋',
      text: status,
      description: 'Status information',
      emoji: '📋'
    };
  };

  const getProgress = () => {
    if (booking?.developmentProgress?.progress) {
      return booking.developmentProgress.progress;
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
    
    return statusProgress[booking?.status] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-base sm:text-lg">Loading booking details...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Card className="p-8 sm:p-12 text-center max-w-lg shadow-2xl bg-white rounded-2xl sm:rounded-3xl w-full">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">😔</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">The booking you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/dashboard/bookings')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold w-full sm:w-auto"
            style={{ borderRadius: '20px' }}
          >
            Back to Bookings
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* AI Video Tutorial 15 - Only shows if ticket exists */}
      {showTutorial && <AIVideoTutorial15 />}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Enhanced Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/bookings')}
                className="mb-4 sm:mb-6 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm"
                style={{ borderRadius: '20px' }}
              >
                <span className="mr-2">⬅️</span>
                Back to Bookings
              </Button>
              
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    {booking.templateName}
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base lg:text-xl mb-3 sm:mb-4">
                    Booking ID: #{booking.bookingId || booking._id.slice(-8)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-md bg-white/10 border border-white/20`}>
                      <span className="text-white text-sm sm:text-base">{statusInfo.icon}</span>
                      <span className="text-white font-semibold text-xs sm:text-sm">{statusInfo.text}</span>
                    </div>
                    <div className="text-xl sm:text-2xl">{statusInfo.emoji}</div>
                  </div>
                </div>
                
                <div className="w-full lg:w-auto text-left lg:text-right bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="text-white font-bold text-xl sm:text-2xl">{getProgress()}%</div>
                  <div className="text-white/80 text-xs sm:text-sm">Complete</div>
                </div>
              </div>
              
              <p className="text-white/80 text-sm sm:text-base lg:text-lg mt-3 sm:mt-4">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Payment Action Section */}
            {(booking.status === 'partial_payment_pending' || booking.status === 'final_payment_pending') && (
              <PaymentButton 
                booking={booking}
                onPaymentSuccess={loadBookingDetails}
              />
            )}
            
            {/* Template Info - Mobile Optimized */}
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-gray-50">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Template Information</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-full sm:w-40 h-32 bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                    {booking.templateId?.previewImage ? (
                      <img loading="lazy" 
                        src={booking.templateId.previewImage.startsWith('http') 
                          ? booking.templateId.previewImage 
                          : `http://localhost:5000${booking.templateId.previewImage}`}
                        alt={booking.templateName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-3xl sm:text-4xl">🖼️</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-xl sm:text-2xl text-gray-900 mb-3 sm:mb-4">{booking.templateName}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-green-600 font-medium">Price</div>
                        <div className="text-base sm:text-xl font-bold text-green-800">₹ {formatCurrency(booking.templatePrice)}</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-blue-600 font-medium">Category</div>
                        <div className="font-bold text-blue-800 text-sm sm:text-base">{booking.templateId?.category || 'Design'}</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 col-span-2">
                        <div className="text-xs sm:text-sm text-purple-600 font-medium">Booked On</div>
                        <div className="font-bold text-purple-800 text-sm sm:text-base">{formatDate(booking.createdAt)}</div>
                      </div>
                    </div>
                    <div className='text-sm sm:text-base lg:text-lg font-semibold text-blue-500 bg-blue-700/15 w-fit px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl my-3 sm:my-4'>
                      {booking.templatePrice >= 1400 ? 'Free Domain + Web Hosting' : 'Free Web Hosting'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Progress Tracker - Mobile Optimized */}
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Development Progress</h2>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between text-base sm:text-lg font-medium text-gray-700 mb-2 sm:mb-3">
                    <span>Overall Progress</span>
                    <span className="text-blue-600">{getProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </div>

                {booking.developmentProgress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">Current Stage</div>
                      <div className="font-bold text-gray-900 capitalize text-sm sm:text-base lg:text-lg">{booking.developmentProgress.stage?.replace('_', ' ')}</div>
                    </div>
                    {booking.developmentProgress.lastUpdated && (
                      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-gray-600 font-medium">Last Updated</div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(booking.developmentProgress.lastUpdated)}</div>
                      </div>
                    )}
                  </div>
                )}
                
                {booking.developmentProgress?.developerNotes && (
                  <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Developer Notes</h4>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">{booking.developmentProgress.developerNotes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Meeting Information - Mobile Optimized */}
            {booking.meetingDetails && (
              <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-50">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Meeting Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm sm:text-base">📅</span>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Date</div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(booking.meetingDetails.scheduledDate)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm sm:text-base">⏰</span>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Time</div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">{booking.meetingDetails.scheduledTime}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm sm:text-base">✅</span>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600">Status</div>
                          <div className="font-bold text-gray-900 capitalize text-sm sm:text-base">{booking.meetingDetails.meetingStatus?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </div>
                    
                    {booking.meetingDetails.meetingLink && (
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm sm:text-base">🎥</span>
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-gray-600">Meeting Link</div>
                              <div className="font-bold text-gray-900 text-sm sm:text-base">Ready to Join</div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                              onClick={() => window.open(booking.meetingDetails.meetingLink, '_blank')}
                              style={{ borderRadius: '12px' }}
                            >
                              <span>🔗</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(booking.meetingDetails.meetingLink)}
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                              style={{ borderRadius: '12px' }}
                            >
                              <span>📋</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.meetingDetails.additionalRequirements && (
                    <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Additional Requirements</h4>
                      <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">{booking.meetingDetails.additionalRequirements}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Smart Website URLs Section - Mobile Optimized */}
            {booking.websiteUrls && (Object.keys(booking.websiteUrls).some(key => booking.websiteUrls[key])) && (() => {
              const showPreview = booking.websiteUrls.previewUrl && 
                ['partial_payment_done', 'development_in_progress', 'website_ready', 'final_payment_pending'].includes(booking.status);
              
              const showLive = booking.websiteUrls.finalUrl && 
                ['completed'].includes(booking.status);
              
              const showSourceCode = booking.websiteUrls.downloadUrl && 
                ['completed'].includes(booking.status);

              if (!showPreview && !showLive && !showSourceCode) return null;

              return (
                <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 to-red-50">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Website Links</h2>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {showPreview && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-base sm:text-xl">👀</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-green-900 text-base sm:text-lg">🔥 Preview Website</h3>
                                <p className="text-green-700 text-xs sm:text-sm">Test your website - Final payment pending</p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                              <Button
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold flex-1 sm:flex-none text-xs sm:text-sm"
                                onClick={() => window.open(booking.websiteUrls.previewUrl, '_blank')}
                                style={{ borderRadius: '15px' }}
                              >
                                <span className="mr-2">🔗</span>
                                View Preview
                              </Button>
                              <Button
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-100 text-xs sm:text-sm"
                                onClick={() => copyToClipboard(booking.websiteUrls.previewUrl)}
                                style={{ borderRadius: '15px' }}
                              >
                                <span>📋</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {showLive && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-base sm:text-xl">🚀</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-blue-900 text-base sm:text-lg">🚀 Live Website</h3>
                                <p className="text-blue-700 text-xs sm:text-sm">Your website is now live!</p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                              <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold flex-1 sm:flex-none text-xs sm:text-sm"
                                onClick={() => window.open(booking.websiteUrls.finalUrl, '_blank')}
                                style={{ borderRadius: '15px' }}
                              >
                                <span className="mr-2">🔗</span>
                                Open Live Site
                              </Button>
                              <Button
                                variant="outline"
                                className="border-blue-300 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm"
                                onClick={() => copyToClipboard(booking.websiteUrls.finalUrl)}
                                style={{ borderRadius: '15px' }}
                              >
                                <span>📋</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {showSourceCode && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-base sm:text-xl">📦</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-purple-900 text-base sm:text-lg">📦 Source Code</h3>
                                <p className="text-purple-700 text-xs sm:text-sm">Download your website files</p>
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                              <Button
                                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold flex-1 sm:flex-none text-xs sm:text-sm"
                                onClick={() => window.open(booking.websiteUrls.downloadUrl, '_blank')}
                                style={{ borderRadius: '15px' }}
                              >
                                <span className="mr-2">📥</span>
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                className="border-purple-300 text-purple-700 hover:bg-purple-100 text-xs sm:text-sm"
                                onClick={() => copyToClipboard(booking.websiteUrls.downloadUrl)}
                                style={{ borderRadius: '15px' }}
                              >
                                <span>📋</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.status === 'final_payment_pending' && showPreview && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                          <div className="flex items-center justify-center gap-2 text-yellow-800 text-xs sm:text-sm">
                            <span>⚠️</span>
                            <p>Complete final payment to get your live website URL and source code</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Contact Information */}
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Information</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Customer Name</div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{booking.userId?.name || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base break-all">{booking.userId?.email || 'N/A'}</div>
                  </div>
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Phone</div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{booking.contactInfo?.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Communication Section */}
            <Card ref={communicationRef} className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Communication</h3>
                
                <div className="max-h-96 overflow-y-auto space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {booking.communications && booking.communications.length > 0 ? (
                    booking.communications.map((comm, index) => (
                      <div 
                        key={index} 
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${
                          comm.sender === 'customer' 
                            ? 'bg-blue-100 ml-4 sm:ml-8' 
                            : 'bg-white mr-4 sm:mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-xs sm:text-sm capitalize">{comm.sender}</span>
                          <span className="text-xs text-gray-500">{formatDateTime(comm.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{comm.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-xs sm:text-sm">No messages yet</p>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3 sm:space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-blue-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 resize-none text-xs sm:text-sm"
                    rows="3"
                  />
                  <Button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm"
                    style={{ borderRadius: '15px' }}
                  >
                    {sendingMessage ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💬</span>
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

