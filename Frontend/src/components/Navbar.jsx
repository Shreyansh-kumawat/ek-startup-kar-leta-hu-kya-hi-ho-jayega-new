// Frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Button from './Button';
import logo2 from '../../public/logo2.png';


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const isActive = (path) => location.pathname === path;


  const getFirstName = (fullName) => {
    if (!fullName) return 'User';
    return fullName.trim().split(' ')[0];
  };


  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };


  const navLinks = [
    { text: 'Home', path: '/' },
    { text: 'About', path: '/about' },
    { text: 'Pricing', path: '/pricing' },
    { text: 'Contact', path: '/contact' },
  ];


  if (loading) {
    return (
      <nav className="sticky top-0 z-50 mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-lg bg-white/10 shadow-2xl border border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="animate-pulse bg-blue-200/30 h-8 w-32 rounded-lg"></div>
            <div className="animate-pulse bg-blue-200/30 h-8 w-24 rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }


  return (
    <nav className="sticky top-0 z-50 mx-3 sm:mx-4 mt-3 sm:mt-4">
      {/* Glassmorphism Navbar */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-r from-[#6498fe] via-[#5a87f7] to-[#6498fe] shadow-2xl border border-white/20 relative">
        <div className="absolute inset-0 bg-white/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between h-14 sm:h-16 items-center gap-4">

            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <img
                  loading="lazy"
                  width="140px"
                  className="sm:w-[150px] lg:w-[160px] transition-all duration-300 group-hover:scale-105 drop-shadow-lg"
                  src={logo2}
                  alt="3Digree"
                />
              </Link>
            </div>

            {/* ── CENTER NAV LINKS (Desktop) ── */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-white text-[#6498fe] shadow-md scale-105'
                      : 'text-white/90 hover:text-white hover:bg-white/15 backdrop-blur-sm'
                  }`}
                >
                  {link.text}
                </Link>
              ))}
            </div>

            {/* ── RIGHT SIDE (Desktop) ── */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className={`px-4 lg:px-5 py-2 rounded-xl text-sm lg:text-base font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl ${
                      isActive('/dashboard')
                        ? 'bg-white text-blue-600 scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/30'
                    }`}
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>

                  <div className="flex items-center space-x-3 lg:space-x-4">
                    {/* User Info Pill */}
                    <div className="flex items-center space-x-2.5 px-3 lg:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 shadow-lg hover:bg-white/15 transition-all duration-300">
                      <div className="w-8 h-8 lg:w-9 lg:h-9 bg-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white/30">
                        <span className="text-blue-600 text-xs lg:text-sm font-bold">
                          {getInitials(user?.name || user?.username)}
                        </span>
                      </div>
                      <span className="text-sm lg:text-base font-bold text-white hidden lg:block max-w-[120px] truncate">
                        {getFirstName(user?.name || user?.username)}
                      </span>
                    </div>

                    {/* Admin Panel Button */}
                    {(user?.role === 'admin' || user?.role === 'secondaryAdmin') && (
                      <Link to="/admin">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl px-3 lg:px-4 py-2 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="hidden lg:inline">Admin</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl px-4 lg:px-5 py-2 text-sm lg:text-base">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 px-4 lg:px-5 py-2 text-sm lg:text-base">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-xl p-2.5 transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-3 rounded-2xl overflow-hidden backdrop-blur-xl bg-white shadow-2xl border border-gray-100">
          <div className="px-3 py-4 space-y-1">

            {/* ── NAV LINKS — Mobile ── */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-[#6498fe] to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#6498fe]'
                }`}
              >
                <span className={`text-xs font-bold ${isActive(link.path) ? 'text-white/70' : 'text-[#6498fe]'}`}>→</span>
                {link.text}
              </Link>
            ))}

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">

              {/* Dashboard Link - Mobile (authenticated only) */}
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
              )}

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  {/* User Info Card */}
                  <div className="flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-200">
                      <span className="text-white text-sm font-bold">
                        {getInitials(user?.name || user?.username)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {getFirstName(user?.name || user?.username)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Admin Panel Button - Mobile */}
                  {(user?.role === 'admin' || user?.role === 'secondaryAdmin') && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 py-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                /* ── Login/Register Mobile — Side by side, compact ── */
                <div className="flex gap-2 pt-1">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <button className="w-full border-2 border-[#6498fe] text-[#6498fe] hover:bg-[#6498fe] hover:text-white rounded-xl font-bold transition-all duration-300 py-2 px-3 text-sm">
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <button className="w-full bg-gradient-to-r from-[#6498fe] to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 py-2 px-3 text-sm">
                      Register
                    </button>
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
