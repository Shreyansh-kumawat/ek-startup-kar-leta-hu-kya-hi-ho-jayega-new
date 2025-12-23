const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'scheduled', 'completed', 'cancelled'],
    default: 'requested',
  },
  scheduledDate: {
    type: Date,
  },
  meetingLink: {
    type: String, // Google Meet link
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;