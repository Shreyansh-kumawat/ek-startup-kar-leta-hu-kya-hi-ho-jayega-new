const express = require('express');
const {
  requestMeeting,
  getMeetingRequests,
  scheduleMeeting,
  getUserMeetings,
  updateMeetingStatus,    // FIXED
  getAllMeetings,         // FIXED
  rescheduleMeeting       // BONUS
} = require('../controllers/meetingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateMeeting } = require('../middleware/validationMiddleware');

const router = express.Router();

// Protected user routes
router.post('/request', verifyToken, validateMeeting, requestMeeting);
router.get('/my-meetings', verifyToken, getUserMeetings);

// Protected admin routes
router.get('/requests', verifyToken, isAdmin, getMeetingRequests);
router.get('/', verifyToken, isAdmin, getAllMeetings);           // FIXED
router.put('/:id/schedule', verifyToken, isAdmin, scheduleMeeting);
router.put('/:id/status', verifyToken, isAdmin, updateMeetingStatus);  // FIXED
router.put('/:id/reschedule', verifyToken, isAdmin, rescheduleMeeting); // BONUS

module.exports = router;
