// Backend/models/Payment.js - REPLACE ENTIRE FILE
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Basic Payment Information
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  
  // Related Booking
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TemplateBooking',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Razorpay Details - FIX: Make optional initially
  razorpay: {
    orderId: {
      type: String,
      required: true
    },
    paymentId: {
      type: String,
      required: false // 🔥 CHANGED: Not required initially
    },
    signature: {
      type: String,
      required: false // 🔥 CHANGED: Not required initially
    }
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentType: {
    type: String,
    enum: ['partial', 'final'],
    required: true
  },
  paymentPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Status
  status: {
    type: String,
    enum: ['created', 'processing', 'completed', 'failed', 'refunded'],
    default: 'created'
  },
  
  // Payment Gateway Response
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    paymentMethod: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ bookingId: 1, paymentType: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ status: 1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
paymentSchema.methods.markAsCompleted = function(gatewayResponse) {
  this.status = 'completed';
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.gatewayResponse = { failureReason: reason };
  return this.save();
};

// Static methods
paymentSchema.statics.findByBooking = function(bookingId) {
  return this.find({ bookingId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

paymentSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('bookingId', 'templateName status')
    .sort({ createdAt: -1 });
};

paymentSchema.statics.getPaymentStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
