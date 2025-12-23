// src/pages/Templates.jsx
// COMPLETE WORKING VERSION with Tutorial Tracking

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTemplates } from "../features/template/api";
import { recordTutorialInteraction, updateVideoProgress } from "../features/auth/api";
import { useAuth } from "../features/auth/useAuth";
import TemplateGrid from "../features/template/TemplateGrid";
import Button from "../components/Button";
import Loader from "../components/Loader";

const PAGE_SIZE = 10000;

// Memoized Error Component
const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
    <div className="text-center bg-white p-6 md:p-8 rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border-2 md:border-4 border-blue-400 max-w-md w-full">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 text-base md:text-lg mb-4 font-semibold">{error}</p>
      <Button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        Try Again
      </Button>
    </div>
  </div>
));

ErrorDisplay.displayName = "ErrorDisplay";

// Memoized Loading Component
const LoadingDisplay = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <div className="flex justify-center items-center flex-col">
      <Loader size="xl" />
      <p className="mt-4 text-blue-700 font-semibold">Loading Websites...</p>
    </div>
  </div>
));

LoadingDisplay.displayName = "LoadingDisplay";

// ✅ HELPER FUNCTION: Clear ALL video tutorial tickets
const clearAllTutorialTickets = () => {
  sessionStorage.removeItem('aiTutorialTicket');
  sessionStorage.removeItem('templateDetailsTicket');
  sessionStorage.removeItem('video10Ticket');
  sessionStorage.removeItem('video11Ticket');
  sessionStorage.removeItem('video12Ticket');
  sessionStorage.removeItem('video13Ticket');
  sessionStorage.removeItem('video14Ticket');
  console.log('🎫 All tutorial tickets cleared');
};

// ✅ UPDATED: AI Video Tutorial Component with Backend Tracking
const AIVideoTutorial = memo(({ onTutorialStateChange }) => {
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // ✅ FIXED: Always start with true, check storage in useEffect
  const [showTutorial, setShowTutorial] = useState(true);
  const hasCheckedStorage = useRef(false);
  
  const [tutorialStarted, setTutorialStarted] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(1);
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionType, setQuestionType] = useState(null);
  const [showFinalText, setShowFinalText] = useState(false);
  
  const [interactionId, setInteractionId] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const frameSkipCounter = useRef(0);
  const hasTriggeredBlink = useRef(false);

  // ✅ FIXED: Check storage only once on mount
  useEffect(() => {
    if (!hasCheckedStorage.current) {
      const declined = sessionStorage.getItem('tutorialDeclined');
      
      if (declined === 'true') {
        console.log('🚫 Tutorial was declined in this session, hiding popup');
        setShowTutorial(false);
        onTutorialStateChange(false);
      } else {
        console.log('✅ Tutorial popup will be shown');
        setShowTutorial(true);
      }
      
      hasCheckedStorage.current = true;
    }
  }, [onTutorialStateChange]);

  // Screen width detection with resize listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      if (width < 700 && tutorialStarted) {
        setShowTutorial(false);
        setTutorialStarted(false);
        clearAllTutorialTickets();
        onTutorialStateChange(false);
        console.log('🚫 Tutorial closed: Screen width < 700px');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [tutorialStarted, onTutorialStateChange]);

  useEffect(() => {
    if (screenWidth < 700) {
      setShowTutorial(false);
      onTutorialStateChange(false);
    }
  }, [screenWidth, onTutorialStateChange]);

  // Record tutorial interaction with backend
  const recordInteraction = async (action) => {
    if (!user) {
      console.log('⚠️ User not logged in, skipping tutorial tracking');
      return null;
    }

    try {
      const sessionId = Date.now().toString();
      const response = await recordTutorialInteraction(action, sessionId);
      
      if (response.success && response.data?.interactionId) {
        console.log(`✅ Tutorial interaction recorded: ${action.toUpperCase()}`, response.data.interactionId);
        return response.data.interactionId;
      }
    } catch (error) {
      console.error('❌ Failed to record tutorial interaction:', error);
    }
    return null;
  };

  // Track video progress with backend
  const trackVideoProgress = async (videoNum) => {
    if (!user || !interactionId || watchedVideos.has(videoNum)) {
      return;
    }

    try {
      await updateVideoProgress(interactionId, videoNum);
      setWatchedVideos(prev => new Set([...prev, videoNum]));
      console.log(`✅ Video ${videoNum}/15 tracked`);
    } catch (error) {
      console.error(`❌ Failed to track video ${videoNum}:`, error);
    }
  };

  const handleVideoEnd = () => {
    trackVideoProgress(currentVideo);

    if (currentVideo === 1) {
      setQuestionType("shortIntro");
      setShowQuestion(true);
    } else if (currentVideo === 2 || currentVideo === 3) {
      setCurrentVideo(4);
      setShowQuestion(false);
    } else if (currentVideo === 4) {
      setCurrentVideo(5);
      setShowQuestion(false);
    } else if (currentVideo === 5) {
      setQuestionType("donePreview");
      setShowQuestion(true);
    } else if (currentVideo === 6 || currentVideo === 7) {
      setShowFinalText(true);
      sessionStorage.setItem('templateDetailsTicket', 'active');
      console.log('🎫 TemplateDetails ticket refreshed!');
    }
  };

  const handleAnswer = (answer) => {
    setShowQuestion(false);
    if (questionType === "shortIntro") {
      setCurrentVideo(answer === "yes" ? 2 : 3);
    } else if (questionType === "donePreview") {
      setCurrentVideo(answer === "yes" ? 6 : 7);
    }
  };

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

  useEffect(() => {
    if (videoRef.current && tutorialStarted) {
      const video = videoRef.current;
      
      hasTriggeredBlink.current = false;
      
      const handleTimeUpdate = () => {
        if (currentVideo === 4) {
          if (!hasTriggeredBlink.current && video.currentTime >= 15.5 && video.currentTime < 16) {
            console.log('🔥 BLINK EVENT TRIGGERED!');
            const blinkEvent = new CustomEvent('blinkLiveButton');
            window.dispatchEvent(blinkEvent);
            hasTriggeredBlink.current = true;
          }
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      
      frameSkipCounter.current = 0;
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
  }, [currentVideo, tutorialStarted, processFrame]);

  if (screenWidth < 700) return null;
  if (!showTutorial) return null;

  // YES/NO Popup
  if (!tutorialStarted) {
    return (
      <div className="fixed bottom-4 right-4 z-50 rounded-2xl overflow-hidden max-w-xs shadow-2xl">
        <div className="flex items-center">
          <img 
            src="./live.png" 
            alt="Live Tutorial" 
            className="w-52 object-contain"
          />
        </div>
        
        <div className="h-1 bg-blue-700 rounded-t-full"></div>
        
        <div className="bg-white p-4 flex gap-3">
          <button
            onClick={async () => {
              const id = await recordInteraction('yes');
              setInteractionId(id);
              
              setTutorialStarted(true);
              sessionStorage.setItem('aiTutorialTicket', 'active');
              sessionStorage.setItem('templateDetailsTicket', 'active');
              sessionStorage.removeItem('tutorialDeclined');
              onTutorialStateChange(true);
              console.log('🎫 Tutorial started with tracking!');
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
          >
            Yes
          </button>
          <button
            onClick={async () => {
              await recordInteraction('no');
              
              setShowTutorial(false);
              clearAllTutorialTickets();
              sessionStorage.setItem('tutorialDeclined', 'true');
              onTutorialStateChange(false);
              console.log('🚫 Tutorial declined with tracking');
            }}
            className="flex-1 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    );
  }

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

        {showQuestion && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 animate-fadeIn">
            <p className="text-white bg-black h-fit w-fit px-3 py-2 rounded-lg text-sm font-semibold mb-4 text-center">
              {questionType === "shortIntro" && "Want Short Intro?"}
              {questionType === "donePreview" && "Done Preview?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleAnswer("yes")}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer("no")}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                {questionType === "shortIntro" ? "No" : "Don't want"}
              </button>
            </div>
          </div>
        )}

        {showFinalText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black bg-opacity-70 animate-fadeIn">
            <p className="text-white text-center font-bold text-base leading-relaxed">
              Click on<br />Get This Website
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setShowTutorial(false);
            setTutorialStarted(false);
            clearAllTutorialTickets();
            sessionStorage.setItem('tutorialDeclined', 'true');
            onTutorialStateChange(false);
            console.log('🚫 Tutorial closed by user');
          }}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
});

AIVideoTutorial.displayName = "AIVideoTutorial";

const Templates = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoading2, setShowLoading2] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("random");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isTutorialActive, setIsTutorialActive] = useState(false);

  // ✅ ADDED: Clear tutorial declined flag on component mount
  useEffect(() => {
    // Clear declined flag when user navigates to Templates page
    sessionStorage.removeItem('tutorialDeclined');
    console.log('🧹 Tutorial declined flag cleared on page load');
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: searchTerm.trim() || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        priceMin: priceRange.min || undefined,
        priceMax: priceRange.max || undefined,
        sortBy,
      };

      const data = await getAllTemplates(params);

      if (data?.templates) {
        setTemplates(data.templates);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        setTemplates([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || "Failed to load templates. Please try again.");
      setTemplates([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, priceRange.min, priceRange.max, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTemplates();
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [fetchTemplates, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading2(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("random");
    setPage(1);
  }, []);

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchTemplates} />;
  }

  if (loading && showLoading2) {
    return <LoadingDisplay />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AIVideoTutorial onTutorialStateChange={setIsTutorialActive} />

      <div
        className="h-2 md:h-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700"
        aria-hidden="true"
      ></div>

      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 md:py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4 text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-md lg:drop-shadow-lg">
            We Develop Websites
          </h1>
          <p className="text-center text-blue-700 font-semibold text-sm sm:text-sm md:text-lg mb-6 md:mb-8 px-2 max-[640px]:hidden">
            <span className="sm:text-[12px] md:text-[13px]">Select Design</span> &nbsp;
            <span className="text-black sm:text-[12px] md:text-[13px]">→</span> &nbsp;
            <span className="sm:text-[13px] md:text-[15px]">Book 10 Min Free Meeting </span> &nbsp;
            <span className="text-black sm:text-[13px] md:text-[15px]">→</span> &nbsp;
            <span className="sm:text-[14px] md:text-[16px]">Go to sleep </span> &nbsp;
            <span className="text-black sm:text-[14px] md:text-[16px]">→</span> &nbsp;
            <span className="sm:text-[15px] md:text-[17px]">Wake Up</span> &nbsp;
            <span className="text-black sm:text-[15px] md:text-[17px]">→</span> &nbsp;
            <span className="sm:text-[17px] md:text-[19px]">Your website is ready</span>
          </p>

          <p className="text-center text-blue-700 font-semibold text-sm sm:text-sm md:text-lg mb-6 md:mb-8 px-2 min-[640px]:hidden flex flex-col">
            <span className="text-[12px]">Select Design</span>
            <span className="text-black">&darr;</span>
            <span className="text-[13px]">Book Free Meeting</span>
            <span className="text-black">&darr;</span>
            <span className="text-[15px]">Your website is ready</span>
          </p>

          <TemplateGrid
            templates={templates}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            clearFilters={clearFilters}
            isTutorialActive={isTutorialActive}
          />
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-12 sm:py-16 md:py-20 text-center text-white relative overflow-hidden shadow-xl md:shadow-2xl">
        <div className="relative z-10 px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 drop-shadow-md md:drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="mb-5 md:mb-6 max-w-xl mx-auto text-sm sm:text-base md:text-lg font-medium px-4">
            Choose your template and get your website live in 24 hours!
          </p>
          <a
            className="inline-block bg-white text-blue-700 font-bold px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 rounded-full shadow-xl md:shadow-2xl hover:shadow-blue-300/50 hover:scale-105 transform transition-all duration-300 border-2 md:border-4 border-blue-200 text-sm sm:text-base cursor-pointer"
            href="https://3digree.com/3digree/contact.html"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us to get started"
          >
            Contact Us
          </a>
        </div>
      </section>

      <div
        className="h-2 md:h-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        aria-hidden="true"
      ></div>

      <footer className="bg-gradient-to-br from-black to-gray-900 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <img 
                src="/logo2.png" 
                alt="3Digree Logo" 
                className="h-10 w-auto"
              />
              <p className="text-gray-400 text-sm font-medium">
                Your Partner in Development, AI and beyond
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="/home" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">Home</a>
              <a href="/about" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">About Us</a>
              <a href="/contact" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200 font-medium text-sm">Contact</a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-4">
                <a href="https://www.linkedin.com/company/3-digree/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/3digree/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61573177101623" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00ffab] transition-colors duration-200" aria-label="Visit our Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} 3Digree. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

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
      `}</style>
    </div>
  );
};

export default Templates;
