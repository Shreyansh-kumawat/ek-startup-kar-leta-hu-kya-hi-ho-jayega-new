import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import Loader from '../components/Loader';
import WebsiteBookingsManager from '../features/admin/WebsiteBookingsManager';
import UserManager from '../features/admin/UserManager';
import AdminDashboard from '../features/admin/AdminDashboard';
import AdminMailManager from '../features/admin/AdminMailManager';

const AdminPanel = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

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
    { id: 'users',            label: 'Users',            icon: '👥' },
    { id: 'website-bookings', label: 'Website Bookings (B2B)', icon: '🌐' },
    { id: 'mail',             label: 'Mail',             icon: '📧' },
    { id: 'dashboard',        label: 'Dashboard',        icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':            return <UserManager />;
      case 'website-bookings': return <WebsiteBookingsManager />;
      case 'mail':             return <AdminMailManager />;
      case 'dashboard':        return <AdminDashboard />;
      default:                 return <UserManager />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🌐 Admin Panel — 3Digree</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Welcome, <span className="font-semibold text-gray-700">{user?.name || user?.username}</span>
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{user?.role}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto scrollable-element">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default AdminPanel;
