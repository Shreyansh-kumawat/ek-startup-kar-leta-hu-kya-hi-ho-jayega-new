import React from 'react';

const Loader = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  type = 'spinner',
  text
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    white: 'text-white'
  };
  
  if (type === 'spinner') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`${sizes[size]} ${colors[color]} animate-spin`}>
          <svg fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        {text && <span className={`ml-2 text-sm ${colors[color]}`}>{text}</span>}
      </div>
    );
  }
  
  return (
    <div className={`${sizes[size]} ${colors[color]} ${className}`}>
      <div className="animate-pulse bg-current rounded" />
    </div>
  );
};

export default Loader;