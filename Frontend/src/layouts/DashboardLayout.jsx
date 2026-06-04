import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';
import { LuTicket } from 'react-icons/lu';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { notifications, removeNotification } = useNotification();

  const credits = user?.credits ?? 0;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Admin Panel';
    if (path.includes('/admin/users')) return 'User Management';
    if (path.includes('/admin/templates')) return 'Website Templates';
    if (path.includes('/admin')) return 'Admin Panel';
    if (path.includes('bookings')) return 'My Website Bookings';
    if (path.includes('account')) return 'My Account';
    if (path === '/dashboard' || path === '/dashboard/') return 'Dashboard';
    return 'Dashboard';
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    if (path.includes('admin')) return 'Manage your platform';
    if (path.includes('bookings')) return 'Track your website projects';
    if (path.includes('account')) return 'Manage your profile';
    return `Welcome back, ${user?.name || user?.username || 'there'}`;
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4ff' }}>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2.5 bg-white shadow-md border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 ${
            sidebarOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        onClick={() => { if (sidebarOpen && window.innerWidth < 1024) setSidebarOpen(false); }}
      >
        {/* ===== HEADER ===== */}
        <header className="bg-white border-b border-gray-200 px-5 sm:px-8 py-0 flex-shrink-0" style={{ minHeight: '64px' }}>
          <div className="flex items-center justify-between h-16">

            {/* Left: page title */}
            <div className="ml-12 lg:ml-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{getPageTitle()}</h1>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">{getPageSubtitle()}</p>
            </div>

            {/* Right: credits + avatar */}
            <div className="flex items-center gap-3">

              {/* Credits pill */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                credits > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}>
                <LuTicket className="w-3.5 h-3.5" />
                <span>{credits} Credits</span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-8 w-px bg-gray-200" />

              {/* User avatar + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6498fe, #5a87f7)' }}
                >
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-sm font-semibold text-gray-800">{user?.name || user?.username || 'User'}</div>
                  <div className="text-[10px] text-gray-400 capitalize">
                    {user?.role === 'admin' ? 'Main Admin' :
                     user?.role === 'secondaryAdmin' ? 'Secondary Admin' : 'Client'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs sm:max-w-sm">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            type={n.type}
            message={n.message}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardLayout;
