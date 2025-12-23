const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  // ADDED: Missing fields that controller uses
  orderDate: {
    type: Date,
    default: Date.now,
  },
  paymentDate: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // For cancellation
  cancelReason: {
    type: String,
  },
  cancelledAt: {
    type: Date,
  },
  // For admin notes
  adminNotes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
