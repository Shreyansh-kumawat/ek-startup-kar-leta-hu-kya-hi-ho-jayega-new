const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { google } = require('googleapis');
const { sendWelcomeEmail, sendLoginNotification } = require('../utils/emailUtils');
const { generateResetToken, sendPasswordResetEmail, sendPasswordChangedEmail } = require('../utils/passwordResetUtils');

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Register function
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: cleanedPhone,
      role: 'user'
    });

    await user.save();

    sendWelcomeEmail(user).catch(err => {
      console.error('❌ Failed to send welcome email:', err.message);
    });

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

// Login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcryptjs.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role || 'user',
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendLoginNotification(user, {
      device: req.headers['user-agent'] || 'Web Browser',
      location: 'India'
    }).catch(err => {
      console.error('❌ Failed to send login notification:', err.message);
    });

    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { 
          id: user._id, 
          name: user.name,
          email: user.email, 
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code is required' 
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ email: data.email });

    if (!user) {
      user = await User.create({
        name: data.name,
        email: data.email,
        phone: '',
        googleId: data.id,
        profilePicture: data.picture,
        isVerified: true,
        authProvider: 'google',
        password: Math.random().toString(36).slice(-8) + 'Aa1!'
      });
    } else if (!user.googleId) {
      user.googleId = data.id;
      user.profilePicture = data.picture;
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role || 'user',
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture
        }
      }
    });

  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during logout', 
      error: error.message 
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Profile fetched successfully',
      data: user 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile', 
      error: error.message 
    });
  }
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with this email' 
      });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        success: false,
        message: 'This account uses Google Sign-In. Please use Google to sign in.' 
      });
    }

    const resetToken = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailResult = await sendPasswordResetEmail(user, resetToken);

    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to send reset email. Please try again later.' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Password reset OTP sent to your email' 
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password reset request', 
      error: error.message 
    });
  }
};

// Reset Password with OTP
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, OTP, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendPasswordChangedEmail(user).catch(err => {
      console.error('❌ Failed to send password changed email:', err.message);
    });

    res.status(200).json({ 
      success: true,
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password reset', 
      error: error.message 
    });
  }
};

// Update Profile (Name & Phone)
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and phone are required' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.name = name.trim();
    user.phone = phone.replace(/\D/g, '');
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during profile update', 
      error: error.message 
    });
  }
};


// ✅ NEW: Change Password (for logged-in users with current password)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user signed up with Google
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        success: false,
        message: 'Google users cannot change password. Please use Google Sign-In.' 
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    sendPasswordChangedEmail(user).catch(err => {
      console.error('❌ Failed to send password changed email:', err.message);
    });

    res.status(200).json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password change', 
      error: error.message 
    });
  }
};




module.exports = {
  register,
  login,
  googleLogin,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword
};
