import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const userMenuItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      emoji: '📊',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      path: '/templates', 
      label: 'Websites', 
      emoji: '🎨',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      path: '/dashboard/bookings', 
      label: 'My Bookings', 
      emoji: '📋',
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      path: '/dashboard/account',  // ✅ NEW - ADDED
      label: 'My Account', 
      emoji: '👤',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-600'
    },
  ];
  
  const adminMenuItems = [
    { 
      path: '/admin/templates', 
      label: 'Website Management', 
      emoji: '🎨',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600'
    },
    { 
      path: '/admin/bookings', 
      label: 'Bookings', 
      emoji: '📋',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      emoji: '👥',
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      path: '/admin/meetings', 
      label: 'Meeting Management', 
      emoji: '📅',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'secondaryAdmin';
  const menuItems = isAdmin ? [...userMenuItems, { separator: true }, ...adminMenuItems] : userMenuItems;

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    return user?.name || user?.username || 'User';
  };

  // Handle click events inside sidebar to prevent closing
  const handleSidebarClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Mobile Overlay - Only shows on small screens when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Prevent click propagation */}
      <div 
        className={`
          fixed top-0 left-0 h-full z-50 transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 
          w-72 sm:w-80 lg:w-64 xl:w-72
          lg:flex-shrink-0
        `} 
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
        onClick={handleSidebarClick}
      >

        {/* Header Section - Responsive padding and sizing */}
        <div className="relative overflow-hidden">
          <div 
            className="p-4 sm:p-6 text-white relative"
            style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* User Avatar - Responsive sizing */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <span className="text-white text-lg sm:text-2xl font-bold">
                    {getInitials(getUserDisplayName())}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  {/* User Name - Responsive text sizing and truncation */}
                  <h2 className="text-lg sm:text-xl font-bold truncate">{getUserDisplayName()}</h2>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {isAdmin ? (
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-300">👑</span>
                        <span className="hidden sm:inline">Administrator</span>
                        <span className="sm:hidden">Admin</span>
                      </span>
                    ) : (
                      <span className="hidden sm:inline">Client</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Close Button - Only on mobile/tablet, only cross icon */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex-shrink-0"
                aria-label="Close sidebar"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Section - Responsive scrolling and padding */}
        <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="space-y-1 sm:space-y-2">
            {menuItems.map((item, index) => {
              if (item.separator) {
                return (
                  <div key={`separator-${index}`} className="my-6 sm:my-8">
                    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full">
                        <span className="text-yellow-300 text-xs sm:text-sm">👑</span>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                          Admin Panel
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider sm:hidden">
                          Admin
                        </span>
                      </div>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                  </div>
                );
              }

              const isCurrentActive = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose} // Close sidebar on navigation
                  className={`
                    group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 
                    rounded-xl sm:rounded-2xl transition-all duration-300 relative overflow-hidden
                    ${isCurrentActive
                      ? 'text-white shadow-xl transform scale-105'
                      : 'text-gray-700 hover:text-white hover:shadow-lg hover:scale-105'
                    }
                  `}
                  style={{
                    background: 'transparent'
                  }}
                >
                  {/* Background gradient for active and hover states */}
                  <div 
                    className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                      isCurrentActive 
                        ? 'opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ 
                      background: 'linear-gradient(135deg, #6498fe, #5a87f7)'
                    }}
                  />

                  {/* Icon container - Responsive sizing */}
                  <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    isCurrentActive 
                      ? 'bg-white/20 backdrop-blur-md border border-white/30' 
                      : 'bg-gray-100 group-hover:bg-white/20 group-hover:backdrop-blur-md group-hover:border group-hover:border-white/30'
                  }`}>
                    <span className={`text-sm sm:text-lg transition-colors duration-300 ${
                      isCurrentActive 
                        ? 'text-white' 
                        : 'group-hover:text-white'
                    }`}>{item.emoji}</span>
                  </div>

                  {/* Label - Responsive text sizing and truncation */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base truncate">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isCurrentActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-white rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section - Responsive text sizing and padding */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 sm:mb-2 truncate">
              3Digree Website Booking System
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
