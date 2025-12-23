import React, { useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';

const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, message, duration, actions = [] } = notification;
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);
  
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return (
    <div className={`flex items-start p-4 border rounded-lg shadow-sm ${typeStyles[type]} animate-in slide-in-from-right duration-300`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        
        {actions.length > 0 && (
          <div className="mt-2 flex space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onRemove(id);
                }}
                className={`text-xs px-2 py-1 rounded font-medium ${
                  action.variant === 'danger' 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
