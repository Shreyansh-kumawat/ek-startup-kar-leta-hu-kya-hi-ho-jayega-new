const mongoose = require('mongoose');

const planPurchaseSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Plan Details
  planType: {
    type: String,
    enum: ['Starter', 'Growth', 'Scale', 'Single Website'],
    required: true
  },
  planPrice: {
    type: Number,
    required: true,
    min: 0
  },
  creditsReceived: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Payment Details
  paymentDetails: {
    razorpayOrderId: {
      type: String,
      required: true
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['created', 'processing', 'completed', 'failed', 'refunded'],
    default: 'created',
    index: true
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
  
  // Gateway Response
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Credits Applied
  creditsApplied: {
    type: Boolean,
    default: false
  },
  creditsAppliedAt: {
    type: Date,
    default: null
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      default: 'dashboard'
    }
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
planPurchaseSchema.index({ userId: 1, createdAt: -1 });
planPurchaseSchema.index({ 'paymentDetails.razorpayOrderId': 1 });
planPurchaseSchema.index({ 'paymentDetails.razorpayPaymentId': 1 });
planPurchaseSchema.index({ status: 1 });

// Virtual for purchase ID
planPurchaseSchema.virtual('purchaseId').get(function() {
  return `PLAN-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware
planPurchaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
planPurchaseSchema.methods.markAsCompleted = async function(gatewayResponse) {
  this.status = 'completed';
  this.isVerified = true;
  this.verifiedAt = new Date();
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

planPurchaseSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  this.gatewayResponse = { failureReason: reason };
  return this.save();
};

planPurchaseSchema.methods.applyCredits = async function(User) {
  if (this.creditsApplied) {
    throw new Error('Credits already applied for this purchase');
  }
  
  const user = await User.findById(this.userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Add credits to user
  user.credits = (user.credits || 0) + this.creditsReceived;
  await user.save();
  
  // Mark credits as applied
  this.creditsApplied = true;
  this.creditsAppliedAt = new Date();
  await this.save();
  
  return user;
};

// Static methods
planPurchaseSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .select('-gatewayResponse');
};

planPurchaseSchema.statics.getSuccessfulPurchases = function(userId) {
  return this.find({ 
    userId, 
    status: 'completed',
    creditsApplied: true 
  })
  .sort({ createdAt: -1 });
};

planPurchaseSchema.statics.getTotalCreditsEarned = async function(userId) {
  const result = await this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        status: 'completed',
        creditsApplied: true
      } 
    },
    {
      $group: {
        _id: null,
        totalCredits: { $sum: '$creditsReceived' },
        totalSpent: { $sum: '$planPrice' },
        purchaseCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalCredits: 0, totalSpent: 0, purchaseCount: 0 };
};

module.exports = mongoose.model('PlanPurchase', planPurchaseSchema);
