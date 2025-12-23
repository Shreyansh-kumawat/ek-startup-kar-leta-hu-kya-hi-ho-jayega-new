const express = require('express');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  googleLogin,
  updateProfile,
  changePassword 
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateUser, validateLogin } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword); // ✅ Updated
router.post('/reset-password', resetPassword);   // ✅ Updated

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile); // ✅ NEW
router.put('/change-password', verifyToken, changePassword);


module.exports = router;
