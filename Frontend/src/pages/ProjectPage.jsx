import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getProjectDetails } from '../features/project/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatDate, getStatusColor } from '../utils/helpers';

const ProjectPage = () => {
  const { id } = useParams();

  const { data: project, loading, error } = useApi(
    () => getProjectDetails(id),
    [id],
    { immediate: true }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-lg">Loading project details...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' }}>
        <Card className="p-12 text-center max-w-lg shadow-2xl bg-white rounded-3xl border-0">
          <div className="text-8xl mb-6">😔</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/dashboard">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              style={{ borderRadius: '25px' }}
            >
              <span className="mr-2">🏠</span>
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      initiated: {
        emoji: '🚀',
        text: 'Project Started',
        color: 'blue',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      in_progress: {
        emoji: '⚙️',
        text: 'In Development',
        color: 'purple',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-800',
        bgLight: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      review: {
        emoji: '👀',
        text: 'Under Review',
        color: 'orange',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-800',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      completed: {
        emoji: '✅',
        text: 'Completed',
        color: 'blue',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-800',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    };
    return configs[status] || {
      emoji: '📋',
      text: status,
      color: 'gray',
      bgColor: 'bg-gray-500',
      textColor: 'text-gray-800',
      bgLight: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const getProgressPercentage = (currentStatus) => {
    const statusOrder = ['initiated', 'in_progress', 'review', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const statusConfig = getStatusConfig(project.status);
  const progressPercentage = getProgressPercentage(project.status);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Header - Changed to classic blue */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                    Project Details 🚀
                  </h1>
                  <p className="text-white/90 text-xl">
                    Track your project progress and updates
                  </p>
                </div>
                
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="text-white font-bold text-2xl">{Math.round(progressPercentage)}%</div>
                    <div className="text-white/80 text-sm">Complete</div>
                  </div>
                  <div className={`text-center backdrop-blur-md rounded-2xl p-4 ${statusConfig.bgLight} border ${statusConfig.borderColor}`}>
                    <span className={`text-2xl ${statusConfig.textColor} block mb-1`}>{statusConfig.emoji}</span>
                    <div className={`${statusConfig.textColor} text-sm font-bold`}>{statusConfig.text}</div>
                  </div>
                </div>
              </div>
              
              <Link to="/dashboard">
                <Button 
                  className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 font-semibold"
                  style={{ borderRadius: '25px' }}
                >
                  <span className="mr-2">⬅️</span>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Enhanced Status Card */}
            <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-blue-500">📊</span>
                    Project Status
                  </h2>
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl font-bold ${statusConfig.bgLight} ${statusConfig.textColor} ${statusConfig.borderColor} border-2`}>
                    <span>{statusConfig.text}</span>
                    <span className="text-2xl">{statusConfig.emoji}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                    <span>Overall Progress</span>
                    <span className="text-blue-600">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Enhanced Progress Steps */}
                <div className="space-y-6">
                  {[
                    { 
                      key: 'initiated', 
                      label: 'Project Initiated', 
                      description: 'Your project has been created and assigned to our development team',
                      emoji: '🚀',
                      color: 'blue'
                    },
                    { 
                      key: 'in_progress', 
                      label: 'Development Phase', 
                      description: 'Our expert team is actively working on building your website',
                      emoji: '💻',
                      color: 'purple'
                    },
                    { 
                      key: 'review', 
                      label: 'Review & Testing', 
                      description: 'Comprehensive quality assurance and final performance checks',
                      emoji: '👁️',
                      color: 'orange'
                    },
                    { 
                      key: 'completed', 
                      label: 'Project Completed', 
                      description: 'Your website is fully developed, tested, and ready to go live',
                      emoji: '✅',
                      color: 'blue'
                    }
                  ].map((step, index) => {
                    const statusOrder = ['initiated', 'in_progress', 'review', 'completed'];
                    const currentIndex = statusOrder.indexOf(project.status);
                    const isCompleted = currentIndex >= index;
                    const isCurrent = currentIndex === index;

                    return (
                      <div key={step.key} className="flex items-start gap-6">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          isCompleted
                            ? `${step.color === 'blue' ? 'bg-blue-500' : step.color === 'purple' ? 'bg-purple-500' : step.color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'} text-white`
                            : isCurrent
                              ? `${step.color === 'blue' ? 'bg-blue-100 text-blue-600' : step.color === 'purple' ? 'bg-purple-100 text-purple-600' : step.color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} animate-pulse`
                              : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? <span className="text-lg">✓</span> : <span className="text-lg">{step.emoji}</span>}
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg">
                          <h3 className={`font-bold text-lg mb-2 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </h3>
                          <p className={`leading-relaxed ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Enhanced Links Section - Changed to classic blue */}
            <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100" style={{ background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span style={{ color: '#6498fe' }}>🌐</span>
                  Project Links
                </h2>

                <div className="space-y-6">
                  {project.previewLink && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xl">👁️</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-900 text-lg">Preview Link</h3>
                            <p className="text-blue-700">Watermarked preview of your website in development</p>
                          </div>
                        </div>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                          onClick={() => window.open(project.previewLink, '_blank')}
                          style={{ borderRadius: '20px' }}
                        >
                          <span className="mr-2">🔗</span>
                          View Preview
                        </Button>
                      </div>
                    </div>
                  )}

                  {project.liveLink && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 rounded-2xl p-6" style={{ borderColor: '#6498fe', background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#6498fe' }}>
                            <span className="text-white text-xl">🚀</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-900 text-lg">Live Website</h3>
                            <p className="text-blue-700">Your final website is now live and accessible to everyone</p>
                          </div>
                        </div>
                        <Button
                          className="text-white font-semibold hover:opacity-90"
                          onClick={() => window.open(project.liveLink, '_blank')}
                          style={{ borderRadius: '20px', backgroundColor: '#6498fe' }}
                        >
                          <span className="mr-2">🌐</span>
                          Visit Site
                        </Button>
                      </div>
                    </div>
                  )}

                  {!project.previewLink && !project.liveLink && (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="text-6xl mb-4">🔗</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Links Coming Soon</h3>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                        Preview and live links will appear here as your project progresses through development
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Enhanced Notifications */}
            {project.notifications && project.notifications.length > 0 && (
              <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="text-purple-500">🔔</span>
                    Recent Updates
                  </h2>

                  <div className="space-y-4">
                    {project.notifications.slice(0, 5).map((notification, index) => (
                      <div
                        key={index}
                        className={`bg-white rounded-2xl p-6 border-l-4 shadow-lg ${
                          notification.type === 'success'
                            ? 'border-blue-400'
                            : notification.type === 'warning'
                              ? 'border-yellow-400'
                              : notification.type === 'error'
                                ? 'border-red-400'
                                : 'border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              notification.type === 'success'
                                ? 'bg-blue-100 text-blue-600'
                                : notification.type === 'warning'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : notification.type === 'error'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? '✅' : 
                               notification.type === 'warning' ? '⚠️' : 
                               notification.type === 'error' ? '❌' : 'ℹ️'}
                            </div>
                            <p className="text-gray-700 leading-relaxed flex-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            
            {/* Project Info */}
            <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-blue-500">ℹ️</span>
                  Project Information
                </h3>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4">
                    <label className="text-sm font-medium text-gray-600">Project ID</label>
                    <p className="text-gray-900 font-mono font-bold">
                      #{project?._id ? project._id.slice(-8) : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <label className="text-sm font-medium text-gray-600">Started Date</label>
                    <p className="text-gray-900 font-semibold">{formatDate(project.createdAt)}</p>
                  </div>

                  {project.monthlyPayment && (
                    <div className="bg-white rounded-2xl p-4">
                      <label className="text-sm font-medium text-gray-600">Payment Plan</label>
                      <p className="text-gray-900 font-semibold">💳 Monthly Subscription</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-purple-500">🛠️</span>
                  Quick Actions
                </h3>

                <div className="space-y-4">
                  <Link to="/meetings" className="block">
                    <Button 
                      className="w-full bg-blue-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                      style={{ borderRadius: '20px' }}
                    >
                      <span className="mr-2">📅</span>
                      Schedule Meeting
                    </Button>
                  </Link>

                  <Link to="/support" className="block">
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-gray-200 font-semibold py-3"
                      style={{ borderRadius: '20px', borderColor: '#6498fe', color: '#6498fe' }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#6498fe';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6498fe';
                      }}
                    >
                      <span className="mr-2">🆘</span>
                      Contact Support
                    </Button>
                  </Link>

                  <Link to="/dashboard" className="block">
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 font-semibold py-3"
                      style={{ borderRadius: '20px' }}
                    >
                      <span className="mr-2">🏠</span>
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Enhanced Help Section - Changed to classic blue */}
            <Card className="p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6" style={{ background: 'linear-gradient(135deg, #e0f0ff 0%, #c7e2ff 100%)' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span style={{ color: '#6498fe' }}>🆘</span>
                  Need Help?
                </h3>

                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Have questions about your project? Our expert support team is available 24/7 to assist you.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm">📧</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Email Support</div>
                        <div className="text-sm text-gray-600">support@3degree-tbs.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0f0ff', color: '#6498fe' }}>
                        <span className="text-sm">📞</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Phone Support</div>
                        <div className="text-sm text-gray-600">+91 12345 67890</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 text-sm">💬</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Live Chat</div>
                        <div className="text-sm text-gray-600">Available 24/7</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;