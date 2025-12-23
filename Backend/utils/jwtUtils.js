const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (user) => {
  try {
    const payload = {
      id: user._id,
      role: user.role || 'user',
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  } catch (error) {
    throw new Error('Failed to generate token: ' + error.message);
  }
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token: ' + error.message);
  }
};
