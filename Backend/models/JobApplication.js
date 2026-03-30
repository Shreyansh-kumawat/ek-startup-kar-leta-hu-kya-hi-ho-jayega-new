const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },       // e.g. 3di001
  jobTitle: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
