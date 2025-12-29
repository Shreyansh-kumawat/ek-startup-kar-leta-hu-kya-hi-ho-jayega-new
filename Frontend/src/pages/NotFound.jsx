// src/pages/NotFound.jsx
import {useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

   useEffect(() => {
    document.title = "404 - Page Not Found | 3Digree";
  }, []);
  
  // Function to truncate pathname to 8 characters (excluding slash)
  const getTruncatedPath = () => {
    const path = location.pathname.substring(1); // Remove leading slash
    if (path.length <= 8) {
      return `/${path}`;
    }
    return `/${path.substring(0, 8)}...`;
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#3891ff] to-[#7bb6ff]">
      <div className="text-center p-8 max-w-md">
        {/* Animated Video Section with Overlay Text */}
        <div className="mb-6 flex justify-center relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            className="w-64 h-64 object-contain sm:w-72 sm:h-72 md:w-80 md:h-80"
            style={{ pointerEvents: 'none' }}
          >
            <source src="/notfound.mp4" type="video/mp4" />
            {/* Fallback emoji if video doesn't load */}
            <div className="text-8xl">🔍</div>
          </video>
          
          {/* Overlay Text - Pathname Display */}
          <div className="absolute top-[22%] left-1/2 transform -translate-x-1/2 w-[60%] sm:w-[55%] md:w-[50%]">
            <div>
              <p className="text-black font-mono text-sm sm:text-sm md:text-base font-semibold truncate">
                {getTruncatedPath()}
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
         
        
        <div className="flex gap-4 justify-center mt-6">
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
