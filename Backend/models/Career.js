// Backend/models/Career.js
const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
    // Auto-generated: 3di001, 3di002, ...
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  image: {
    type: String, // URL/path to image
    default: null,
  },
  timePeriod: {
    type: String,
    required: [true, 'Time period is required'],
    // e.g. "Full-time", "Part-time", "3 months", "6 months"
  },
  experience: {
    type: String,
    required: [true, 'Experience required'],
    // e.g. "0-1 years", "1-3 years", "Fresher"
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Counter for auto-generating jobId
}, {
  timestamps: true,
});

// Auto-generate jobId before save
careerSchema.pre('save', async function (next) {
  if (!this.jobId) {
    const count = await mongoose.model('Career').countDocuments();
    const num = String(count + 1).padStart(3, '0');
    this.jobId = `3di${num}`;
  }
  next();
});

module.exports = mongoose.model('Career', careerSchema);
