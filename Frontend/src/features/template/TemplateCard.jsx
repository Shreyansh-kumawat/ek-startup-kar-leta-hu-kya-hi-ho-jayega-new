import React, { useState, useMemo, useCallback, memo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import './TemplateCard.css'; 

// ✅ FIXED: Fallback image
const FALLBACK_IMAGE = 'https://via.placeholder.com/800x600/E8F4FD/4299E1?text=No+Preview+Available';

// Memoized Badge Component
const Badge = memo(({ text, color }) => {
  const colorClasses = {
    green: 'bg-green-100/90 text-green-800 border-green-300',
    blue: 'bg-blue-100/90 text-blue-800 border-blue-400',
    red: 'bg-red-100/90 text-red-800 border-red-300',
    purple: 'bg-purple-100/90 text-purple-800 border-purple-300',
    orange: 'bg-orange-100/90 text-orange-800 border-orange-300'
  };

  return (
    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border-2 ${colorClasses[color]}`}>
      {text}
    </span>
  );
});

Badge.displayName = 'Badge';

const TemplateCard = ({ 
  template, 
  viewMode = 'grid',
  onBookTemplate
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Field aliases — support snake_case (Supabase) and camelCase (legacy)
  const previewImage = template?.preview_image || template?.previewImage;
  const liveDemo = template?.live_demo || template?.liveDemo;
  const templateLink = template?.template_link || template?.templateLink;
  const isActive = template?.is_active !== undefined ? template?.is_active : template?.isActive;
  const withBackend = template?.with_backend !== undefined ? template?.with_backend : template?.withBackend;
  const creditsRequiredValue = template?.credits_required || template?.creditsRequired || 1;
  const storedDisplayId = template?.display_id || template?.displayId;

  const imageSrc = useMemo(() => {
    if (!previewImage || imageError) return FALLBACK_IMAGE;
    return previewImage;
  }, [previewImage, imageError]);

  const priceDisplay = useMemo(() => {
    if (!template) return '₹0';
    return template.price === 0 ? 'Free' : `₹${formatCurrency(template.price)}`;
  }, [template]);

  const statusColor = useMemo(() => (isActive !== false ? 'green' : 'red'), [isActive]);
  const statusText = useMemo(() => (isActive !== false ? 'Available' : 'Unavailable'), [isActive]);

  const displayId = useMemo(() => {
    if (storedDisplayId) return storedDisplayId;
    const idField = template?.id || template?._id;
    if (!idField) return null;
    const last6 = idField.toString().replace(/-/g, '').slice(-6);
    return `#3di-${last6}`;
  }, [storedDisplayId, template?.id, template?._id]);

  const hasBackend = useMemo(() => Boolean(withBackend === true), [withBackend]);
  const creditsRequired = useMemo(() => creditsRequiredValue, [creditsRequiredValue]);

  const creditsColor = useMemo(() => 
    creditsRequired > 1 ? 'orange' : 'blue',
    [creditsRequired]
  );

  // ✅ COPY HANDLER
  const handleCopyId = useCallback((e) => {
    e.stopPropagation();
    if (displayId) {
      navigator.clipboard.writeText(displayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayId]);

  // ✅ Live Preview Handler
  const handleLivePreview = useCallback((e) => {
    e.stopPropagation();
    const link = liveDemo || templateLink;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }, [liveDemo, templateLink]);

  // ✅ Book Handler
  const handleBook = useCallback((e) => {
    e.stopPropagation();
    if (onBookTemplate) {
      onBookTemplate(template);
    }
  }, [onBookTemplate, template]);

  const handleImageError = useCallback((e) => {
    console.warn('Image load failed:', previewImage);
    setImageError(true);
    setImageLoaded(true);
    e.target.src = FALLBACK_IMAGE;
  }, [previewImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  if (!template) {
    return null;
  }

  // Grid View
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
            alt={template.name || 'Template preview'}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />

          {/* ✅ Backend Badge (Top Left) - FIXED VISIBILITY */}
          {hasBackend && (
            <div className="absolute top-3 left-3 z-10">
              <Badge text="With Backend" color="purple" />
            </div>
          )}

          {/* Status Badge (Top Right) */}
          <div className="absolute top-3 right-3 z-10">
            <Badge text={statusText} color={statusColor} />
          </div>

          {/* Credits Badge (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-10">
            <Badge 
              text={`💳 ${creditsRequired} Credit${creditsRequired > 1 ? 's' : ''}`} 
              color={creditsColor} 
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">
            {template.name}
          </h3>

          {/* ID BADGE WITH COPY */}
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

          {/* ✅ TWO BUTTONS - LIVE + BOOK */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLivePreview}
              disabled={!liveDemo && !templateLink}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
              </svg>
              Live
            </button>

            <button
              onClick={handleBook}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
              Book
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
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
            alt={template.name || 'Template preview'}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />

          {/* ✅ Backend Badge - FIXED */}
          {hasBackend && (
            <div className="absolute top-3 left-3 z-10">
              <Badge text="With Backend" color="purple" />
            </div>
          )}

          <div className="absolute top-3 right-3">
            <Badge text={statusText} color={statusColor} />
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <Badge 
              text={`💳 ${creditsRequired} Credit${creditsRequired > 1 ? 's' : ''}`} 
              color={creditsColor} 
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {template.name}
            </h3>

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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLivePreview}
              disabled={!liveDemo && !templateLink}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
              </svg>
              Live
            </button>

            <button
              onClick={handleBook}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TemplateCard);