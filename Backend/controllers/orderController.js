const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Template = require('../models/Template');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// FIXED: Create a new order (Razorpay) with better error handling
exports.createOrder = async (req, res) => {
  try {
    // console.log('📝 Create order request body:', req.body);
    // console.log('👤 Request user:', req.user);

    // FIXED: Check authentication first
    if (!req.user || !req.user.id) {
      // console.log('❌ Authentication failed - no user');
      return errorResponse(res, 'Authentication required - Please login to continue', null, 401);
    }

    const { templateId, amount, currency = 'INR' } = req.body;

    // Validate input
    if (!templateId) {
      // console.log('❌ Template ID missing');
      return errorResponse(res, 'Template ID is required', null, 400);
    }
    
    if (!amount && amount !== 0) {
      // console.log('❌ Amount missing');
      return errorResponse(res, 'Amount is required', null, 400);
    }

    // console.log('🔍 Finding template:', templateId);

    // Verify template exists and is active
    const template = await Template.findById(templateId);
    if (!template) {
      // console.log('❌ Template not found:', templateId);
      return errorResponse(res, 'Template not found', null, 404);
    }

    // console.log('✅ Template found:', template.name, 'Price:', template.price, 'Active:', template.isActive);

    // FIXED: Handle inactive templates properly
    if (template.isActive === false) {
      // console.log('❌ Template inactive');
      return errorResponse(res, 'Template is not available for purchase', null, 400);
    }

    const templatePrice = parseFloat(template.price || 0);
    const orderAmount = parseFloat(amount);

    // console.log('💰 Price comparison - Template:', templatePrice, 'Order:', orderAmount);

    // FIXED: Handle free templates (price = 0)
    if (templatePrice === 0) {
      // console.log('🆓 Processing free template');
      
      // For free templates, create order without Razorpay
      const freeOrder = new Order({
        userId: req.user.id,
        templateId: templateId,
        razorpayOrderId: `free_${Date.now()}_${req.user.id}`,
        amount: 0,
        currency,
        status: 'completed',
        paymentStatus: 'paid', // Free = considered paid
        orderDate: new Date(),
        paymentDate: new Date()
      });

      const savedOrder = await freeOrder.save();
      // console.log('✅ Free template order saved:', savedOrder._id);
      
      await savedOrder.populate('templateId', 'name description price previewImage');

      return successResponse(res, 'Free template order created successfully', {
        orderId: savedOrder._id,
        razorpayOrderId: savedOrder.razorpayOrderId,
        amount: 0,
        currency: savedOrder.currency,
        status: 'completed',
        template: {
          id: template._id,
          name: template.name,
          price: template.price
        }
      }, 201);
    }

    // For paid templates, verify amount matches
    if (orderAmount !== templatePrice) {
      // console.log('❌ Amount mismatch:', { expected: templatePrice, received: orderAmount });
      return errorResponse(res, `Amount mismatch: Expected ₹${templatePrice}, received ₹${orderAmount}`, null, 400);
    }

    // Check Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing');
      return errorResponse(res, 'Payment gateway configuration error', null, 500);
    }

    // console.log('🚀 Creating Razorpay order...');

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: Math.round(orderAmount * 100), // Razorpay expects amount in paise
      currency,
receipt: `ord_${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substr(2, 4)}`,
       notes: {
        userId: req.user.id,
        templateId: templateId,
        templateName: template.name,
        userEmail: req.user.email || '',
        userName: req.user.name || ''
      }
    };

    // console.log('💳 Razorpay order options:', razorpayOrderOptions);

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
    // console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Save order to database
    const orderData = {
      userId: req.user.id,
      templateId: templateId,
      razorpayOrderId: razorpayOrder.id,
      amount: orderAmount,
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      orderDate: new Date()
    };

    // console.log('💾 Saving order to database:', orderData);

    const order = new Order(orderData);
    const savedOrder = await order.save();
    // console.log('✅ Order saved to database:', savedOrder._id);
    
    // Populate template info
    await savedOrder.populate('templateId', 'name description price previewImage');

    return successResponse(res, 'Order created successfully', {
      orderId: savedOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      template: {
        id: template._id,
        name: template.name,
        price: template.price
      }
    }, 201);

  } catch (error) {
    console.error('❌ Create order error:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      // console.log('❌ Mongoose validation error:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 'Validation failed', { errors: validationErrors }, 400);
    }
    
    if (error.name === 'CastError') {
      // console.log('❌ Invalid ObjectId:', error.path, error.value);
      return errorResponse(res, 'Invalid template ID format', null, 400);
    }
    
    // Handle specific Razorpay errors
    if (error.source === 'razorpay') {
      // console.log('❌ Razorpay error:', error);
      return errorResponse(res, `Payment gateway error: ${error.description}`, null, 500);
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoServerError') {
      // console.log('❌ MongoDB error:', error.message);
      return errorResponse(res, 'Database connection error', null, 500);
    }
    
    return errorResponse(res, 'Server error while creating order', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
};

// Rest of the functions remain the same...
exports.verifyPayment = async (req, res) => {
  try {
    // console.log('🔍 Verify payment request:', req.body);

    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Missing payment verification details', null, 400);
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      return errorResponse(res, 'Invalid payment signature - Payment verification failed', null, 400);
    }

    // Find and update order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return errorResponse(res, 'Order not found for payment verification', null, 404);
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return errorResponse(res, 'Unauthorized - Order does not belong to you', null, 403);
    }

    // Update order status
    order.status = 'completed';
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentDate = new Date();
    order.updatedAt = new Date();
    await order.save();

    // Populate order details
    await order.populate('userId', 'name username email');
    await order.populate('templateId', 'name description price');

    // console.log('✅ Payment verified successfully:', order._id);

    return successResponse(res, 'Payment verified successfully', {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      amount: order.amount,
      template: order.templateId,
      paymentDate: order.paymentDate
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return errorResponse(res, 'Server error during payment verification', error, 500);
  }
};

// Keep all other functions same...
exports.getUserOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    let query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('templateId', 'name description price previewImage')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return successResponse(res, 'User orders fetched successfully', {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Get user orders error:', error);
    return errorResponse(res, 'Server error while fetching user orders', error, 500);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price')
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    
    // Get stats
    const stats = {
      total: await Order.countDocuments(),
      pending: await Order.countDocuments({ status: 'pending' }),
      completed: await Order.countDocuments({ status: 'completed' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' }),
      totalRevenue: await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    };

    return successResponse(res, 'All orders fetched successfully', {
      orders,
      stats: {
        ...stats,
        totalRevenue: stats.totalRevenue[0]?.total || 0
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    return errorResponse(res, 'Server error while fetching all orders', error, 500);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price previewImage templateLink')
      .select('-__v');

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    // Check if user can access this order
    const isOwner = order.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'secondaryAdmin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Access denied - You can only view your own orders', null, 403);
    }

    return successResponse(res, 'Order details fetched successfully', order);
  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    return errorResponse(res, 'Server error while fetching order details', error, 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status. Must be one of: pending, processing, completed, cancelled', null, 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    // Update order
    order.status = status;
    if (notes) order.adminNotes = notes;
    order.updatedAt = new Date();

    // If marking as completed, ensure payment is also marked as paid
    if (status === 'completed' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.paymentDate = order.paymentDate || new Date();
    }

    await order.save();

    // Populate details
    await order.populate('userId', 'name username email');
    await order.populate('templateId', 'name description price');

    return successResponse(res, `Order status updated to ${status}`, {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      updatedAt: order.updatedAt,
      user: order.userId,
      template: order.templateId
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    return errorResponse(res, 'Server error while updating order status', error, 500);
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 'Authentication required', null, 401);
    }

    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    // Check ownership
    if (order.userId.toString() !== req.user.id) {
      return errorResponse(res, 'You can only cancel your own orders', null, 403);
    }

    // Check if order can be cancelled
    if (order.status !== 'pending') {
      return errorResponse(res, 'Only pending orders can be cancelled', null, 400);
    }

    // Update order
    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    order.updatedAt = new Date();

    await order.save();

    return successResponse(res, 'Order cancelled successfully', {
      orderId: order._id,
      status: order.status,
      cancelReason: order.cancelReason,
      cancelledAt: order.cancelledAt
    });
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    return errorResponse(res, 'Server error while cancelling order', error, 500);
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const stats = await Order.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } },
                avgOrderValue: { $avg: '$amount' }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } }
              }
            }
          ],
          recentStats: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: null,
                recentOrders: { $sum: 1 },
                recentRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } }
              }
            }
          ],
          dailyStats: [
            {
              $match: {
                createdAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    return successResponse(res, 'Order statistics fetched successfully', stats[0]);
  } catch (error) {
    console.error('❌ Get order stats error:', error);
    return errorResponse(res, 'Server error while fetching order statistics', error, 500);
  }
};
