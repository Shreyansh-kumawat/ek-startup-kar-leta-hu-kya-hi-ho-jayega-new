import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import '../features/template/TemplateCard.css';
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
import shareSvg from '../components/svg/share.svg';
import Button3 from '../components/Button3';
import rocket from '../components/svg/rocket.svg';

// Constants
const DEFAULT_INCLUDED_ITEMS = [
  '1 Free Domain Name',
  '1 Free Hosting',
  '5 Pages (Dynamic Website)',
  'Unlimited Images & Videos',
  'Unlimited (Bandwidth/ Space)',
  '100% Responsive Website',
  'SEO Friendly Website',
  'WhatsApp Integration',
  'Call Button Integration',
  'SSL Certificate',
  'Social Media Integration'
];

const TEMPLATE_FEATURES = [
  { icon: '📱', title: 'Fully Responsive', desc: 'Perfect on all devices' },
  { icon: '🔒', title: 'SEO Optimized', desc: 'Search engine ready' },
  { icon: '📈', title: 'High Performance', desc: 'Fast loading speed' },
  { icon: '⏰', title: 'Quick Setup', desc: 'Online in 2-3 days*' }
];

// Memoized Loading Component
const LoadingState = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
    <div className="text-center">
      <Loader size="lg" />
      <p className="mt-4 text-blue-700 text-base font-medium">Loading Design...</p>
      <div className="mt-3 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Memoized Error Component
const ErrorState = memo(({ onBrowse, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
    <Card className="p-6 sm:p-8 md:p-12 text-center max-w-lg w-full shadow-xl md:shadow-2xl bg-white rounded-2xl md:rounded-3xl border-2 md:border-4 border-blue-300">
      <div className="text-4xl sm:text-5xl md:text-6xl mb-4 md:mb-6">📄</div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3 md:mb-4">
        Website Design Not Found
      </h2>
      <p className="text-gray-700 text-sm sm:text-base mb-6 md:mb-8 leading-relaxed">
        The template you're looking for doesn't exist or has been removed. Don't worry, we have many other amazing templates!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={onBrowse}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl text-sm sm:text-base border-2 border-blue-400"
        >
          Browse Templates
        </Button>
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex-1 border-2 border-blue-300 hover:border-blue-500 text-blue-700 hover:bg-blue-50 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl text-sm sm:text-base"
        >
          Try Again
        </Button>
      </div>
    </Card>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Memoized Feature Card
const FeatureCard = memo(({ feature }) => (
  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 border border-transparent hover:border-blue-300">
    <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg md:rounded-2xl border border-blue-300 flex-shrink-0">
      <span className="text-lg sm:text-xl md:text-2xl">{feature.icon}</span>
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">{feature.title}</h4>
      <p className="text-gray-600 text-xs sm:text-sm">{feature.desc}</p>
    </div>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

// AI Video Tutorial Component for Template Details Page (Videos 8, 9, 11, 12, 13)
const AIVideoTutorial = memo(({ onBookButtonClick }) => {
  // Check for video 11 ticket (after login redirect)
  const hasVideo11Ticket = sessionStorage.getItem('video11Ticket') === 'active';
  const hasTemplateDetailsTicket = sessionStorage.getItem('templateDetailsTicket') === 'active';
  
  // Determine starting video based on tickets
  const getInitialVideo = () => {
    if (hasVideo11Ticket) {
      sessionStorage.removeItem('video11Ticket'); // Use ticket
      console.log('🎫 Video 11 ticket used!');
      return 11;
    } else if (hasTemplateDetailsTicket) {
      sessionStorage.removeItem('templateDetailsTicket'); // Use ticket
      console.log('🎫 TemplateDetails ticket used!');
      return 8;
    }
    return null;
  };

  const initialVideo = getInitialVideo();
  const [currentVideo, setCurrentVideo] = useState(initialVideo);
  const [showFinalText, setShowFinalText] = useState(false);
  const [finalTextMessage, setFinalTextMessage] = useState('');
  const [isVisible, setIsVisible] = useState(initialVideo !== null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const frameSkipCounter = useRef(0);
  const hasScrolledToIncluded = useRef(false);
  const hasScrolledToMain = useRef(false);
  const hasTriggeredBlink = useRef(false);

  // Improved scroll functions with Lenis compatibility
  const scrollToIncluded = useCallback(() => {
    const includedHeading = Array.from(document.querySelectorAll('h3')).find(
      h3 => h3.textContent.includes("What's Included")
    );
    
    if (includedHeading) {
      const includedSection = includedHeading.closest('.p-4, .p-6, .p-8');
      if (includedSection) {
        const lenis = window.lenis;
        if (lenis) {
          lenis.scrollTo(includedSection, {
            offset: -100,
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        } else {
          includedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, []);

  const scrollToMain = useCallback(() => {
    const bookingSection = document.querySelector('[class*="bookingSectionRef"]') || 
                          Array.from(document.querySelectorAll('.p-3, .p-4, .p-6')).find(
                            el => el.textContent.includes('Complete Package Includes')
                          );
    
    if (bookingSection) {
      const lenis = window.lenis;
      if (lenis) {
        lenis.scrollTo(bookingSection, {
          offset: -150,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  const handleVideoEnd = () => {
    if (currentVideo === 8) {
      setCurrentVideo(9);
      setShowFinalText(false);
    } else if (currentVideo === 9) {
      setFinalTextMessage('Book For Free');
      setShowFinalText(true);
    } else if (currentVideo === 11) {
      // NEW: Video 11 ends → Show "Click on Book For Free"
      setFinalTextMessage('Book For Free');
      setShowFinalText(true);
      console.log('⏸️ Video 11 ended - Waiting for Book For Free click');
    } else if (currentVideo === 12) {
      setFinalTextMessage('Select Date And Time');
      setShowFinalText(true);
    } else if (currentVideo === 13) {
      setFinalTextMessage('Book Free Meeting');
      setShowFinalText(true);
    }
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

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = new Uint32Array(imageData.data.buffer);

    const topLimit = Math.floor(canvas.height * 1);
    const leftLimit = Math.floor(canvas.width * 0.4);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const inGreenArea = y < topLimit || x < leftLimit;
        
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

  // Listen for video 12 trigger from book button
  useEffect(() => {
    const handlePlayVideo12 = () => {
      setShowFinalText(false);
      setCurrentVideo(12);
      setIsVisible(true);
    };

    window.addEventListener('playVideo12', handlePlayVideo12);

    return () => {
      window.removeEventListener('playVideo12', handlePlayVideo12);
    };
  }, []);

  // Listen for video 13 trigger from time slot selection
  useEffect(() => {
    const handlePlayVideo13 = () => {
      setShowFinalText(false);
      setCurrentVideo(13);
      setIsVisible(true);
    };

    window.addEventListener('playVideo13', handlePlayVideo13);

    return () => {
      window.removeEventListener('playVideo13', handlePlayVideo13);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && isVisible && currentVideo !== null) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        if (currentVideo === 8) {
          if (video.currentTime >= 7 && video.currentTime < 7.5 && !hasScrolledToIncluded.current) {
            scrollToIncluded();
            hasScrolledToIncluded.current = true;
          }
          
          if (video.currentTime >= 13 && video.currentTime < 13.5 && !hasScrolledToMain.current) {
            scrollToMain();
            hasScrolledToMain.current = true;
          }
        }
        
        if (currentVideo === 9) {
          if (video.currentTime >= 13 && video.currentTime < 13.5 && !hasTriggeredBlink.current) {
            const blinkEvent = new CustomEvent('blinkBookButton');
            window.dispatchEvent(blinkEvent);
            hasTriggeredBlink.current = true;
          }
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      
      frameSkipCounter.current = 0;
      hasScrolledToIncluded.current = false;
      hasScrolledToMain.current = false;
      hasTriggeredBlink.current = false;
      
      video.load();
      video.play().then(() => {
        processFrame();
      }).catch(err => {
        console.log('Video play failed:', err);
      });

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [currentVideo, processFrame, scrollToIncluded, scrollToMain, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ width: "15vw", minWidth: "200px" }}>
      <div className="relative bg-transparent rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          onEnded={handleVideoEnd}
          className="hidden"
          crossOrigin="anonymous"
        >
          <source src={`/tutorials/${currentVideo}.mp4`} type="video/mp4" />
        </video>

        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg"
        />

        {showFinalText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-opacity-70 animate-fadeIn">
            <p className="text-white bg-black p-1 h-fit w-fit rounded-lg text-center font-bold text-base leading-relaxed">
              {currentVideo === 12 ? '' : 'Click on'}
              {currentVideo === 12 ? '' : <br />}
              {finalTextMessage}
            </p>
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
    </div>
  );
});

AIVideoTutorial.displayName = 'AIVideoTutorial';

// Main Component
const TemplateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Check if tutorial should show using TICKET SYSTEM
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasVideo11 = sessionStorage.getItem('video11Ticket') === 'active';
    const hasTemplateDetails = sessionStorage.getItem('templateDetailsTicket') === 'active';
    console.log('🎫 Checking tickets:', { hasVideo11, hasTemplateDetails });
    return hasVideo11 || hasTemplateDetails;
  });
  
  const [isBlinking, setIsBlinking] = useState(false);

  // Listen for blink event
  useEffect(() => {
    const handleBlinkButton = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 3000);
    };

    window.addEventListener('blinkBookButton', handleBlinkButton);

    return () => {
      window.removeEventListener('blinkBookButton', handleBlinkButton);
    };
  }, []);

  // States
  const [isBooking, setIsBooking] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    message: ''
  });

  const descriptionRef = useRef(null);
  const bookingSectionRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await getTemplateById(id);

        const templateData = response?.data || response?.template || (response?.success && response?.data) || response;

        if (templateData) {
          setTemplate(templateData);
          setError(null);
        } else {
          throw new Error('Website Design data not found in response');
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching template:', err);
        }
        setError(err.message || 'Failed to load template');
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id]);

  // Load available slots
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

        if (meetingData.time) {
          const selectedSlot = response.data.slots?.find(slot => slot.time === meetingData.time);
          if (!selectedSlot || !selectedSlot.available) {
            setMeetingData(prev => ({ ...prev, time: '' }));
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error loading slots:', error);
        }
        showError('Failed to load available time slots');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [meetingData.date, showError]);

  // Memoized values
  const imageSrc = useMemo(() => {
    if (!template?.previewImage) return null;
    if (template.previewImage.startsWith('http')) return template.previewImage;
    return `http://localhost:5000${template.previewImage}`;
  }, [template?.previewImage]);

  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }, []);

  const priceDisplay = useMemo(() => {
    if (!template) return '₹0';
    return template.price === 0 ? 'Free' : `₹ ${formatCurrency(template.price)}`;
  }, [template]);

  const hostingBadge = useMemo(() =>
    template?.price >= 1400 ? 'Free Domain + Hosting' : 'Free Web Hosting',
    [template?.price]
  );

  // Memoized handlers
  const handleScrollToBooking = useCallback(() => {
    bookingSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, []);

  const handleBookTemplate = useCallback(() => {
  if (!isAuthenticated) {
    // ✅ CHECK IF USER WANTS TUTORIAL (Check localStorage preference)
    const userWantsTutorial = localStorage.getItem('showAITutorial') !== 'false';
    
    if (userWantsTutorial) {
      // ✅ CREATE VIDEO 10 TICKET ONLY IF USER WANTS TUTORIAL
      sessionStorage.setItem('video10Ticket', 'active');
      console.log('🎫 Video 10 ticket created!');
    } else {
      console.log('🚫 Video 10 ticket NOT created - User declined tutorial');
    }
    
    localStorage.setItem('returningFromTemplateDetails', 'true');

    navigate('/login', {
      state: {
        from: { pathname: `/templates/${id}` },
        returnToTemplate: true
      }
    });
    return;
  }

  if (!template || template.price === undefined || template.price === null) {
    showError('Website information not available');
    return;
  }

  if (template.price === 0) {
    showSuccess('Free template access granted!');
    navigate('/dashboard');
    return;
  }

  // Trigger video 12 when book button is clicked
  if (showTutorial) {
    const event = new CustomEvent('playVideo12');
    window.dispatchEvent(event);
  }

  setShowMeetingForm(true);
}, [isAuthenticated, template, id, navigate, showError, showSuccess, showTutorial]);



  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setMeetingData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleTimeSlotSelect = useCallback((time) => {
    setMeetingData(prev => ({
      ...prev,
      time: prev.time === time ? '' : time
    }));

    // Trigger video 13 when time slot is selected
    if (showTutorial && time) {
      const event = new CustomEvent('playVideo13');
      window.dispatchEvent(event);
    }
  }, [showTutorial]);

 const handleBookMeeting = useCallback(async () => {
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

    await bookTemplate(id, bookingData);

    showSuccess(
      `Meeting booked successfully for ${meetingData.date} at ${meetingData.time}! Go to Dashboard > My Bookings for the Google Meet link.`
    );

    // CREATE VIDEO 14 TICKET before navigation
    sessionStorage.setItem('video14Ticket', 'active');
    console.log('🎫 Video 14 ticket created after booking!');

    navigate('/dashboard/bookings');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Booking error:', error);
    }
    showError(error.message || 'Failed to book meeting. Please try again.');
  } finally {
    setIsBooking(false);
  }
}, [meetingData, id, showError, showSuccess, navigate]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        showSuccess('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  }, [template?.name, template?.description, showSuccess]);

  const handleScrollDescription = useCallback(() => {
    descriptionRef.current?.scrollBy({
      top: 50,
      behavior: 'smooth'
    });
  }, []);

  const handleImageError = useCallback((e) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('❌ Image failed to load:', template?.previewImage);
    }
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  }, [template?.previewImage]);

  // Early returns
  if (loading) return <LoadingState />;

  if (error || !template) {
    return (
      <ErrorState
        onBrowse={() => navigate('/templates')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* AI Video Tutorial */}
      {showTutorial && <AIVideoTutorial onBookButtonClick={handleBookTemplate} />}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
        <div className="relative mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 md:mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-blue-100">
              <li>
                <button
                  onClick={() => navigate('/templates')}
                  className="hover:text-white transition-colors font-semibold"
                  aria-label="Go back to templates"
                >
                  Websites
                </button>
              </li>
              <li className="text-white hidden sm:inline">/</li>
              <li className="text-white font-bold truncate max-w-[120px] sm:max-w-none">{template.name}</li>
            </ol>
          </nav>

          {/* Template Header */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <div className="flex items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight drop-shadow-md lg:drop-shadow-lg flex-1">
                  {template.name}
                </h1>
                <button
                  onClick={handleShare}
                  className="p-1 sm:p-1 rounded-full bg-white text-blue-700 hover:bg-blue-50 backdrop-blur-md transition-all duration-300 shadow-md sm:shadow-lg flex-shrink-0"
                  aria-label="Share template"
                >
                  <img loading="lazy" src={shareSvg} alt="" className='h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 bg-blue-500 rounded-full' />
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md lg:drop-shadow-lg">
                  {priceDisplay}
                </div>

                <div className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md border ${template.isActive !== false
                  ? 'bg-green-400/30 text-green-100 border-green-300'
                  : 'bg-red-400/30 text-red-100 border-red-300'
                  }`}>
                  {template.isActive !== false ? '✅ Available' : '❌ Unavailable'}
                </div>
              </div>

              {/* Backend Badge */}
              {template.backend && (
                <div className="z-20 mb-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ padding: '2px' }}>
                      <div className="backend-glow-animation" />
                    </div>
                    <div className="relative px-4 py-2 bg-black rounded-2xl text-white text-[10px] md:text-xs font-bold" style={{ margin: '2px', zIndex: 1 }}>
                      <span className="whitespace-nowrap">with Backend</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Description */}
              <div className="relative mb-4 sm:mb-6 md:mb-8" data-lenis-prevent>
                <div
                  ref={descriptionRef}
                  className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed overflow-y-auto pr-8 sm:pr-10 md:pr-12 drop-shadow-md"
                  style={{
                    scrollbarWidth: 'none',
                    maxHeight: 'calc(1.5em * 4.5)',
                    lineHeight: '1.5em'
                  }}
                >
                  {template.description || 'Professional website template ready for customization with expert guidance.'}
                </div>

                <button
                  onClick={handleScrollDescription}
                  className="absolute right-0 bottom-0 -translate-y-1/2 p-1.5 sm:p-2 bg-white rounded-full shadow-md sm:shadow-lg transition-all duration-300 border border-blue-200 group"
                  title="Scroll down"
                  aria-label="Scroll description down"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 transform group-hover:translate-y-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="xl"
                  onClick={handleScrollToBooking}
                  disabled={template.isActive === false}
                  className="flex-1 bg-gradient-to-r font-bold py-3 sm:py-3.5 md:py-4 px-4 from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105 transition-transform duration-100 cursor-pointer sm:px-6 md:px-8 text-sm sm:text-base md:text-lg shadow-xl md:shadow-2xl"
                  style={{ borderRadius: '50px' }}
                >
                  {template.price === 0 ? 'Get Free Website' : 'Book This Website'}
                </Button>

                <Button
                  variant="outline"
                  size="xl"
                  onClick={() => window.open(template.liveDemo || template.templateLink, '_blank', 'noopener,noreferrer')}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-bold py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg backdrop-blur-md cursor-pointer"
                  style={{ borderRadius: '50px' }}
                >
                  <span className="mr-1 sm:mr-2">🔗</span>
                  Live Preview
                </Button>
              </div>
            </div>

            {/* Template Preview */}
            <div className="relative mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl md:shadow-2xl border-2 md:border-4 border-blue-300/50">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl border border-blue-300">
                  {imageSrc ? (
                    <img loading="lazy"
                      src={imageSrc}
                      alt={template.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                      onError={handleImageError}
                    />
                  ) : null}
                  <div
                    className="flex items-center justify-center text-blue-400 h-full"
                    style={{ display: imageSrc ? 'none' : 'flex' }}
                  >
                    <div className="text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl mb-2 md:mb-4">📄</div>
                      <div className="text-sm sm:text-base md:text-lg font-medium">Preview Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {/* Booking Card */}
            <Card
              ref={bookingSectionRef}
              className="p-3 min-[400px]:p-4 sm:p-6 bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border-2 md:border-4 border-blue-300"
            >
              {!showMeetingForm ? (
                <>
                  <div className="text-center mb-4 min-[400px]:mb-5 sm:mb-6">
                    <div className="text-3xl min-[400px]:text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 min-[400px]:mb-3">
                      {priceDisplay}
                    </div>

                    <div className='w-full flex justify-center items-center flex-col gap-3 sm:gap-4'>
                      <h3 className='text-sm min-[400px]:text-base sm:text-lg md:text-xl font-semibold text-slate-800 text-center'>
                        Complete Package Includes
                      </h3>

                      <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full max-w-2xl'>
                        <div className='group relative bg-gradient-to-br from-blue-50 to-indigo-100 px-4 min-[400px]:px-5 sm:px-6 py-3 min-[400px]:py-4 rounded-xl border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-1 w-auto sm:w-auto'>
                          <div className='flex items-center gap-2 justify-center'>
                            <svg className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600' fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                            <span className='text-xs min-[400px]:text-sm sm:text-base font-bold text-blue-900'>
                              Website Development
                            </span>
                          </div>
                          <div className='absolute -top-1 -right-1 bg-green-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                            ✓
                          </div>
                        </div>

                        <div className='text-2xl sm:text-3xl font-bold text-blue-600 hidden sm:block'>
                          +
                        </div>

                        <div className='group relative bg-gradient-to-br from-green-50 to-emerald-100 px-4 min-[400px]:px-5 sm:px-6 py-3 min-[400px]:py-4 rounded-xl border-2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-1 w-auto sm:w-auto'>
                          <div className='flex items-center gap-2 justify-center'>
                            <svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-600' fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                            </svg>
                            <span className='text-xs min-[400px]:text-sm sm:text-base font-bold text-green-900 whitespace-nowrap'>
                              {hostingBadge}
                            </span>
                          </div>
                          <div className='absolute -top-1 -right-1 bg-green-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                            ✓
                          </div>
                        </div>
                      </div>

                      <p className='text-[10px] min-[400px]:text-xs sm:text-sm text-slate-600 text-center font-medium'>
                        Everything you need to go live 🚀
                      </p>
                    </div>

                    <div className='min-[640px]:hidden flex mt-6' style={{
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#374151', fontWeight: '600' }}>
                        Book Quick
                      </span>
                      <span style={{
                        color: '#047857',
                        backgroundColor: '#d1fae5',
                        fontWeight: '800',
                        fontSize: '1.15em',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        border: '2px solid #10b981'
                      }}>
                        FREE
                      </span>
                      <span style={{ color: '#374151', fontWeight: '600' }}>
                        Meeting with 3Digree
                      </span>
                    </div>

                    <br />

                    <p className="text-gray-700 font-medium text-[10px] min-[400px]:text-xs sm:text-sm leading-relaxed px-1 min-[400px]:px-2 max-[486px]:leading-[1.2]">
                      <span className="text-blue-700 p-0.5 min-[400px]:p-1 rounded-lg">
                        To book this Website
                      </span>
                      , schedule a
                      <span className='max-[486px]:block hidden'>&nbsp;</span>
                      <span className="bg-green-200 p-0.5 min-[400px]:p-1 max-[485px]:text-[14px] rounded-lg sm:rounded-xl mx-1">
                        Free 10-minute meeting
                      </span>
                      <span className='max-[486px]:block hidden'>&nbsp;</span>
                      with us to discuss your doubts with 3Digree. It's that
                      <span className="text-black font-bold"> simple.</span>
                    </p>
                  </div>

                  <div className="space-y-2 min-[400px]:space-y-2.5 sm:space-y-3 mb-4 min-[400px]:mb-5 sm:mb-6">
                    <div className='flex flex-col justify-center items-center'>
                      {/* Button3 with BLINK effect */}
                      <div className="relative p-4">
                        <Button3
                          onClick={handleBookTemplate}
                          disabled={isBooking || (template.isActive === false)}
                          className={`w-full text-white font-bold py-3 min-[400px]:py-3.5 sm:py-4 text-[11px] min-[400px]:text-xs sm:text-sm md:text-base cursor-pointer p-2 rounded-lg transition-all duration-500 ${isBlinking ? 'animate-button-bg-blink' : ''
                            }`}
                        >
                        </Button3>

                        {/* Arrows */}
                        <div className='absolute bottom-[-5px] left-0'>
                          <img src="/arrow.gif" alt="" className='w-7 rotate-320' />
                        </div>
                        <div className='absolute bottom-[30%] right-[-10px]'>
                          <img src="/arrow.gif" alt="" className='w-7 rotate-180' />
                        </div>
                        <div className='absolute top-0 left-[25%]'>
                          <img src="/arrow.gif" alt="" className='w-5 rotate-90' />
                        </div>
                      </div>

                      <br />
                      <div className='max-[640px]:hidden flex' style={{
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#374151', fontWeight: '600' }}>
                          Book Quick
                        </span>
                        <span style={{
                          color: '#047857',
                          backgroundColor: '#d1fae5',
                          fontWeight: '800',
                          fontSize: '1.15em',
                          padding: '2px 10px',
                          borderRadius: '6px',
                          border: '2px solid #10b981'
                        }}>
                          FREE
                        </span>
                        <span style={{ color: '#374151', fontWeight: '600' }}>
                          Meeting with 3Digree
                        </span>
                      </div>
                    </div>

                    <br />

                    <div className='w-full flex justify-center'>
                      <Button
                        variant="outline"
                        className="border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 py-2.5 min-[400px]:py-3 text-[11px] min-[400px]:text-xs sm:text-sm font-bold rounded-full max-[600px]:w-fit w-fit"
                        onClick={() => navigate('/templates')}
                      >
                        <span className="mr-1 min-[400px]:mr-2">📋</span>
                        Browse More Websites
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="text-blue-600">📅</span>
                      Schedule Meeting
                    </h2>

                    <div className="space-y-5">
                      {/* User Details */}
                      <div className="bg-blue-50 p-4 sm:p-5 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                          Your Details
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">👤</span>
                            <span className="text-gray-700 font-medium">{user.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">📧</span>
                            <span className="text-gray-600 text-xs sm:text-sm break-all">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📞</span>
                              <span className="text-gray-700 font-medium">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Select Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={meetingData.date}
                          onChange={handleInputChange}
                          min={minDate}
                          max={maxDate}
                          className="w-60 px-4 py-3 text-sm border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          * Schedule at least 24 hours in advance
                        </p>
                      </div>

                      {/* Time Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Select Time
                        </label>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-8 border border-gray-300 rounded-lg bg-gray-50">
                            <span className="animate-spin text-blue-600 mr-2">⏳</span>
                            <span className="text-gray-600 text-sm">Loading slots...</span>
                          </div>
                        ) : meetingData.date && availableSlots.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {availableSlots.map(slot => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={slot.available ? () => handleTimeSlotSelect(slot.time) : null}
                                disabled={!slot.available}
                                className={`p-3.5 text-sm font-medium rounded-lg border transition-colors ${meetingData.time === slot.time
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : slot.available
                                      ? 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 text-gray-900'
                                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                {slot.time}
                                {!slot.available && (
                                  <div className="text-xs text-red-500 mt-1">Booked</div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : meetingData.date ? (
                          <div className="text-center py-8 border border-gray-300 rounded-lg bg-gray-50">
                            <div className="text-gray-600 text-sm font-medium">No slots available</div>
                            <div className="text-xs text-gray-500 mt-1">Try another date</div>
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-gray-50">
                            <div className="text-gray-600 text-sm font-medium">Select a date first</div>
                          </div>
                        )}
                      </div>

                      {/* Additional Requirements */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Additional Requirements <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          name="message"
                          value={meetingData.message}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Tell us about your requirements..."
                          className="w-full px-4 py-3 text-sm border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          maxLength={1000}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {meetingData.message.length}/1000 characters
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowMeetingForm(false);
                            setMeetingData({ date: '', time: '', message: '' });
                          }}
                          disabled={isBooking}
                          className="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleBookMeeting}
                          disabled={isBooking || !meetingData.date || !meetingData.time}
                          className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBooking ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Booking...
                            </>
                          ) : (
                            'Book Free Meeting'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* What's Included Card */}
            <Card className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border-2 md:border-4 border-blue-200">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl text-black">✨</span>
                {template.whatsIncluded?.title || "What's Included"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {template?.backend && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg md:rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors border border-transparent hover:border-blue-200">
                    <div className="p-1 sm:p-1.5 md:p-2 rounded-full flex-shrink-0 bg-green-100 border border-green-300">
                      <span className="text-sm sm:text-base">✓</span>
                    </div>
                    <span className="font-medium text-xs sm:text-sm md:text-base text-gray-800">
                      Backend Development
                    </span>
                  </div>
                )}

                {(template.whatsIncluded?.items?.length > 0
                  ? template.whatsIncluded.items
                  : DEFAULT_INCLUDED_ITEMS
                ).map((item, index) => {
                  const isIncluded = typeof item === 'string' ? true : item.included;
                  const text = typeof item === 'string' ? item : item.text;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg md:rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className={`p-1 sm:p-1.5 md:p-2 rounded-full flex-shrink-0 ${isIncluded
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-red-100 border border-red-300'
                        }`}>
                        <span className="text-sm sm:text-base">{isIncluded ? '✓' : '✗'}</span>
                      </div>
                      <span className={`font-medium text-xs sm:text-sm md:text-base ${isIncluded ? 'text-gray-800' : 'text-gray-400 line-through'
                        }`}>
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Template Features Card */}
            <Card className="p-4 sm:p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border-2 md:border-4 border-blue-200">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                Website Features
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {TEMPLATE_FEATURES.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </Card>

            {/* Process Card */}
            <Card className="p-4 min-[400px]:p-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl shadow-lg border-2 border-blue-300">
              <div className="flex items-start gap-2 min-[400px]:gap-3">
                <div className="p-1.5 min-[400px]:p-2 bg-white rounded-full border-2 border-blue-400 flex-shrink-0">
                  <span className="text-xl min-[400px]:text-2xl">
                    <img src={rocket} alt="" className='w-4' />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs min-[400px]:text-sm font-bold text-blue-900 mb-1.5 min-[400px]:mb-2">
                    Quick & Professional Process
                  </h4>
                  <p className="text-[10px] min-[400px]:text-xs text-gray-900 leading-relaxed font-medium">
                    Book → Meet → Pay Advance → Review Website → Pay Remaining → Launch.
                    <br /><br />
                    Get your professional website live in just 2-3 days with expert guidance every step of the way!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="h-2 md:h-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700"></div>

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

        /* Button background blink */}
        @keyframes buttonBgBlink {
          0%, 100% {
            background: linear-gradient(135deg, #2564eb6a 0%, #1d4fd86b 100%);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          50% {
            background: linear-gradient(135deg, #60a5fa6a 0%, #3b82f66a 100%);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4);
            transform: scale(1.02);
          }
        }
        
        .animate-button-bg-blink {
          animation: buttonBgBlink 1s ease-in-out 3;
        }
      `}</style>
    </div>
  );
};

export default TemplateDetails;
