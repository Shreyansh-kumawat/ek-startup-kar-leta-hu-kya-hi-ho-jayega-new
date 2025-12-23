const express = require('express');
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');

// FIXED: Use your existing middleware names
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validationMiddleware');

const router = express.Router();


// FIXED: Protected user routes - using your existing middleware
router.post('/create', verifyToken, validateOrder, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/my-orders', verifyToken, getUserOrders);
router.patch('/:id/cancel', verifyToken, cancelOrder);

// FIXED: Protected admin routes - using your existing middleware  
router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/stats', verifyToken, isAdmin, getOrderStats);
router.get('/:id', verifyToken, getOrderById); // User can access their own orders
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

// console.log('✅ Order routes configured successfully');

module.exports = router;
