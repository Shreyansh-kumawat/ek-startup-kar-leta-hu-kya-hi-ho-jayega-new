import React, { useEffect, useState } from 'react';
import { getDashboard } from './api';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/helpers';

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}-50`}>
      {icon}
    </div>
    <div>
      <div className={`text-3xl font-extrabold text-${color}-600`}>{value ?? 0}</div>
      <div className="text-gray-500 text-sm mt-0.5">{label}</div>
    </div>
  </div>
);

const statusColors = {
  completed: 'bg-green-100 text-green-700',
  meeting_scheduled: 'bg-blue-100 text-blue-700',
  partial_payment_done: 'bg-yellow-100 text-yellow-700',
  partial_payment_pending: 'bg-orange-100 text-orange-700',
  development_in_progress: 'bg-purple-100 text-purple-700',
  website_ready: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      // getDashboard returns { success, message, data: { ...stats } }
      // api.js already does res.data so we get the axios response body directly
      // Handle both possible shapes
      const payload = res?.data ?? res;
      setStats(payload);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const s = stats || {};

  // Stat cards data
  const statCards = [
    { label: 'Total Users', value: s.totalUsers, color: 'blue', icon: '👥' },
    { label: 'Total Bookings', value: s.totalOrders, color: 'green', icon: '📋' },
    { label: 'Active Projects', value: s.activeProjects, color: 'purple', icon: ' ' },
    { label: 'Completed', value: s.completedProjects, color: 'blue', icon: '✅' },
    { label: 'Pending Meetings', value: s.pendingMeetings, color: 'blue', icon: '📅' },
    { label: 'Total Templates', value: s.totalTemplates, color: 'blue', icon: '🎨' },
    { label: 'This Week Users', value: s.weeklyUsers, color: 'blue', icon: '📈' },
    { label: "Today's Orders", value: s.todayOrders, color: 'orange', icon: '🛒' },
  ];

  // User role breakdown
  const roles = s.userRoles || {};

  // Order status breakdown
  const orderStatuses = s.orderStatuses || {};

  return (
    <div className="space-y-8">

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Revenue + Role Breakdown Row */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Monthly Revenue */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Revenue</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Monthly</span>
              <span className="font-bold text-green-600">₹{(s.monthlyRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="font-bold text-blue-600">₹{(s.totalRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* User Roles */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">User Roles</div>
          <div className="space-y-2">
            {Object.entries(roles).length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : (
              Object.entries(roles).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm capitalize text-gray-600">{role}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Statuses</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Object.entries(orderStatuses).length === 0 ? (
              <p className="text-gray-400 text-sm">No data</p>
            ) : (
              Object.entries(orderStatuses).map(([status, data]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                    {status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{data?.count ?? data}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Users + Recent Orders Row */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {!s.recentUsers || s.recentUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No recent users</p>
            ) : (
              s.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(u.name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{u.name || u.username || '—'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-600' :
                      u.role === 'secondaryAdmin' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>{u.role}</span>
                    <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {!s.recentOrders || s.recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No recent bookings</p>
            ) : (
              s.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {order.userId?.name || order.userId?.username || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {order.templatePrice ? `₹${order.templatePrice.toLocaleString('en-IN')}` : '—'}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Projects */}
      {s.recentProjects && s.recentProjects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Projects</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {s.recentProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm"> </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {project.templateId?.name || 'Custom Project'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {project.userId?.name || project.userId?.username || 'Unknown'}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
