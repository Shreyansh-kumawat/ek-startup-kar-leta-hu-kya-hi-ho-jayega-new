import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { formatCurrency } from '../../utils/helpers';
import './TemplateCard.css'; 

// Fallback image constant
const FALLBACK_IMAGE = 'https://3digree.com/3digree/assets/images/logo.png';

// Memoized Badge Component
const Badge = memo(({ text, color }) => {
  const colorClasses = {
    green: 'bg-green-100/90 text-green-800 border-green-300',
    blue: 'bg-blue-100/90 text-blue-800 border-blue-400',
    red: 'bg-red-100/90 text-red-800 border-red-300',
    purple: 'bg-purple-100/90 text-purple-800 border-purple-300'
  };

  return (
    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border-2 ${colorClasses[color]}`}>
      {text}
    </span>
  );
});

Badge.displayName = 'Badge';

const TemplateCard = ({ template, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Memoized values
  const imageSrc = useMemo(() => {
    if (!template?.previewImage) return FALLBACK_IMAGE;
    if (template.previewImage.startsWith('http')) return template.previewImage;
    return `http://localhost:5000${template.previewImage}`;
  }, [template?.previewImage]);

  const priceDisplay = useMemo(() => {
    if (!template) return '₹0';
    return template.price === 0 ? 'Free' : `₹${formatCurrency(template.price)}`;
  }, [template]);

  const statusColor = useMemo(() => 
    template?.isActive !== false ? 'green' : 'red',
    [template?.isActive]
  );

  const statusText = useMemo(() => 
    template?.isActive !== false ? 'Available' : 'Unavailable',
    [template?.isActive]
  );

  const hostingBadge = useMemo(() => 
    template?.price >= 1400 ? 'Free Domain + Hosting' : 'Free Web Hosting',
    [template?.price]
  );

  // ✅ Display ID Badge
  const displayId = useMemo(() => {
    if (!template?._id) return null;
    const last6 = template._id.toString().slice(-6);
    return `#3di-${last6}`;
  }, [template?._id]);

  // ✅ COPY HANDLER
  const handleCopyId = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayId]);

  // ✅ Live Preview Handler
  const handleLivePreview = useCallback((e) => {
    e.stopPropagation();
    if (template?.liveDemo || template?.templateLink) {
      window.open(template.liveDemo || template.templateLink, '_blank', 'noopener,noreferrer');
    }
  }, [template?.liveDemo, template?.templateLink]);

  const handleImageError = useCallback((e) => {
    e.target.src = FALLBACK_IMAGE;
    setImageLoaded(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  if (!template) {
    return null;
  }

  // Grid View (WEB 2 DESIGN)
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-4 border-blue-300 hover:border-blue-500 transform hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <img
            src={imageSrc}
            alt={template.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge text={statusText} color={statusColor} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">
            {template.name}
          </h3>

          {/* ✅ ID BADGE WITH COPY */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-700">
              Id: <span className="font-mono">{displayId}</span>
            </div>
            <button
              onClick={handleCopyId}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group/copy"
              title="Copy ID"
            >
              <svg 
                className="w-6 h-6 text-gray-600 group-hover/copy:text-blue-600 transition-colors" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                {copied ? (
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                ) : (
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                )}
              </svg>
            </button>
          </div>

          {/* ✅ LIVE BUTTON */}
          <button
            onClick={handleLivePreview}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
            </svg>
            Live
          </button>
        </div>
      </div>
    );
  }

  // List View (same as above, just different layout)
  return (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-4 border-blue-300 hover:border-blue-500">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-80 aspect-video md:aspect-auto bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <img
            src={imageSrc}
            alt={template.name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge text={statusText} color={statusColor} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {template.name}
            </h3>

            {/* ID with Copy */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold text-gray-700">
                Id: <span className="font-mono">{displayId}</span>
              </div>
              <button
                onClick={handleCopyId}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group/copy"
                title="Copy ID"
              >
                <svg 
                  className="w-6 h-6 text-gray-600 group-hover/copy:text-blue-600 transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  {copied ? (
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  ) : (
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Live Button */}
          <button
            onClick={handleLivePreview}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 text-lg shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
            </svg>
            Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TemplateCard);
