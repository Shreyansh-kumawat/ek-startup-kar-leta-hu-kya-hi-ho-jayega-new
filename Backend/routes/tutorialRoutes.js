// routes/tutorialRoutes.js
const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// console.log('✅ Tutorial routes loading...');

// User routes (protected with verifyToken)
router.post('/interaction', verifyToken, tutorialController.recordTutorialInteraction);
router.put('/video-progress', verifyToken, tutorialController.updateVideoProgress);
router.get('/my-history', verifyToken, tutorialController.getUserTutorialHistory);

// Admin routes (verifyToken + isAdmin)
router.get('/analytics', verifyToken, isAdmin, tutorialController.getTutorialAnalytics);

// console.log('✅ Tutorial routes registered successfully');

module.exports = router;
