import React, { useState, useEffect } from 'react';
import { getUserMeetings } from './api';
import Loader from '../../components/Loader';
import { useNotification } from '../../hooks/useNotification';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await getUserMeetings();
      const meetingsData = response?.data || response || [];
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
    } catch (error) {
      addNotification('Failed to load meetings', 'error');
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="w-4 h-4 text-blue-500">✅</span>;
      case 'requested':
        return <span className="w-4 h-4 text-yellow-500">⚠️</span>;
      case 'completed':
        return <span className="w-4 h-4 text-blue-500">✅</span>;
      case 'cancelled':
        return <span className="w-4 h-4 text-red-500">❌</span>;
      default:
        return <span className="w-4 h-4 text-gray-500">⏰</span>;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'scheduled':
        return { bg: 'bg-blue-500', text: 'text-blue-800', bgLight: 'bg-blue-50', border: 'border-blue-200', icon: '✅' };
      case 'requested':
        return { bg: 'bg-yellow-500', text: 'text-yellow-800', bgLight: 'bg-yellow-50', border: 'border-yellow-200', icon: '⏳' };
      case 'completed':
        return { bg: 'bg-blue-500', text: 'text-blue-800', bgLight: 'bg-blue-50', border: 'border-blue-200', icon: '🎯' };
      case 'cancelled':
        return { bg: 'bg-red-500', text: 'text-red-800', bgLight: 'bg-red-50', border: 'border-red-200', icon: '❌' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-800', bgLight: 'bg-gray-50', border: 'border-gray-200', icon: '📋' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const isUpcoming = (meeting) => {
    if (!meeting.scheduledDate) return false;
    const meetingDate = new Date(meeting.scheduledDate);
    const now = new Date();
    return meetingDate > now && meeting.status === 'scheduled';
  };

  const filteredMeetings = React.useMemo(() => {
    if (!Array.isArray(meetings)) return [];
    
    return meetings.filter(meeting => {
      const matchesFilter = filter === 'all' || 
        (filter === 'upcoming' ? isUpcoming(meeting) : meeting.status === filter);
      
      const matchesSearch = searchTerm === '' || 
        meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.templateId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [meetings, filter, searchTerm]);

  const sortedMeetings = filteredMeetings.sort((a, b) => {
    const dateA = new Date(a.scheduledDate || a.requestedAt);
    const dateB = new Date(b.scheduledDate || b.requestedAt);
    
    if (isUpcoming(a) && !isUpcoming(b)) return -1;
    if (!isUpcoming(a) && isUpcoming(b)) return 1;
    
    return dateB - dateA;
  });

  const meetingStats = React.useMemo(() => {
    if (!Array.isArray(meetings)) {
      return {
        total: 0,
        scheduled: 0,
        completed: 0,
        requested: 0,
        upcoming: 0
      };
    }

    return {
      total: meetings.length,
      scheduled: meetings.filter(m => m.status === 'scheduled').length,
      completed: meetings.filter(m => m.status === 'completed').length,
      requested: meetings.filter(m => m.status === 'requested').length,
      upcoming: meetings.filter(m => isUpcoming(m)).length
    };
  }, [meetings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-lg">Loading your meetings...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Enhanced Header Section - Changed to classic blue */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                    My Meetings 📅
                  </h1>
                  <p className="text-white/90 text-xl">
                    Manage your consultation meetings and appointments
                  </p>
                </div>
                
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="text-white font-bold text-2xl">{meetingStats.total}</div>
                    <div className="text-white/80 text-sm">Total Meetings</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="text-white font-bold text-2xl">{meetingStats.upcoming}</div>
                    <div className="text-white/80 text-sm">Upcoming</div>
                  </div>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">🔍</span>
                  <input
                    type="text"
                    placeholder="Search meetings by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/60 focus:border-white/40 focus:ring-0 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">🔽</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-12 pr-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white focus:border-white/40 focus:ring-0 appearance-none cursor-pointer transition-all"
                  >
                    <option value="all" className="text-gray-900 bg-white">All Meetings ({meetingStats.total})</option>
                    <option value="upcoming" className="text-gray-900 bg-white">Upcoming ({meetingStats.upcoming})</option>
                    <option value="requested" className="text-gray-900 bg-white">Requested ({meetingStats.requested})</option>
                    <option value="scheduled" className="text-gray-900 bg-white">Scheduled ({meetingStats.scheduled})</option>
                    <option value="completed" className="text-gray-900 bg-white">Completed ({meetingStats.completed})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Updated colors */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Meetings', value: meetingStats.total, icon: '📅', color: 'blue' },
            { label: 'Upcoming', value: meetingStats.upcoming, icon: '🔔', color: 'blue' },
            { label: 'Scheduled', value: meetingStats.scheduled, icon: '✅', color: 'yellow' },
            { label: 'Completed', value: meetingStats.completed, icon: '🎯', color: 'purple' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Meetings List */}
        {sortedMeetings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-0">
            <div className="text-8xl mb-6">📅</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'No meetings found' : `No ${filter} meetings`}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {filter === 'all' 
                ? "You haven't scheduled any meetings yet. Book a consultation with our experts!" 
                : `No meetings found with ${filter} status. Try changing your filter.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg" 
                style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
                <span>📅</span>
                Schedule Meeting
              </button>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300"
                >
                  Show All Meetings
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMeetings.map((meeting, index) => {
              const statusConfig = getStatusConfig(meeting.status);
              const upcoming = isUpcoming(meeting);
              
              return (
                <div 
                  key={meeting._id} 
                  className={`group bg-white rounded-3xl shadow-xl hover:shadow-2xl border-0 overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                    upcoming ? 'ring-2 bg-gradient-to-r from-blue-50 to-blue-100' : ''
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    ...(upcoming && { ringColor: '#6498fe' })
                  }}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${
                            upcoming ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`} style={upcoming ? { background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' } : {}}>
                            {statusConfig.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {meeting.title || 'Consultation Meeting'}
                              </h3>
                              {upcoming && (
                                <div className="flex items-center gap-1 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse"
                                  style={{ backgroundColor: '#6498fe' }}>
                                  <span className="text-xs">🔔</span>
                                  Upcoming
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgLight} ${statusConfig.border} border`}>
                                {getStatusIcon(meeting.status)}
                                <span className={`text-sm font-medium ${statusConfig.text}`}>
                                  {meeting.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {meeting.description && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                            <p className="text-gray-700 leading-relaxed">
                              {meeting.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <span className="text-blue-600">📅</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Meeting Date</div>
                              <div className="font-semibold text-gray-900">
                                {formatDate(meeting.scheduledDate || meeting.requestedAt)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="text-purple-600">⏰</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Time</div>
                              <div className="font-semibold text-gray-900">
                                {formatTime(meeting.scheduledTime) || 'Time TBD'}
                              </div>
                            </div>
                          </div>

                          {meeting.templateId && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <span className="text-blue-600">👔</span>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600">Template</div>
                                <div className="font-semibold text-gray-900 truncate">
                                  {meeting.templateId.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Meeting Link */}
                        {meeting.meetingLink && meeting.status === 'scheduled' && (
                          <div className="border rounded-2xl p-6 mb-6" style={{ 
                            background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)', 
                            borderColor: '#6498fe' 
                          }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6498fe' }}>
                                  <span className="text-white">📹</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-blue-900">Ready to Join</h4>
                                  <p className="text-sm text-blue-700">Click to join your meeting</p>
                                </div>
                              </div>
                              <a
                                href={meeting.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:opacity-90"
                                style={{ backgroundColor: '#6498fe' }}
                              >
                                <span>▶️</span>
                                Join Meeting
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Meeting Info for requested meetings */}
                        {meeting.status === 'requested' && (
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                                <span className="text-white">⚠️</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-yellow-900 mb-1">Meeting Request Pending</h4>
                                <p className="text-yellow-800 text-sm leading-relaxed">
                                  Your meeting request is under review. Our team will contact you soon with confirmation details and meeting link.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 ml-6">
                        <div className={`px-4 py-2 rounded-2xl font-bold text-center ${statusConfig.bgLight} ${statusConfig.text} ${statusConfig.border} border`}>
                          {statusConfig.icon} {meeting.status}
                        </div>
                        
                        {upcoming && (
                          <button className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-2xl transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: '#6498fe' }}>
                            <span>🔔</span>
                            Remind Me
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-3xl shadow-2xl p-8 border-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button className="flex items-center gap-4 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg group" 
              style={{ background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)' }}
              onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #c7e2ff 0%, #b0d5ff 100%)'}
              onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)'}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                style={{ backgroundColor: '#6498fe' }}>
                <span>📅</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Schedule New Meeting</h3>
                <p className="text-sm text-gray-600">Book consultation</p>
              </div>
            </button>
            
            <button className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span>📞</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help with meetings</p>
              </div>
            </button>
            
            <button className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span>📊</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Go back to dashboard</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingList;