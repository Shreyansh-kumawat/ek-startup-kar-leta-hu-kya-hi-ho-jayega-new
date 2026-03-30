import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', emoji: '📊', gradient: 'from-blue-500 to-blue-600' },
    { path: '/dashboard/bookings', label: 'My Website Bookings', emoji: '🎯', gradient: 'from-indigo-500 to-purple-600' },
    { path: '/pricing', label: 'Buy Credits', emoji: '💳', gradient: 'from-green-500 to-emerald-600' },
    { path: '/dashboard/account', label: 'My Account', emoji: '👤', gradient: 'from-teal-500 to-cyan-600' },
  ];

  const adminMenuItems = [
    { path: '/admin', label: 'Admin Dashboard', emoji: '⚡', gradient: 'from-indigo-500 to-purple-600' },
    { path: '/admin/users', label: 'User Management', emoji: '👥', gradient: 'from-cyan-500 to-blue-600' },
    { path: '/admin/templates', label: 'Website Templates', emoji: '🎨', gradient: 'from-purple-500 to-indigo-600' },
  ];

  const secondaryAdminMenuItems = [
    { path: '/admin', label: 'Admin Dashboard', emoji: '⚡', gradient: 'from-indigo-500 to-purple-600' },
    { path: '/admin/templates', label: 'Website Templates', emoji: '🎨', gradient: 'from-purple-500 to-indigo-600' },
  ];

  const isMainAdmin = user?.role === 'admin';
  const isSecondaryAdmin = user?.role === 'secondaryAdmin';

  let menuItems = userMenuItems;
  if (isMainAdmin) menuItems = [...userMenuItems, { separator: true }, ...adminMenuItems];
  else if (isSecondaryAdmin) menuItems = [...userMenuItems, { separator: true }, ...secondaryAdminMenuItems];

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');
  const getUserDisplayName = () => user?.name || user?.username || 'User';
  const getUserRole = () => {
    if (isMainAdmin) return 'Main Admin';
    if (isSecondaryAdmin) return 'Secondary Admin';
    return 'Client';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
          w-64 xl:w-72 flex-shrink-0
          border-r border-gray-100
        `}
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== LOGO SECTION ===== */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <a
            href="https://3digree.in"
            className="flex items-center gap-2.5 group w-fit"
            title="Go to 3Digree Home"
          >
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}
            >
              <span className="text-white font-extrabold text-base leading-none">3D</span>
            </div>
            {/* Wordmark */}
            <div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                3Digree
              </span>
              <span className="block text-[10px] text-gray-400 font-medium leading-none -mt-0.5">Website Platform</span>
            </div>
          </a>
        </div>

        {/* ===== USER PROFILE SECTION ===== */}
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <span className="text-white text-lg font-bold">{getInitials(getUserDisplayName())}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">{getUserDisplayName()}</h2>
                <p className="text-white/75 text-xs flex items-center gap-1">
                  {isMainAdmin ? <><span>👑</span> Main Admin</> :
                   isSecondaryAdmin ? <><span>🔐</span> Secondary Admin</> :
                   'Client'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ===== NAV ITEMS ===== */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.map((item, index) => {
            if (item.separator) {
              return (
                <div key={`sep-${index}`} className="py-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="h-px bg-gray-200 flex-1" />
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-bold ${
                      isMainAdmin ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      <span>{isMainAdmin ? '👑' : '🔐'}</span>
                      <span>ADMIN PANEL</span>
                    </div>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>
                </div>
              );
            }

            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 relative overflow-hidden
                  ${active ? 'text-white shadow-md' : 'text-gray-600 hover:text-white hover:shadow-md'}
                `}
              >
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #6498fe, #5a87f7)' }}
                />
                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-white/20 border border-white/30' : 'bg-gray-100 group-hover:bg-white/20 group-hover:border group-hover:border-white/30'
                }`}>
                  <span className="text-base">{item.emoji}</span>
                </div>
                <span className="relative z-10 font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ===== FOOTER ===== */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          {user?.credits !== undefined && (
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full w-fit mx-auto">
              <span className="text-xs">🎫</span>
              <span className="text-xs font-bold text-green-700">{user.credits} Credits</span>
            </div>
          )}
          <p className="text-center text-[10px] text-gray-400 mt-1.5">3Digree © 2026</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
