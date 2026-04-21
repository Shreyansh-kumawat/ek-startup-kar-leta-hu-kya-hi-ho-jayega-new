import React, { useState, useEffect } from 'react';
import { getAllMeetings, getAllOrders, getDashboard, scheduleMeeting, updateMeetingStatus, updateOrderStatus } from './api';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
// ✅ NEW: Import WebsiteBookingsManager
import WebsiteBookingsManager from './WebsiteBookingsManager';


const SecondaryAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [meetings, setMeetings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: ''
  });
  const { addNotification } = useNotification();


  useEffect(() => {
    fetchData();
  }, [activeTab]);


  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'dashboard') {
        const response = await getDashboard();
        setStats(response.data || {});
      } else if (activeTab === 'meetings') {
        const response = await getAllMeetings();
        setMeetings(response.data || []);
      } else if (activeTab === 'orders') {
        const response = await getAllOrders();
        setOrders(response.data || []);
      }
    } catch (error) {
      addNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleScheduleMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setScheduleData({
      scheduledDate: '',
      scheduledTime: '',
      meetingLink: ''
    });
    setShowScheduleModal(true);
  };


  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await scheduleMeeting(selectedMeeting._id, scheduleData);
      addNotification('Meeting scheduled successfully', 'success');
      setShowScheduleModal(false);
      fetchData();
    } catch (error) {
      addNotification('Failed to schedule meeting', 'error');
    }
  };


  const handleMeetingStatusUpdate = async (meetingId, status) => {
    try {
      await updateMeetingStatus(meetingId, status);
      addNotification(`Meeting ${status} successfully`, 'success');
      fetchData();
    } catch (error) {
      addNotification('Failed to update meeting status', 'error');
    }
  };


  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      addNotification(`Order status updated to ${status}`, 'success');
      fetchData();
    } catch (error) {
      addNotification('Failed to update order status', 'error');
    }
  };


  const getStatusBadge = (status, type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (type === 'meeting') {
      switch (status) {
        case 'scheduled':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'requested':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'completed':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'cancelled':
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'processing':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'cancelled':
          return `${baseClasses} bg-red-100 text-red-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };


  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.totalUsers || 0}</h3>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.totalOrders || 0}</h3>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.pendingMeetings || 0}</h3>
              <p className="text-sm text-gray-600">Pending Meetings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.activeProjects || 0}</h3>
              <p className="text-sm text-gray-600">Active Projects</p>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            {stats.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(user.name || user.username || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent users</p>
            )}
          </div>
        </div>


        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        ₹
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.userId?.name || order.userId?.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">₹{order.amount}</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(order.status, 'order')}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  const renderMeetings = () => (
    <div className="space-y-4">
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-gray-500">No meetings found</p>
        </div>
      ) : (
        meetings.map((meeting) => (
          <div key={meeting._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {meeting.title}
                </h3>
                
                {meeting.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {meeting.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm text-gray-600">
                      {meeting.userId?.name || 'User'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📅</span>
                    <span className="text-sm text-gray-600">
                      {meeting.scheduledDate 
                        ? new Date(meeting.scheduledDate).toLocaleDateString()
                        : new Date(meeting.requestedAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏰</span>
                    <span className="text-sm text-gray-600">
                      {meeting.scheduledTime || 'Time TBD'}
                    </span>
                  </div>
                  
                  {meeting.meetingLink && (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📹</span>
                      <a 
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Join
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={getStatusBadge(meeting.status, 'meeting')}>
                  {meeting.status}
                </span>
                
                {meeting.status === 'requested' && (
                  <Button
                    onClick={() => handleScheduleMeeting(meeting)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <span className="mr-1">✏️</span>
                    Schedule
                  </Button>
                )}
                
                {meeting.status === 'scheduled' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleMeetingStatusUpdate(meeting._id, 'completed')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <span className="mr-1">✅</span>
                      Complete
                    </Button>
                    <Button
                      onClick={() => handleMeetingStatusUpdate(meeting._id, 'cancelled')}
                      size="sm"
                      variant="secondary"
                    >
                      <span className="mr-1">❌</span>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );


  const renderOrders = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{order.razorpayOrderId || order._id.substring(0, 8)}
                  </div>
                  {order.templateId && (
                    <div className="text-sm text-gray-500">
                      {order.templateId.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.userId?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.userId?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₹{order.amount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(order.status, 'order')}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === 'pending' && (
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => handleOrderStatusUpdate(order._id, 'processing')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                          Start
                      </Button>
                      <Button
                        onClick={() => handleOrderStatusUpdate(order._id, 'cancelled')}
                        size="sm"
                        variant="secondary"
                      >
                        ❌ Cancel
                      </Button>
                    </div>
                  )}
                  
                  {order.status === 'processing' && (
                    <Button
                      onClick={() => handleOrderStatusUpdate(order._id, 'completed')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✅ Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


  if (loading && activeTab !== 'website-bookings') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { key: 'dashboard', label: 'Dashboard', emoji: '📊' },
            { key: 'website-bookings', label: 'Website Bookings (B2B)', emoji: '🌐' }, // ✅ NEW
            { key: 'meetings', label: 'Meetings', emoji: '📅' },
            { key: 'orders', label: 'Orders', emoji: '💰' }
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{emoji}</span>
              {label}
            </button>
          ))}
        </nav>
      </div>


      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'website-bookings' && <WebsiteBookingsManager />} {/* ✅ NEW */}
      {activeTab === 'meetings' && renderMeetings()}
      {activeTab === 'orders' && renderOrders()}


      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Meeting"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date
            </label>
            <input
              type="date"
              value={scheduleData.scheduledDate}
              onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Time
            </label>
            <input
              type="time"
              value={scheduleData.scheduledTime}
              onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              value={scheduleData.meetingLink}
              onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://meet.google.com/..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


export default SecondaryAdminPanel;
