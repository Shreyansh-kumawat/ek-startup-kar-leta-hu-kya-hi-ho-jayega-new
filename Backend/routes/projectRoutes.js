const express = require('express');
const {
  getProjectDetails,
  getUserProjects,        // FIXED
  updateProjectStatus,
  activateWebsite,
  addNotification,
  getAllProjects,         // FIXED  
  updateProjectLinks,     // FIXED
  getProjectNotifications,// BONUS
  markNotificationsRead   // BONUS
} = require('../controllers/projectController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected user routes
router.get('/user/:userId', verifyToken, getProjectDetails);
router.get('/my-projects', verifyToken, getUserProjects);           // FIXED
router.get('/:id/notifications', verifyToken, getProjectNotifications);
router.put('/:id/notifications/read', verifyToken, markNotificationsRead);

// Protected admin routes  
router.get('/', verifyToken, isAdmin, getAllProjects);              // FIXED
router.put('/:id/status', verifyToken, isAdmin, updateProjectStatus);
router.post('/:id/activate', verifyToken, isAdmin, activateWebsite);
router.post('/:id/notification', verifyToken, isAdmin, addNotification);
router.put('/:id/links', verifyToken, isAdmin, updateProjectLinks);  // FIXED

module.exports = router;
