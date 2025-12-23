const express = require('express');
const {
  getDashboard,         // FIXED
  getAllUsers,          // FIXED
  createSecondaryAdmin, // FIXED
  updateUserStatus,     // FIXED
  deleteUser,           // FIXED
  getSystemStats,       // FIXED
  getUserById,          // FIXED
  getAdminActivityLog   // BONUS
} = require('../controllers/adminController');
const { verifyToken, isAdmin, isMainAdmin } = require('../middleware/authMiddleware');
const { validateUser } = require('../middleware/validationMiddleware');

const router = express.Router();

// Protected admin routes
router.get('/dashboard', verifyToken, isAdmin, getDashboard);           // FIXED
router.get('/users', verifyToken, isAdmin, getAllUsers);               // FIXED
router.get('/users/:id', verifyToken, isAdmin, getUserById);           // FIXED
router.get('/stats', verifyToken, isAdmin, getSystemStats);            // FIXED
router.get('/activity', verifyToken, isAdmin, getAdminActivityLog);    // BONUS

// Main admin only routes
router.post('/secondary', verifyToken, isMainAdmin, validateUser, createSecondaryAdmin);  // FIXED
router.put('/users/:id/status', verifyToken, isMainAdmin, updateUserStatus);             // FIXED
router.delete('/users/:id', verifyToken, isMainAdmin, deleteUser);                       // FIXED

module.exports = router;
