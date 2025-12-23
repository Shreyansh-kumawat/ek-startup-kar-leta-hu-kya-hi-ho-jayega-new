const express = require('express');
const router = express.Router();
const templateBookingController = require('../controllers/templateBookingController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { validateTemplateBooking, validatePaymentPercentage, validateMeetingStatus, validateDevelopmentProgress } = require('../middleware/validationMiddleware');

// 🔥 PUBLIC ROUTES (No authentication required)

// GET /api/template-booking/available-slots?date=2025-09-21
// Check available meeting slots for a specific date
router.get('/available-slots', templateBookingController.getAvailableMeetingSlots);

// 🔥 USER ROUTES (Authentication required)

// POST /api/template-booking/book/:templateId
// Book a template with meeting scheduling
router.post('/book/:templateId', 
  authenticateToken, 
  validateTemplateBooking,
  templateBookingController.bookTemplate
);

// GET /api/template-booking/my-bookings
// Get current user's template bookings
router.get('/my-bookings', 
  authenticateToken, 
  templateBookingController.getUserBookings
);

// GET /api/template-booking/my-bookings/:bookingId
// Get detailed information about a specific booking
router.get('/my-bookings/:bookingId', 
  authenticateToken, 
  templateBookingController.getBookingDetails
);

// POST /api/template-booking/:bookingId/communication
// Add a communication message to a booking
router.post('/:bookingId/communication',
  authenticateToken,
  templateBookingController.addCommunication
);

// 🔥 ADMIN ROUTES (Admin/Secondary Admin only)

// GET /api/template-booking/admin/all
// Get all template bookings (admin view)
router.get('/admin/all', 
  authenticateToken, 
  requireAdmin,
  templateBookingController.getAllBookings
);

// GET /api/template-booking/admin/:bookingId
// Get detailed booking information (admin view)
router.get('/admin/:bookingId', 
  authenticateToken, 
  requireAdmin,
  templateBookingController.getBookingDetails
);

// PUT /api/template-booking/admin/:bookingId/payment-percentage
// Set payment percentage for a booking
router.put('/admin/:bookingId/payment-percentage',
  authenticateToken,
  requireAdmin,
  validatePaymentPercentage,
  templateBookingController.setPaymentPercentage
);

// PUT /api/template-booking/admin/:bookingId/meeting-status
// Update meeting status (scheduled, completed, cancelled, rescheduled)
router.put('/admin/:bookingId/meeting-status',
  authenticateToken,
  requireAdmin,
  validateMeetingStatus,
  templateBookingController.updateMeetingStatus
);

// PUT /api/template-booking/admin/:bookingId/development-progress
// Update development progress and stage
router.put('/admin/:bookingId/development-progress',
  authenticateToken,
  requireAdmin,
  validateDevelopmentProgress,
  templateBookingController.updateDevelopmentProgress
);

// PUT /api/template-booking/admin/:bookingId/final-website
// Set final website URL and mark as completed
router.put('/admin/:bookingId/final-website',
  authenticateToken,
  requireAdmin,
  templateBookingController.setFinalWebsiteUrl
);

// POST /api/template-booking/admin/:bookingId/communication
// Add admin communication message
router.post('/admin/:bookingId/communication',
  authenticateToken,
  requireAdmin,
  templateBookingController.addCommunication
);

module.exports = router;
