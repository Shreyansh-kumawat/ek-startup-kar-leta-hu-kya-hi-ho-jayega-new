import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from './api';
import Loader from '../../components/Loader';
import { useNotification } from '../../hooks/useNotification';

const OrderList = () => {
  const [orders, setOrders] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      // Ensure we always set an array
      const ordersData = response?.data || response || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      addNotification('Failed to load orders', 'error');
      console.error('Error fetching orders:', error);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-xl text-green-500">✅</span>;
      case 'pending':
        return <span className="text-xl text-yellow-500">⏳</span>;
      case 'processing':
        return <span className="text-xl text-blue-500">🔄</span>;
      case 'cancelled':
        return <span className="text-xl text-red-500">❌</span>;
      default:
        return <span className="text-xl text-gray-500">📋</span>;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-500', text: 'text-green-800', bgLight: 'bg-green-50', icon: '✅' };
      case 'pending':
        return { bg: 'bg-yellow-500', text: 'text-yellow-800', bgLight: 'bg-yellow-50', icon: '⏳' };
      case 'processing':
        return { bg: 'bg-blue-500', text: 'text-blue-800', bgLight: 'bg-blue-50', icon: '🔄' };
      case 'cancelled':
        return { bg: 'bg-red-500', text: 'text-red-800', bgLight: 'bg-red-50', icon: '❌' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-800', bgLight: 'bg-gray-50', icon: '📋' };
    }
  };

  const getPaymentStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return { bg: 'bg-green-500', text: 'text-green-800', bgLight: 'bg-green-50', icon: '💳' };
      case 'unpaid':
        return { bg: 'bg-red-500', text: 'text-red-800', bgLight: 'bg-red-50', icon: '⏰' };
      case 'refunded':
        return { bg: 'bg-gray-500', text: 'text-gray-800', bgLight: 'bg-gray-50', icon: '↩️' };
      default:
        return { bg: 'bg-yellow-500', text: 'text-yellow-800', bgLight: 'bg-yellow-50', icon: '⌛' };
    }
  };

  // Safe filtering with proper array checks
  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(order => {
      const matchesFilter = filter === 'all' || order.status === filter;
      const matchesSearch = searchTerm === '' || 
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.templateId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  // Safe stats calculation
  const orderStats = React.useMemo(() => {
    if (!Array.isArray(orders)) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        processing: 0,
        cancelled: 0,
        totalAmount: 0
      };
    }

    return {
      total: orders.length,
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-lg">Loading your orders...</p>
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
        
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                    My Orders 🛍️
                  </h1>
                  <p className="text-white/90 text-xl">
                    Track and manage all your template purchases
                  </p>
                </div>
                
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="text-white font-bold text-2xl">{orderStats.total}</div>
                    <div className="text-white/80 text-sm">Total Orders</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <div className="text-white font-bold text-2xl">₹{orderStats.totalAmount.toLocaleString()}</div>
                    <div className="text-white/80 text-sm">Total Spent</div>
                  </div>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">🔍</span>
                  <input
                    type="text"
                    placeholder="Search orders by ID or template name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/60 focus:border-white/40 focus:ring-0 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">🔎</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-12 pr-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white focus:border-white/40 focus:ring-0 appearance-none cursor-pointer transition-all"
                  >
                    <option value="all" className="text-gray-900 bg-white">All Orders ({orderStats.total})</option>
                    <option value="pending" className="text-gray-900 bg-white">Pending ({orderStats.pending})</option>
                    <option value="processing" className="text-gray-900 bg-white">Processing ({orderStats.processing})</option>
                    <option value="completed" className="text-gray-900 bg-white">Completed ({orderStats.completed})</option>
                    <option value="cancelled" className="text-gray-900 bg-white">Cancelled ({orderStats.cancelled})</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Orders', value: orderStats.total, icon: '📦', color: 'blue' },
            { label: 'Completed', value: orderStats.completed, icon: '✅', color: 'green' },
            { label: 'Processing', value: orderStats.processing, icon: '🔄', color: 'yellow' },
            { label: 'Pending', value: orderStats.pending, icon: '⏳', color: 'purple' }
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-0">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {filter === 'all' ? 'No orders found' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start by browsing our amazing template collection!" 
                : `No orders found with ${filter} status. Try changing your filter.`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/templates"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🛍️ Browse Templates
              </Link>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300"
                >
                  Show All Orders
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
              
              return (
                <div 
                  key={order._id} 
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl border-0 overflow-hidden transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            {order._id?.slice(-2) || '##'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Order #{order.razorpayOrderId || order._id?.substring(0, 8) || 'N/A'}
                            </h3>
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgLight}`}>
                                {getStatusIcon(order.status)}
                                <span className={`text-sm font-medium ${statusConfig.text}`}>
                                  {order.status || 'Unknown'}
                                </span>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${paymentConfig.bgLight}`}>
                                <span className="text-xl">💳</span>
                                <span className={`text-sm font-medium ${paymentConfig.text}`}>
                                  {order.paymentStatus || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl text-blue-600">📅</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Order Date</div>
                              <div className="font-semibold text-gray-900">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'N/A'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl text-green-600">💰</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Amount</div>
                              <div className="font-bold text-xl text-gray-900">
                                ₹{(order.amount || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl text-purple-600">📄</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Order ID</div>
                              <div className="font-mono text-sm text-gray-900">
                                #{order._id?.substring(0, 8) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template Info */}
                        {order.templateId && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                🎨
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg mb-2">
                                  {order.templateId.name || 'Template'}
                                </h4>
                                {order.templateId.description && (
                                  <p className="text-gray-600 leading-relaxed line-clamp-2">
                                    {order.templateId.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 ml-6">
                        <Link
                          to={`/dashboard/orders/${order._id}`}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <span className="text-xl">👀</span>
                          View Details
                        </Link>
                        
                        {order.paymentStatus === 'paid' && (
                          <button className="flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-2xl transition-all duration-300">
                            <span className="text-xl">📥</span>
                            Download
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
            <Link
              to="/templates"
              className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all duration-300 hover:shadow-lg group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span className="text-xl">🛍️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Browse Templates</h3>
                <p className="text-sm text-gray-600">Find more templates</p>
              </div>
            </Link>
            
            <Link
              to="/dashboard"
              className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl transition-all duration-300 hover:shadow-lg group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Dashboard</h3>
                <p className="text-sm text-gray-600">Go back to dashboard</p>
              </div>
            </Link>
            
            <button className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl transition-all duration-300 hover:shadow-lg group">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Contact Support</h3>
                <p className="text-sm text-gray-600">Need help with orders?</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;