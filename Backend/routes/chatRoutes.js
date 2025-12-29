const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/chat/:bookingId
// Get all messages for a booking
router.get('/:bookingId', verifyToken, chatController.getMessages);

// POST /api/chat/:bookingId
// Body: { message }
// Send a message (user or admin)
router.post('/:bookingId', verifyToken, chatController.sendMessage);

module.exports = router;
