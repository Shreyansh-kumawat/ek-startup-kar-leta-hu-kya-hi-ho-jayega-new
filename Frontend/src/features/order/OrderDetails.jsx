import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from './api';
import Loader from '../../components/Loader';
import { useNotification } from '../../hooks/useNotification';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      setOrder(response.data);
    } catch (error) {
      addNotification('Failed to load order details', 'error');
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Order not found</h3>
        <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">⬅️</span>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/orders"
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <span className="text-xl">⬅️</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #{order.razorpayOrderId || order._id.substring(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{order.userId?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xl">📄</span>
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-medium text-xs">{order.razorpayPaymentId || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Details */}
          {order.templateId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h2>
              
              <div className="flex items-start space-x-4">
                {order.templateId.previewImage && (
                  <img loading="lazy" 
                    src={order.templateId.previewImage}
                    alt={order.templateId.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {order.templateId.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {order.templateId.description}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{order.templateId.price?.toLocaleString()}
                    </span>
                    
                    {order.templateId.templateLink && (
                      <a
                        href={order.templateId.templateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <span className="mr-1">🔗</span>
                        Preview Template
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {order.paymentStatus === 'paid' && (
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                    <p className="text-xs text-gray-600">Payment received successfully</p>
                  </div>
                </div>
              )}
              
              {order.status === 'processing' && (
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">In Progress</p>
                    <p className="text-xs text-gray-600">Your project is being processed</p>
                  </div>
                </div>
              )}
              
              {order.status === 'completed' && (
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-xs text-gray-600">Order completed successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Next Steps</h3>
            <p className="text-sm text-blue-700">
              {order.status === 'pending' && order.paymentStatus === 'unpaid' && 
                'Complete your payment to proceed with the order.'
              }
              {order.status === 'pending' && order.paymentStatus === 'paid' && 
                "Your order is confirmed. We'll start working on your project soon."
              }
              {order.status === 'processing' && 
                "Your project is in progress. You'll be notified once it's ready."
              }
              {order.status === 'completed' && 
                'Your order is complete! Check your project dashboard for the final delivery.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;