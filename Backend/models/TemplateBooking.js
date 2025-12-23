const mongoose = require('mongoose');

const templateBookingSchema = new mongoose.Schema({
  // Basic Booking Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
    index: true
  },
  
  // Template Details (cached for quick access)
  templateName: {
    type: String,
    required: true
  },
  templatePrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Meeting Information
  meetingDetails: {
    scheduledDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true
    },
    meetingLink: {
      type: String,
      default: null
    },
    meetingStatus: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    meetingNotes: {
      type: String,
      default: ''
    },
    additionalRequirements: {
      type: String,
      default: ''
    }
  },
  
  // Payment Information
  paymentDetails: {
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    partialPaymentId: {
      type: String,
      default: null
    },
    finalPaymentId: {
      type: String,
      default: null
    },
    razorpayOrderIds: [{
      orderId: String,
      amount: Number,
      paymentType: {
        type: String,
        enum: ['partial', 'final']
      },
      status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'cancelled'],
        default: 'created'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Development Status
  developmentStatus: {
    stage: {
      type: String,
      enum: ['not_started', 'in_progress', 'review', 'completed'],
      default: 'not_started'
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    estimatedDelivery: {
      type: Date,
      default: null
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    developerNotes: {
      type: String,
      default: ''
    }
  },
  
  // Website Links
  websiteUrls: {
    previewUrl: {
      type: String,
      default: null
    },
    finalUrl: {
      type: String,
      default: null
    },
    downloadUrl: {
      type: String,
      default: null
    }
  },
  
  // Admin Management
  adminSettings: {
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    paymentPercentageSet: {
      type: Boolean,
      default: false
    },
    paymentPercentageSetAt: {
      type: Date,
      default: null
    },
    paymentPercentageSetBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  
  // Booking Status
  status: {
  type: String,
  enum: [
    'meeting_scheduled',        // Meeting booked but not completed
    'meeting_completed',        // Meeting done, waiting for payment percentage
    'partial_payment_pending',  // Admin set percentage, waiting for payment
    'partial_payment_done',     // Partial payment received, development started
    'development_in_progress',  // Website being developed + URLs being updated
    'website_ready',            // 🔥 NEW: Website ready, preview available
    'final_payment_pending',    // 🔥 CHANGED: Website ready, waiting for final payment
    'completed',                // All done, website delivered
    'cancelled'                 // Booking cancelled
  ],
  default: 'meeting_scheduled',
  index: true
},
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['meeting', 'payment', 'development', 'delivery', 'other']
    },
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isAdminMessage: {
      type: Boolean,
      default: false
    }
  }],
  
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
  
  // Additional Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    sourceChannel: {
      type: String,
      default: 'website'
    }
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
templateBookingSchema.index({ userId: 1, status: 1 });
templateBookingSchema.index({ templateId: 1, createdAt: -1 });
templateBookingSchema.index({ 'meetingDetails.scheduledDate': 1 });
templateBookingSchema.index({ 'paymentDetails.paymentPercentage': 1 });
templateBookingSchema.index({ 'developmentStatus.stage': 1 });
templateBookingSchema.index({ createdAt: -1 });

// Virtual for remaining amount
templateBookingSchema.virtual('remainingAmount').get(function() {
  return this.paymentDetails.totalAmount - this.paymentDetails.paidAmount;
});

// Virtual for current payment amount (based on percentage)
templateBookingSchema.virtual('currentPaymentAmount').get(function() {
  if (this.paymentDetails.paymentPercentage > 0) {
    return (this.paymentDetails.totalAmount * this.paymentDetails.paymentPercentage) / 100;
  }
  return 0;
});

// Virtual for payment completion percentage
templateBookingSchema.virtual('paymentProgress').get(function() {
  if (this.paymentDetails.totalAmount > 0) {
    return Math.round((this.paymentDetails.paidAmount / this.paymentDetails.totalAmount) * 100);
  }
  return 0;
});

// Virtual for booking ID (user-friendly)
templateBookingSchema.virtual('bookingId').get(function() {
  return `TB-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware
templateBookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-update status based on payment and development progress
  if (this.isModified('paymentDetails.paidAmount') || this.isModified('developmentStatus.stage')) {
    this.updateStatus();
  }
  
  next();
});

// Instance methods
templateBookingSchema.methods.updateStatus = function() {
  const paid = this.paymentDetails.paidAmount;
  const total = this.paymentDetails.totalAmount;
  const devStage = this.developmentStatus.stage;
  
  if (paid === 0 && this.paymentDetails.paymentPercentage > 0) {
    this.status = 'partial_payment_pending';
  } else if (paid > 0 && paid < total) {
    if (devStage === 'not_started' || devStage === 'in_progress') {
      this.status = 'development_in_progress';
    } else if (devStage === 'completed') {
      this.status = 'final_payment_pending';
    }
  } else if (paid >= total) {
    this.status = 'completed';
  }
};

templateBookingSchema.methods.addCommunication = function(type, message, createdBy, isAdminMessage = false) {
  this.communications.push({
    type,
    message,
    createdBy,
    isAdminMessage,
    createdAt: new Date()
  });
  return this.save();
};

templateBookingSchema.methods.setPaymentPercentage = function(percentage, setBy) {
  this.paymentDetails.paymentPercentage = percentage;
  this.adminSettings.paymentPercentageSet = true;
  this.adminSettings.paymentPercentageSetAt = new Date();
  this.adminSettings.paymentPercentageSetBy = setBy;
  
  if (percentage > 0) {
    this.status = 'partial_payment_pending';
  }
  
  return this.save();
};

templateBookingSchema.methods.recordPayment = function(paymentId, amount, paymentType) {
  this.paymentDetails.paidAmount += amount;
  
  if (paymentType === 'partial') {
    this.paymentDetails.partialPaymentId = paymentId;
    this.status = 'partial_payment_done';
    this.developmentStatus.stage = 'in_progress';
    this.developmentStatus.startedAt = new Date();
  } else if (paymentType === 'final') {
    this.paymentDetails.finalPaymentId = paymentId;
    if (this.paymentDetails.paidAmount >= this.paymentDetails.totalAmount) {
      this.status = 'completed';
    }
  }
  
  // Add to razorpay orders array
  const orderIndex = this.paymentDetails.razorpayOrderIds.findIndex(
    order => order.paymentType === paymentType && order.status === 'created'
  );
  
  if (orderIndex > -1) {
    this.paymentDetails.razorpayOrderIds[orderIndex].status = 'paid';
  }
  
  return this.save();
};

templateBookingSchema.methods.updateDevelopmentProgress = function(progress, stage, notes) {
  this.developmentStatus.progress = progress;
  this.developmentStatus.stage = stage;
  if (notes) {
    this.developmentStatus.developerNotes = notes;
  }
  
  if (stage === 'completed') {
    this.developmentStatus.completedAt = new Date();
    this.status = 'website_ready';
  }
  
  return this.save();
};

// Static methods
templateBookingSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('templateId', 'name previewImage')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

templateBookingSchema.statics.findPendingPayments = function() {
  return this.find({
    status: { $in: ['partial_payment_pending', 'final_payment_pending'] }
  })
  .populate('userId', 'name email')
  .populate('templateId', 'name')
  .sort({ createdAt: -1 });
};

templateBookingSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('userId', 'name email')
    .populate('templateId', 'name previewImage')
    .populate('adminSettings.assignedAdmin', 'name')
    .sort({ createdAt: -1 });
};

templateBookingSchema.statics.getBookingStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$paymentDetails.totalAmount' },
        paidAmount: { $sum: '$paymentDetails.paidAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('TemplateBooking', templateBookingSchema);
