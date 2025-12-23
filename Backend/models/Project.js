const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
    enum: ['initiated', 'in_progress', 'review', 'completed'],
    default: 'initiated',
  },
  previewLink: {
    type: String, // Watermarked preview
  },
  liveLink: {
    type: String, // Final non-watermarked link
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
  }],
  monthlyPayment: {
    type: Boolean,
    default: false,
  },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;