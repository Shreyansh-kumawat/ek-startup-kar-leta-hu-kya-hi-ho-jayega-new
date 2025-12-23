import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import BubbleButton from '../../components/BubbleButton';
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


// Memoized Tag Component
const Tag = memo(({ tag }) => (
  <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg text-xs md:text-sm font-medium border-2 border-blue-300">
    {tag}
  </span>
));


Tag.displayName = 'Tag';


const TemplateCard = ({ template, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add this state in TemplateCard component (after existing states)
const [shouldBlink, setShouldBlink] = useState(false);

// Add this useEffect AFTER existing states
useEffect(() => {
  const handleBlinkEvent = () => {
    console.log('✅ Blink event received in TemplateCard!');
    setShouldBlink(true);
    
    setTimeout(() => {
      setShouldBlink(false);
      console.log('❌ Blink stopped');
    }, 3600);
  };

  window.addEventListener('blinkLiveButton', handleBlinkEvent);
  
  return () => {
    window.removeEventListener('blinkLiveButton', handleBlinkEvent);
  };
}, []);


// Update Live button className (both Grid and List views)



  // Early return for invalid template
  if (!template) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ TemplateCard received null/undefined template');
    }
    return null;
  }


  // Memoized handlers
  const handleViewDetails = useCallback(() => {
    navigate(`/templates/${template._id}`);
  }, [navigate, template._id]);


  const handleLiveDemo = useCallback((e) => {
    e.stopPropagation();
    if (template.liveDemo) {
      window.open(template.liveDemo, '_blank', 'noopener,noreferrer');
    }
  }, [template.liveDemo]);


  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);


  const handleImageError = useCallback((e) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('❌ Image failed to load:', template.previewImage);
    }
    e.target.src = FALLBACK_IMAGE;
    e.target.className = "w-12 md:w-16 h-12 md:h-16 opacity-20 mx-auto mt-12 md:mt-20";
  }, [template.previewImage]);


  // Memoized image source
  const imageSrc = useMemo(() => {
    if (!template.previewImage) return FALLBACK_IMAGE;
    if (template.previewImage.startsWith('http')) return template.previewImage;
    return `http://localhost:5000${template.previewImage}`;
  }, [template.previewImage]);


  // Memoized badges
  const badges = useMemo(() => {
    const badgeList = [];
    if (template.price === 0) badgeList.push({ text: 'Free', color: 'green' });
    if (template.isPremium) badgeList.push({ text: 'Premium', color: 'blue' });
    if (template.isTrending) badgeList.push({ text: 'Trending', color: 'red' });
    if (template.isPopular) badgeList.push({ text: 'Popular', color: 'purple' });
    return badgeList;
  }, [template.price, template.isPremium, template.isTrending, template.isPopular]);


  // Memoized hosting badge text
  const hostingBadge = useMemo(() =>
    template.price >= 1400 ? 'Free Domain + Hosting' : 'Free Hosting',
    [template.price]
  );


  // Memoized price display
  const priceDisplay = useMemo(() =>
    template.price === 0 ? 'Free' : `₹ ${formatCurrency(template.price)}`,
    [template.price]
  );


  // Memoized template name
  const templateName = template.name || 'Untitled Template';
  const templateDescription = template.description || 'No description available';


  // List View
  if (viewMode === 'list') {
    return (
      <div
        className="flex flex-col lg:flex-row bg-white rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer border-2 border-blue-200"
        onClick={handleViewDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`Template: ${templateName}`}
        style={{
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 20px 40px rgba(59, 130, 246, 0.3)' : '0 10px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Image Section - LIST VIEW */}
        <div className="relative w-full lg:w-80 h-48 lg:h-48 flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-blue-300">
          <img 
            loading="lazy"
            src={imageSrc}
            alt={templateName}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />


          {imageSrc === FALLBACK_IMAGE && (
            <div className="absolute inset-0 flex items-center justify-center text-blue-400">
              <div className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">📄</div>
                <div className="text-xs md:text-sm font-medium">No Preview</div>
              </div>
            </div>
          )}


          {badges.length > 0 && (
            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2">
              {badges.map((badge, index) => (
                <Badge key={`${badge.text}-${index}`} {...badge} />
              ))}
            </div>
          )}


          {/* Backend Badge */}
          {template.backend && (
            <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20">
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


          {!template.isActive && (
            <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-red-500/90 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border-2 border-red-300">
              Inactive
            </div>
          )}
        </div>


        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 md:mb-4 gap-2">
            <div className="flex-1">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-1 md:mb-2 group-hover:from-blue-700 group-hover:via-blue-800 group-hover:to-blue-900 transition-all duration-300 line-clamp-2">
                {templateName}
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3">
                {templateDescription}
              </p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                {priceDisplay}
              </div>
              {template.rating && (
                <div className="flex items-center gap-1 justify-start sm:justify-end">
                  <span className="text-lg" aria-label="Rating">⭐</span>
                  <span className="text-xs md:text-sm font-medium text-blue-700">{template.rating}</span>
                </div>
              )}
            </div>
          </div>


          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
              {template.tags.slice(0, 4).map((tag, index) => (
                <Tag key={`${tag}-${index}`} tag={tag} />
              ))}
              {template.tags.length > 4 && (
                <span className="px-2 md:px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs md:text-sm font-medium border-2 border-gray-300">
                  +{template.tags.length - 4} more
                </span>
              )}
            </div>
          )}


          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6 text-xs md:text-sm text-blue-700 font-medium">
            {template.downloads && (
              <div className="flex items-center gap-1">
                <span aria-hidden="true">📥</span>
                <span>{template.downloads} downloads</span>
              </div>
            )}
            {template.category && (
              <div className="flex items-center gap-1">
                <span aria-hidden="true">🏷️</span>
                <span>{template.category}</span>
              </div>
            )}
          </div>

          {/* NEW: Package Include Section - LIST VIEW */}
          <div className='w-full flex justify-center items-center flex-col gap-2 mb-4 md:mb-5'>
            <div className='group relative bg-gradient-to-br from-blue-50 to-indigo-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto'>
              <div className='flex items-center gap-1.5 sm:gap-2 justify-center'>
                <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0' fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span className='text-[11px] sm:text-xs md:text-sm font-bold text-blue-900'>
                  Website Development
                </span>
              </div>
              <div className='absolute -top-1 -right-1 bg-green-500 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full shadow-sm'>
                ✓
              </div>
            </div>

            <div className='group relative bg-gradient-to-br from-green-50 to-emerald-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto'>
              <div className='flex items-center gap-1.5 sm:gap-2 justify-center'>
                <svg className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0' fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
                </svg>
                <span className='text-[11px] sm:text-xs md:text-sm font-bold text-green-900 whitespace-nowrap'>
                  {hostingBadge}
                </span>
              </div>
              <div className='absolute -top-1 -right-1 bg-green-500 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full shadow-sm'>
                ✓
              </div>
            </div>
          </div>


          <div className='flex justify-between w-full gap-2 md:gap-3'>
            {template.liveDemo && (
  <button
    onClick={handleLiveDemo}
    className={`px-2.5 md:px-2.5 py-0 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white rounded-lg md:rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-400 text-sm md:text-base cursor-pointer ${shouldBlink ? 'live-button-blink' : ''}`}
    aria-label="View live demo"
  >
    🔗 Live
  </button>
)}

            
            <BubbleButton onClick={handleViewDetails} className="w-fit">
              <span className="text-sm sm:text-base text-white w1054">Get This Website</span>
            </BubbleButton>
          </div>
        </div>
      </div>
    );
  }


  // Grid View (Default)
  return (
    <div
      className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border-2 border-blue-200"
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Template: ${templateName}`}
      style={{
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(59, 130, 246, 0.4)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Image Section - GRID VIEW */}
      <div className="relative h-40 sm:h-48 md:h-56 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden border-b-4 border-blue-300">
        <img 
          loading="lazy"
          src={imageSrc}
          alt={templateName}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />


        {imageSrc === FALLBACK_IMAGE && (
          <div className="absolute inset-0 flex items-center justify-center text-blue-400">
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">📄</div>
              <div className="text-xs md:text-sm font-medium">No Preview</div>
            </div>
          </div>
        )}


        {badges.length > 0 && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2">
            {badges.map((badge, index) => (
              <Badge key={`${badge.text}-${index}`} {...badge} />
            ))}
          </div>
        )}


        {/* Backend Badge */}
        {template.backend && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 z-20">
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


        {!template.isActive && (
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-red-500/90 text-white px-2 md:px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border-2 border-red-300">
            Inactive
          </div>
        )}
      </div>


      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-2 md:mb-3 gap-2">
          <h3 className="text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-blue-800 group-hover:to-blue-900 transition-colors duration-300 truncate flex-1">
            {templateName}
          </h3>
          {template.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-lg" aria-label="Rating">⭐</span>
              <span className="text-xs md:text-sm font-medium text-blue-700">{template.rating}</span>
            </div>
          )}
        </div>


        <p className="text-gray-700 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 leading-relaxed">
          {templateDescription}
        </p>


        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
            {template.tags.slice(0, 2).map((tag, index) => (
              <Tag key={`${tag}-${index}`} tag={tag} />
            ))}
            {template.tags.length > 2 && (
              <span className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-xs font-medium border-2 border-gray-300">
                +{template.tags.length - 2}
              </span>
            )}
          </div>
        )}


        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {priceDisplay}
            </div>
            {template.downloads && (
              <div className="flex items-center gap-1 text-xs text-blue-700 font-medium">
                <span aria-hidden="true">📥</span>
                <span className="hidden sm:inline">{template.downloads}</span>
                <span className="sm:hidden">{template.downloads > 999 ? '1k+' : template.downloads}</span>
              </div>
            )}
          </div>
        </div>


        {/* NEW: Package Include Section - GRID VIEW */}
        <div className='w-full flex justify-center items-center flex-col gap-2 mb-3 md:mb-4'>
          <div className='group relative bg-gradient-to-br from-blue-50 to-indigo-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 w-2/3'>
            <div className='flex items-center gap-1.5 justify-center'>
              <svg className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0' fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span className='text-[10px] sm:text-[11px] md:text-xs font-bold text-blue-900'>
                Website Development
              </span>
            </div>
            <div className='absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm'>
              ✓
            </div>
          </div>

          <div className='group relative bg-gradient-to-br from-green-50 to-emerald-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-md hover:shadow-lg transition-all duration-300 w-22/30'>
            <div className='flex items-center gap-1.5 justify-center'>
              <svg className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 flex-shrink-0' fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
              </svg>
              <span className='text-[10px] sm:text-[11px] md:text-xs font-bold text-green-900 whitespace-nowrap'>
                {hostingBadge}
              </span>
            </div>
            <div className='absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm'>
              ✓
            </div>
          </div>
        </div>


        <div className='flex justify-between w-full gap-2'>
          {template.liveDemo && (
            <button
              onClick={handleLiveDemo}
              className={`px-2.5 md:px-2.5 py-0 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white rounded-lg md:rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-400 text-xs md:text-sm flex items-center gap-1 cursor-pointer ${shouldBlink ? 'live-button-blink' : ''}`}
              aria-label="View live demo"
            >
              <span>🔗</span>
              <span>Live</span>
            </button>
          )}
          <BubbleButton onClick={handleViewDetails} className="w-fit">
            <span className="text-xs sm:text-sm md:text-base text-white w1054">Get This Website</span>
          </BubbleButton>
        </div>
      </div>
    </div>
  );
};


export default memo(TemplateCard);
