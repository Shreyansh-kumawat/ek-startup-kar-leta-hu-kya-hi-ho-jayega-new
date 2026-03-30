// Backend/models/Career.js
const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
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
    type: String,
    default: null,
  },
  timePeriod: {
    type: String,
    default: null, // ✅ Optional
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
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
