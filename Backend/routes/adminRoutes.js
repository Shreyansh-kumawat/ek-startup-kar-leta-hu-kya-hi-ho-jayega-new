const express = require('express');
const {
  getDashboard,
  getAllUsers,
  createSecondaryAdmin,
  updateUserStatus,
  updateUserCredits,
  deleteUser,
  getSystemStats,
  getUserById,
  getAdminActivityLog
} = require('../controllers/adminController');
const { verifyToken, isAdmin, isMainAdmin } = require('../middleware/authMiddleware');
const { validateUser } = require('../middleware/validationMiddleware');

const router = express.Router();

// Protected admin routes
router.get('/dashboard', verifyToken, isAdmin, getDashboard);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/users/:id', verifyToken, isAdmin, getUserById);
router.get('/stats', verifyToken, isAdmin, getSystemStats);
router.get('/activity', verifyToken, isAdmin, getAdminActivityLog);

// Main admin only routes
router.post('/secondary', verifyToken, isMainAdmin, validateUser, createSecondaryAdmin);
router.put('/users/:id/status', verifyToken, isMainAdmin, updateUserStatus);
router.put('/users/:id/credits', verifyToken, isMainAdmin, updateUserCredits);
router.delete('/users/:id', verifyToken, isMainAdmin, deleteUser);

module.exports = router;
