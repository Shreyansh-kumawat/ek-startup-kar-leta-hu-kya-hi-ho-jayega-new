import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick,
  header,
  footer,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${shadows[shadow]} ${hoverClasses} ${clickableClasses} ${className}`;
  
  return (
    <div 
      className={classes} 
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header}
        </div>
      )}
      
      <div className={header || footer ? 'p-6' : paddings[padding]}>
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
