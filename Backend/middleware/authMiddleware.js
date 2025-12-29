// Backend\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  // Get token from header - multiple ways to handle it
  let token = req.header('Authorization');
  
  // Debug logs
  // console.log('🔍 Authorization header:', token);
  // console.log('🔍 All headers:', req.headers);

  // Handle different token formats
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7); // Remove "Bearer " prefix
  } else if (token && !token.startsWith('Bearer')) {
    // Token might be sent directly without "Bearer " prefix
    // Keep the token as is
  } else {
    // Also check for token in other headers or query params
    token = req.header('x-auth-token') || req.query.token;
  }

  // console.log('🔍 Extracted token:', token ? 'Token present' : 'No token'); // Debug

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' // FIXED: Match frontend expectation
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('✅ Token decoded successfully for user:', decoded.id); // Debug
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message); // Debug
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // console.log('🔍 Admin check for user:', user?.name, 'Role:', user?.role); // Debug
    
    if (user && (user.role === 'admin' || user.role === 'secondaryAdmin')) {
      // console.log('✅ Admin access granted'); // Debug
      next();
    } else {
      // console.log('❌ Admin access denied'); // Debug
      res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
  } catch (error) {
    console.error('❌ Admin check error:', error); // Debug
    res.status(500).json({ 
      success: false,
      message: 'Server error during admin check' 
    });
  }
};

const isMainAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // console.log('🔍 Main admin check for user:', user?.name, 'Role:', user?.role); // Debug
    
    if (user && user.role === 'admin') {
      // console.log('✅ Main admin access granted'); // Debug
      next();
    } else {
      // console.log('❌ Main admin access denied'); // Debug
      res.status(403).json({ 
        success: false,
        message: 'Main Admin access required' 
      });
    }
  } catch (error) {
    console.error('❌ Main admin check error:', error); // Debug
    res.status(500).json({ 
      success: false,
      message: 'Server error during main admin check' 
    });
  }
};

module.exports = { verifyToken, isAdmin, isMainAdmin };
