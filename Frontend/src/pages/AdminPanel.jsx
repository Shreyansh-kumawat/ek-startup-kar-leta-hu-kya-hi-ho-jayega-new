import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useApi } from '../hooks/useApi';
import { getDashboard } from '../features/admin/api';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/helpers';
import WebsiteBookingsManager from '../features/admin/WebsiteBookingsManager';
import UserManager from '../features/admin/UserManager';

const AdminPanel = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  const { data: dashboardStats, loading: statsLoading } = useApi(
    getDashboard,
    [],
    { immediate: activeTab === 'dashboard' }
  );
  
  const isMainAdmin = user?.role === 'admin' || user?.role === 'mainAdmin';
  const isAnyAdmin = user?.role === 'admin' || user?.role === 'secondaryAdmin' || user?.role === 'mainAdmin';
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="xl" />
      </div>
    );
  }
  
  if (!isAuthenticated || !isAnyAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }
  
  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'website-bookings', label: 'Website Bookings (B2B)', icon: '🌐' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];
  
  const renderDashboard = () => (
    <div className="space-y-8">
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="xl" />
        </div>
      ) : (
        <>
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
                <div className="text-gray-600">Total Bookings</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl text-yellow-600 font-bold">
                  {dashboardStats?.stats?.pendingMeetings || 0}
                </div>
                <div className="text-gray-600">Pending</div>
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
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Users</h2>
              {dashboardStats?.stats?.recentUsers?.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent users</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats?.stats?.recentUsers?.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{u.name || u.username}</div>
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(u.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Bookings</h2>
              {dashboardStats?.stats?.recentOrders?.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent bookings</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats?.stats?.recentOrders?.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.userId?.name || order.userId?.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(order.amount)}</div>
                        <div className="text-sm text-gray-600">{order.status}</div>
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
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManager />;
      case 'website-bookings':
        return <WebsiteBookingsManager />;
      case 'dashboard':
        return renderDashboard();
      default:
        return <UserManager />;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌐 Admin Panel - 3Digree</h1>
          <p className="text-gray-600 mt-2">Manage users, bookings and credits</p>
          <div className="text-xs text-gray-500 mt-2">
            Welcome, {user?.name || user?.username} ({user?.role})
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
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
      
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AdminPanel;
