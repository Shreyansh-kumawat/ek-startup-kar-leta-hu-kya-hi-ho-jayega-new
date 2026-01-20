// Backend\models\WebsiteBooking.js
const mongoose = require('mongoose');

const websiteBookingSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Template Reference (by displayId - #3di-XXXXXX)
  templateDisplayId: {
    type: String,
    required: true,
    trim: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },

  // Cached Template Info
  templateName: {
    type: String,
    required: true
  },
  templateImage: {
    type: String,
    required: true
  },

  // ✅ NEW: Track credits used for this booking
  creditsUsed: {
    type: Number,
    default: 1,
    required: true,
    min: [1, 'Credits used must be at least 1']
  },

  // Booking Status
  status: {
    type: String,
    enum: [
      'purchased',           // 📦 Just bought
      'approved',            // ⚙️ Timer started
      'inprogress',          // ⚡ Auto-updating (10% → 90%)
      'readyforcompletion',  // ⏳ Reached 90%, waiting for admin
      'completed'            // ✅ 100% done
    ],
    default: 'purchased',
    index: true
  },

  // Progress Tracking
  progress: {
    type: Number,
    default: 10,
    min: 10,
    max: 100
  },

  // Timer & Approval
  approvedAt: {
    type: Date,
    default: null
  },
  estimatedCompletionAt: {
    type: Date,
    default: null
  },

  // Preview Link (Admin adds)
  previewLink: {
    type: String,
    default: null
  },

  // Timestamps
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
websiteBookingSchema.index({ userId: 1, status: 1 });
websiteBookingSchema.index({ approvedAt: 1 });
websiteBookingSchema.index({ createdAt: -1 });

// Virtual: Booking ID (user-friendly)
websiteBookingSchema.virtual('bookingId').get(function() {
  return `WB-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Enable virtuals in JSON
websiteBookingSchema.set('toJSON', { virtuals: true });
websiteBookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WebsiteBooking', websiteBookingSchema);