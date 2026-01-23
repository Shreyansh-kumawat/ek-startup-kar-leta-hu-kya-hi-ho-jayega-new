const express = require('express');
const router = express.Router();

const templateBookingController = require('../controllers/templateBookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Basic validation middleware (simplified)
const validateTemplateBooking = (req, res, next) => {
  const { scheduledDate, scheduledTime } = req.body;
  
  if (!scheduledDate || !scheduledTime) {
    return res.status(400).json({
      success: false,
      message: 'Scheduled date and time are required'
    });
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(scheduledDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(scheduledTime)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid time format. Use HH:MM'
    });
  }
  
  next();
};

const validatePaymentPercentage = (req, res, next) => {
  const { paymentPercentage } = req.body;
  
  if (paymentPercentage === undefined || paymentPercentage === null) {
    return res.status(400).json({
      success: false,
      message: 'Payment percentage is required'
    });
  }
  
  if (paymentPercentage < 0 || paymentPercentage > 100) {
    return res.status(400).json({
      success: false,
      message: 'Payment percentage must be between 0 and 100'
    });
  }
  
  next();
};

const validateMeetingStatus = (req, res, next) => {
  const { meetingStatus } = req.body;
  const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
  
  if (!meetingStatus || !validStatuses.includes(meetingStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid meeting status. Must be: scheduled, completed, cancelled, or rescheduled'
    });
  }
  
  next();
};

const validateDevelopmentProgress = (req, res, next) => {
  const { progress, stage } = req.body;
  
  if (progress === undefined || progress === null) {
    return res.status(400).json({
      success: false,
      message: 'Progress is required'
    });
  }
  
  if (progress < 0 || progress > 100) {
    return res.status(400).json({
      success: false,
      message: 'Progress must be between 0 and 100'
    });
  }
  
  const validStages = ['not-started', 'in-progress', 'review', 'completed'];
  if (!stage || !validStages.includes(stage)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid stage. Must be: not-started, in-progress, review, or completed'
    });
  }
  
  next();
};

// ✅ NEW: Website URLs Validation Middleware
const validateWebsiteUrls = (req, res, next) => {
  const { previewUrl, liveUrl, sourceCodeUrl } = req.body;
  
  // At least one URL must be provided
  if (!previewUrl && !liveUrl && !sourceCodeUrl) {
    return res.status(400).json({
      success: false,
      message: 'At least one website URL must be provided'
    });
  }
  
  // URL format validation (basic)
  const urlRegex = /^https?:\/\/.+/;
  
  if (previewUrl && !urlRegex.test(previewUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid preview URL format'
    });
  }
  
  if (liveUrl && !urlRegex.test(liveUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid live URL format'
    });
  }
  
  if (sourceCodeUrl && !urlRegex.test(sourceCodeUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid source code URL format'
    });
  }
  
  next();
};

// PUBLIC ROUTES (No authentication required)
// GET /api/template-booking/available-slots?date=2025-09-21
router.get('/available-slots', templateBookingController.getAvailableMeetingSlots);

// USER ROUTES (Authentication required)
// POST /api/template-booking/book/:templateId
router.post('/book/:templateId', verifyToken, validateTemplateBooking, templateBookingController.bookTemplate);

// GET /api/template-booking/my-bookings
router.get('/my-bookings', verifyToken, templateBookingController.getUserBookings);

// GET /api/template-booking/my-bookings/:bookingId
router.get('/my-bookings/:bookingId', verifyToken, templateBookingController.getBookingDetails);

// ✅ FIXED: User communication route (no admin middleware)
// POST /api/template-booking/:bookingId/communication
router.post('/:bookingId/communication', verifyToken, templateBookingController.addCommunication);

// PAYMENT ROUTES (User Authentication required)
// POST /api/template-booking/:bookingId/payment/create
router.post('/:bookingId/payment/create', verifyToken, templateBookingController.createPaymentOrder);

// POST /api/template-booking/:bookingId/payment/verify
router.post('/:bookingId/payment/verify', verifyToken, templateBookingController.verifyPayment);

// GET /api/template-booking/:bookingId/payment/history
router.get('/:bookingId/payment/history', verifyToken, templateBookingController.getPaymentHistory);

// ADMIN ROUTES (Admin/Secondary Admin only)
// GET /api/template-booking/admin/all
router.get('/admin/all', verifyToken, isAdmin, templateBookingController.getAllBookings);

// GET /api/template-booking/admin/:bookingId
router.get('/admin/:bookingId', verifyToken, isAdmin, templateBookingController.getBookingDetails);

// ✅ NEW: Delete booking route
// DELETE /api/template-booking/admin/:bookingId
router.delete('/admin/:bookingId', verifyToken, isAdmin, templateBookingController.deleteBooking);

// PUT /api/template-booking/admin/:bookingId/payment-percentage
router.put('/admin/:bookingId/payment-percentage', verifyToken, isAdmin, validatePaymentPercentage, templateBookingController.setPaymentPercentage);

// PUT /api/template-booking/admin/:bookingId/meeting-status
router.put('/admin/:bookingId/meeting-status', verifyToken, isAdmin, validateMeetingStatus, templateBookingController.updateMeetingStatus);

// PUT /api/template-booking/admin/:bookingId/development-progress
router.put('/admin/:bookingId/development-progress', verifyToken, isAdmin, validateDevelopmentProgress, templateBookingController.updateDevelopmentProgress);

// ✅ FIXED: Update Website URLs (No status restriction)
// PUT /api/template-booking/admin/:bookingId/website-urls
router.put('/admin/:bookingId/website-urls', verifyToken, isAdmin, validateWebsiteUrls, templateBookingController.updateWebsiteUrls);

// PUT /api/template-booking/admin/:bookingId/final-website (Legacy - for final delivery)
router.put('/admin/:bookingId/final-website', verifyToken, isAdmin, templateBookingController.setFinalWebsiteUrl);

// GET /api/template-booking/dashboard-stats
router.get('/dashboard-stats', verifyToken, templateBookingController.getDashboardStats);

// ✅ FIXED: Admin communication route (separate from user route)
// POST /api/template-booking/admin/:bookingId/communication
router.post('/admin/:bookingId/communication', verifyToken, isAdmin, templateBookingController.addCommunication);

// console.removed.log('✅ Template Booking routes configured successfully');

module.exports = router;
