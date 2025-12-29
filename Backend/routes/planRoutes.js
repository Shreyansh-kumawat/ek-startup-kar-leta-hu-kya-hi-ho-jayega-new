const express = require('express');
const {
  createPlanOrder,
  verifyPlanPayment,
  getMyPlans,
  getAllPlanPurchases
} = require('../controllers/planController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ USER ROUTES (Protected)
router.post('/create-order', verifyToken, createPlanOrder);
router.post('/verify-payment', verifyToken, verifyPlanPayment);
router.get('/my-plans', verifyToken, getMyPlans);

// ✅ ADMIN ROUTES (Protected + Admin only)
router.get('/all-purchases', verifyToken, isAdmin, getAllPlanPurchases);

module.exports = router;
