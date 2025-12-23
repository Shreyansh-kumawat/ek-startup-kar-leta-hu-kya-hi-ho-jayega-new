import React from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import { getDashboardStats } from '../services/templateBookingApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotification();

  // 🔥 MANUAL STATE MANAGEMENT - No useApi hook dependency
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 MANUAL API CALL FUNCTION
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDashboardStats();

      if (response && response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load dashboard data');
      }

    } catch (error) {
      console.error('❌ Dashboard API Error:', error);
      setError(error);
      showError(error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOAD ON MOUNT
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Extract data with fallbacks - 🔥 SAFE NULL CHECKS
  const stats = dashboardData?.stats || {
    totalBookings: 0,
    totalSpent: 0,
    upcomingMeetings: 0,
    activeProjects: 0
  };

  const recentBookings = dashboardData?.recentBookings || [];
  const upcomingMeetings = dashboardData?.upcomingMeetings || [];
  const recentActivities = dashboardData?.recentActivities || [];

  const statsCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings || 0,
      color: 'blue',
      icon: '📋',
      change: 'Website Bookings',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalSpent || 0),
      color: 'green',
      icon: '💰',
      change: 'All payments',
      gradient: 'from-green-500 to-green-600'
    },
    {
      label: 'Upcoming Meetings',
      value: stats.upcomingMeetings || 0,
      color: 'purple',
      icon: '📅',
      change: 'Scheduled consultations',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects || 0,
      color: 'orange',
      icon: '🚀',
      change: 'In progress',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const quickActions = [
    {
      title: 'Browse Websites',
      description: 'Explore our web designes',
      icon: '🎨',
      link: '/templates',
      color: 'blue',
      gradient: 'from-blue-50 to-blue-100',
      hoverGradient: 'from-blue-100 to-blue-200'
    },
    {
      title: 'My Bookings',
      description: 'Track your Website bookings and progress',
      icon: '📊',
      link: '/dashboard/bookings',
      color: 'purple',
      gradient: 'from-purple-50 to-purple-100',
      hoverGradient: 'from-purple-100 to-purple-200'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: '💬',
      link: 'https://3digree.com/3digree/contact.html',
      color: 'pink',
      gradient: 'from-pink-50 to-rose-100',
      hoverGradient: 'from-pink-100 to-rose-200'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Enhanced Welcome Section */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 sm:mb-6 lg:mb-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                  Welcome
                  <span className="block" style={{ color: "#00ffab" }}>
                    {user?.name || user?.username}! 👋
                  </span>
                </h1>
                <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
                  Here's an overview of your account and projects. Everything looks great!
                </p>
              </div>

              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                <div className="text-right bg-white/10 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4">
                  <div className="text-xs lg:text-sm text-white/80">{user?.name}</div>
                  <div className="text-sm text-white lg:text-base xl:text-lg">
                    {user?.email}
                  </div>
                  <div className="text-sm text-white lg:text-base xl:text-lg">
                    {user?.phone}
                    </div>
                </div>

                <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-white/20 backdrop-blur-md rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-bold text-xl lg:text-2xl xl:text-3xl border-2 lg:border-4 border-white/30">
                  {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 ENHANCED STATS GRID - MOBILE OPTIMIZED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
          {statsCards.map(({ label, value, color, icon, change, gradient }) => (
            <Card key={label} className="group p-0 overflow-hidden hover:shadow-xl md:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 border-0">
              <div className={`bg-gradient-to-br ${gradient} p-3 sm:p-4 md:p-5 lg:p-6 text-white relative overflow-hidden rounded-xl md:rounded-2xl`}>
                <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-24 lg:w-32 h-16 sm:h-20 md:h-24 lg:h-32 opacity-10">
                  <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl">{icon}</div>
                </div>
                <div className="relative">
                  <div className="text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-2">{label}</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    {loading ? (
                      <div className="animate-pulse bg-white/30 rounded h-5 sm:h-6 md:h-8 w-10 sm:w-12 md:w-16"></div>
                    ) : error ? (
                      <span className="text-red-200 text-xs sm:text-sm">Error</span>
                    ) : (
                      typeof value === 'string' && value.includes('₹') ? value : value
                    )}
                  </div>
                  <div className="text-xs text-white/70 bg-white/10 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full inline-block">
                    {change}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* 🔥 ENHANCED RECENT BOOKINGS - MOBILE OPTIMIZED */}
          <div className="lg:col-span-2">
            <Card className="p-0 border-0 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6 lg:p-8 bg-gradient-to-r from-white to-blue-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Recent Bookings</h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600">Track your recent Website bookings</p>
                  </div>
                  <Link to="/dashboard/bookings">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white/80 backdrop-blur border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-xs sm:text-sm py-2 px-3 sm:px-4"
                      style={{ borderRadius: '25px' }}
                    >
                      View All →
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-6 sm:py-8 md:py-12">
                    <div className="text-center">
                      <Loader />
                      <p className="mt-3 sm:mt-4 text-gray-600 text-xs sm:text-sm md:text-base">Loading your bookings...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-6 sm:py-8 md:py-12 bg-red-50 rounded-xl md:rounded-2xl border-2 border-red-200">
                    <div className="text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4">❌</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-900 mb-2 sm:mb-3 px-4">Error Loading Data</h3>
                    <p className="text-xs sm:text-sm md:text-base text-red-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                      {error?.message || 'Failed to load dashboard data. Please check your connection.'}
                    </p>
                    <Button
                      onClick={loadDashboardData}
                      className="bg-red-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base shadow-lg hover:bg-red-700 transition-all duration-200"
                      style={{ borderRadius: "50px" }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 md:py-12 bg-white rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4">📋</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">No bookings yet</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                      Start by browsing our amazing Website collection
                    </p>
                    <Link to="/templates">
                      <Button className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 text-xs sm:text-sm md:text-base shadow-lg hover:bg-blue-700 transition-all duration-200"
                        style={{ borderRadius: "50px" }}
                      >
                        Browse Websites
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-3.5 md:space-y-4">
                    {recentBookings.map((booking, index) => (
                      <div
                        key={booking._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-lg md:hover:shadow-xl transition-all duration-300 border border-gray-100 gap-3 sm:gap-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-4">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                            {booking.templateName.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-3 mb-1">
                              <div className="font-bold text-gray-900 text-sm md:text-base truncate">
                                {booking.templateName}
                              </div>
                              <span className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 text-xs font-bold rounded-full bg-${getStatusColor(booking.status)}-100 text-${getStatusColor(booking.status)}-800 self-start sm:self-center`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600">
                              📅 {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1.5 sm:mb-2">
                            {formatCurrency(booking.templatePrice)}
                          </div>
                          <Link to={`/dashboard/bookings/${booking._id}`}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 🔥 ENHANCED SIDEBAR - MOBILE OPTIMIZED */}
          <div className="space-y-4 sm:space-y-6">
            {/* Upcoming Meetings - REAL DATA */}
            <Card className="p-0 border-0 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl overflow-hidden">
              <div className="p-3 sm:p-4 md:p-5 lg:p-6 bg-blue-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">Upcoming Meetings</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Your scheduled consultations</p>
                  </div>
                  <Link to="/dashboard/bookings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto bg-white/80 hover:bg-white border border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
                      style={{ borderRadius: '20px' }}
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-4 sm:py-6">
                    <Loader size="sm" />
                  </div>
                ) : upcomingMeetings.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 bg-white rounded-xl md:rounded-2xl border-2 border-dashed border-blue-300">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">📅</div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-4">No upcoming meetings</p>
                    <Link to="/templates">
                      <Button
                        size="sm"
                        className="w-full text-white hover:opacity-90 transition-opacity text-xs sm:text-sm py-2 px-4"
                        style={{
                          borderRadius: '20px',
                          backgroundColor: '#6498fe'
                        }}
                      >
                        Book Website
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting._id} className="p-2.5 sm:p-3 md:p-4 bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-md border border-blue-200">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2 truncate">
                          {meeting.templateName}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 sm:mb-3 space-y-0.5 sm:space-y-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            📅 <span>{formatDate(meeting.meetingDetails.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            🕐 <span>{meeting.meetingDetails.scheduledTime}</span>
                          </div>
                        </div>
                        {meeting.meetingDetails.meetingLink && (
                          <Button
                            size="sm"
                            className="w-full text-white font-semibold hover:opacity-90 transition-opacity text-xs sm:text-sm py-1.5 sm:py-2"
                            onClick={() => window.open(meeting.meetingDetails.meetingLink, '_blank')}
                            style={{
                              borderRadius: '15px',
                              backgroundColor: '#6498fe'
                            }}
                          >
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="p-4 sm:p-5 md:p-6 lg:p-8 border-0 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-lg md:shadow-xl lg:shadow-2xl bg-white mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Quick Actions</h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Everything you need, just one click away</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {quickActions.map(({ title, description, icon, link, color, gradient, hoverGradient }) => (
              <Link key={title} to={link} target={link.startsWith('http') ? '_blank' : '_self'}>
                <div className={`group p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-200 bg-gradient-to-br ${gradient} hover:bg-gradient-to-br hover:${hoverGradient} transition-all duration-500 cursor-pointer hover:shadow-lg md:hover:shadow-xl lg:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
