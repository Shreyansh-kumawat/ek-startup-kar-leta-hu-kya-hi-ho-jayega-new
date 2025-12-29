import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { notifications, removeNotification } = useNotification();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('admin')) return 'Admin Panel';
    if (path.includes('bookings')) return 'My Bookings';
    if (path.includes('meetings')) return 'My Meetings';
    if (path.includes('account')) return 'My Account';
    return 'Dashboard';
  };

  // ✅ NEW: Get credits safely
  const credits = user?.credits ?? 0;

  // Function to close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile menu button - Show hamburger when sidebar closed, hide when open */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
            sidebarOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="text-base sm:text-lg">☰</span>
        </button>
      </div>

      {/* Sidebar - Responsive container */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out 
      fixed lg:static inset-y-0 left-0 z-40 lg:flex lg:flex-shrink-0`}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
        />
      </div>

      {/* Main content - Add click handler to close sidebar when clicked outside */}
      <div 
        className="flex-1 flex flex-col min-w-0 lg:pl-0"
        onClick={() => {
          // Close sidebar when clicking on main content area (only on mobile/tablet)
          if (sidebarOpen && window.innerWidth < 1024) {
            closeSidebar();
          }
        }}
      >
        {/* Header - Enhanced responsive design with CREDITS */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Title section - Responsive margins and text */}
            <div className="ml-12 sm:ml-14 lg:ml-0 min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                {getPageTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Welcome back, {user?.name || user?.username}
              </p>
            </div>
            
            {/* ✅ NEW: CREDITS DISPLAY + User info */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Credits Badge */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className={`px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium border ${
                  credits > 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <span className="text-xs">🎫</span>
                  <span className="font-semibold">{credits}</span>
                  <span className="hidden sm:inline">Credits</span>
                </div>
              </div>

              {/* User avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm text-gray-700 capitalize hidden sm:inline truncate">
                  {user?.role === 'user' ? 'Client' : user?.role || 'client'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Responsive padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Notifications - Responsive positioning */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs sm:max-w-sm">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout;
