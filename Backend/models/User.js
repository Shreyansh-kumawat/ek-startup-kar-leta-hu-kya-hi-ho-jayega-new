const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    }
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'secondaryAdmin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  isVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  
  // ✅ NEW: Password Reset Fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Pre-save hook to hash password (if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
