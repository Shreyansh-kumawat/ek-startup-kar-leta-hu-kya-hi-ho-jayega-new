import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useApi } from '../hooks/useApi';
import { getDashboard } from '../features/admin/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
// 🔥 Import AdminTemplateBookingManager
import AdminTemplateBookingManager from '../features/admin/AdminTemplateBookingManager';
// 🔥 NEW: Import TutorialAnalytics
import TutorialAnalytics from '../features/admin/TutorialAnalytics';


const AdminPanel = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  
  // DEBUG: Console logs to check user data
  // console.log('🔍 AdminPanel - Full user object:', user);
  // console.log('🔍 AdminPanel - User role:', user?.role);
  // console.log('🔍 AdminPanel - isAuthenticated:', isAuthenticated);
  // console.log('🔍 AdminPanel - authLoading:', authLoading);
  
  const { data: dashboardStats, loading: statsLoading } = useApi(
    getDashboard,
    [],
    { immediate: activeTab === 'dashboard' }
  );
  
  // ENHANCED: Better role checking with multiple conditions
  const isMainAdmin = user?.role === 'admin' || user?.role === 'mainAdmin';
  const isAnyAdmin = user?.role === 'admin' || user?.role === 'secondaryAdmin' || user?.role === 'mainAdmin';
  
  // console.log('🔍 AdminPanel - isMainAdmin result:', isMainAdmin);
  // console.log('🔍 AdminPanel - isAnyAdmin result:', isAnyAdmin);
  
  // Loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="xl" />
      </div>
    );
  }
  
  // Not authenticated or not admin
  if (!isAuthenticated || !isAnyAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }
  
  // 🔥 UPDATED: Added Tutorial Analytics Tab
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'templates', label: 'Templates', icon: '🎨' },
    { id: 'bookings', label: 'Template Bookings', icon: '📋' },
    { id: 'tutorials', label: 'Tutorial Analytics', icon: '🎬' }, // 🔥 NEW
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'meetings', label: 'Meetings', icon: '📅' },
    { id: 'projects', label: 'Projects', icon: '🚀' }
  ];
  
  // Handle add secondary admin
  const handleAddSecondaryAdmin = () => {
    setShowAddAdminModal(true);
    // console.log('🔍 Opening Add Secondary Admin modal');
  };
  
  const renderDashboard = () => (
    <div className="space-y-8">
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="xl" />
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl text-blue-600 font-bold">
                  {dashboardStats?.stats?.totalUsers || 0}
                </div>
                <div className="text-gray-600">Total Users</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl text-green-600 font-bold">
                  {dashboardStats?.stats?.totalOrders || 0}
                </div>
                <div className="text-gray-600">Total Orders</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl text-yellow-600 font-bold">
                  {dashboardStats?.stats?.pendingMeetings || 0}
                </div>
                <div className="text-gray-600">Pending Meetings</div>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl text-purple-600 font-bold">
                  {dashboardStats?.stats?.activeProjects || 0}
                </div>
                <div className="text-gray-600">Active Projects</div>
              </div>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Users
              </h2>
              
              {dashboardStats?.stats?.recentUsers?.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent users</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats?.stats?.recentUsers?.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Orders
              </h2>
              
              {dashboardStats?.stats?.recentOrders?.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats?.stats?.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.userId?.name || order.userId?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
  
  // 🔥 UPDATED: Added Tutorial Analytics Tab Rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600 mb-6">
              Manage users, roles, and permissions. View user analytics and activity.
            </p>
            <Button variant="outline">Coming Soon</Button>
          </Card>
        );
      case 'templates':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Template Management</h3>
            <p className="text-gray-600 mb-6">
              Add, edit, and manage website templates. Set pricing and availability.
            </p>
            <Button variant="outline">Coming Soon</Button>
          </Card>
        );
      // Template Bookings Management
      case 'bookings':
        return <AdminTemplateBookingManager />;
      // 🔥 NEW: Tutorial Analytics
      case 'tutorials':
        return <TutorialAnalytics />;
      case 'orders':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Management</h3>
            <p className="text-gray-600 mb-6">
              View and manage all orders. Track payments and order status.
            </p>
            <Button variant="outline">Coming Soon</Button>
          </Card>
        );
      case 'meetings':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Meeting Management</h3>
            <p className="text-gray-600 mb-6">
              Schedule and manage consultation meetings with clients.
            </p>
            <Button variant="outline">Coming Soon</Button>
          </Card>
        );
      case 'projects':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Management</h3>
            <p className="text-gray-600 mb-6">
              Track project progress and manage deliverables.
            </p>
            <Button variant="outline">Coming Soon</Button>
          </Card>
        );
      default:
        return renderDashboard();
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">
            Manage your platform and monitor system performance
          </p>
          
          {/* Show current user info */}
          <div className="text-xs text-gray-500 mt-2">
            Welcome, {user?.name || user?.username} ({user?.role})
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="flex items-center gap-4">
          {/* Main admin button - with multiple conditions */}
          {(isMainAdmin || user?.role === 'admin') && (
            <Button 
              onClick={handleAddSecondaryAdmin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">👤</span>
              Add Secondary Admin
            </Button>
          )}
          
          {/* Fallback - show role info if not main admin */}
          {!isMainAdmin && user && (
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
              Role: {user.role}
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
      
      {/* Add Secondary Admin Modal */}
      {showAddAdminModal && (
        <Modal 
          isOpen={showAddAdminModal} 
          onClose={() => setShowAddAdminModal(false)}
          title="Add Secondary Admin"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Secondary admin functionality will be implemented soon.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddAdminModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowAddAdminModal(false)}>
                OK
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


export default AdminPanel;
