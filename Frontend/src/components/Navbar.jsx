import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Button from './Button';
import logo2 from '../../public/logo2.png'

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
  
  const navLinks = [
    // { path: '/home', label: 'Home', public: true },
    // { path: '/', label: 'Home', public: true },
    ...(isAuthenticated ? [
      { path: '/dashboard', label: 'Dashboard' }
    ] : [])
  ];
  
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  if (loading) {
    return (
      <nav className="bg-[#6498fe] shadow-lg sticky top-0 z-40 mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="animate-pulse bg-blue-700 h-8 w-32 rounded-lg"></div>
            <div className="animate-pulse bg-blue-700 h-8 w-24 rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="bg-[#6498fe] shadow-lg sticky top-0 z-40 mx-4 mt-4 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <img 
                loading="lazy" 
                width="150px" 
                src={logo2} 
                alt="3Digree" 
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ path, label, public: isPublic }) => (
              (isPublic || isAuthenticated) && (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive(path)
                      ? 'text-blue-200 bg-blue-700' 
                      : 'text-white hover:text-green-300 hover:bg-blue-700'
                  }`} 
                >
                  {label}
                </Link>
              )
            ))}
          </div>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-700 bg-opacity-50">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-blue-600 text-sm font-bold">
                      {getInitials(user?.name || user?.username)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-white hidden lg:block">
                    {user?.name || user?.username}
                  </span>
                </div>
                
                {/* Admin Panel Button */}
                {(user?.role === 'admin' || user?.role === 'secondaryAdmin') && (
                  <Link to="/admin">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-white text-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <></>

              /*
                <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white text-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-all duration-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-blue-700 text-white hover:bg-blue-800 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Register
                  </Button>
                </Link>
              </div>
                */
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Smooth Slide Animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-gray-200 rounded-b-2xl shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map(({ path, label, public: isPublic }) => (
              (isPublic || isAuthenticated) && (
                <Link
                  key={path}
                  to={path}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              )
            ))}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 space-y-3 border-t border-gray-200 mt-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-4 py-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">
                        {getInitials(user?.name || user?.username)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Admin Panel Button */}
                  {(user?.role === 'admin' || user?.role === 'secondaryAdmin') && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold shadow-md"
                    >
                      Register
                    </Button>
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
