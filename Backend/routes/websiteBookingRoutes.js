// Backend\routes\websiteBookingRoutes.js
const express = require('express');
const router = express.Router();
const websiteBookingController = require('../controllers/websiteBookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ==================== ADMIN ROUTES (FIRST - PRIORITY) ====================

// GET /api/website-booking/admin/stats
router.get('/admin/stats', verifyToken, isAdmin, websiteBookingController.getAdminStats);

// GET /api/website-booking/admin/all
router.get('/admin/all', verifyToken, isAdmin, websiteBookingController.getAllBookings);

// PATCH /api/website-booking/admin/:bookingId/approve
router.patch('/admin/:bookingId/approve', verifyToken, isAdmin, websiteBookingController.approveBooking);

// PATCH /api/website-booking/admin/:bookingId/complete
router.patch('/admin/:bookingId/complete', verifyToken, isAdmin, websiteBookingController.completeBooking);

// ==================== USER ROUTES (SECOND) ====================

// POST /api/website-booking/purchase
router.post('/purchase', verifyToken, websiteBookingController.purchaseWebsite);

// GET /api/website-booking/my-bookings
router.get('/my-bookings', verifyToken, websiteBookingController.getUserBookings);

// ✅ GET /api/website-booking/dashboard-stats (MUST BE BEFORE /:bookingId)
router.get('/dashboard-stats', verifyToken, websiteBookingController.getDashboardStats);

// ✅ NEW: GET /api/website-booking/user (MUST BE BEFORE /:bookingId)
router.get('/user', verifyToken, websiteBookingController.getUserWebsiteBookings);

// ✅ GET /api/website-booking/:bookingId (MUST BE LAST - DYNAMIC ROUTE)
router.get('/:bookingId', verifyToken, websiteBookingController.getBookingDetails);

module.exports = router;
