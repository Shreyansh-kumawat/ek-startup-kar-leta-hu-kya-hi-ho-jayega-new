const Career = require('../models/Career');
const JobApplication = require('../models/JobApplication');
const path = require('path');
const fs = require('fs');

// PUBLIC: Get all active (non-expired) jobs
exports.getActiveJobs = async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Career.find({ isActive: true, expiryDate: { $gt: now } }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUBLIC: Get single job by jobId
exports.getJobByJobId = async (req, res) => {
  try {
    const job = await Career.findOne({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Get ALL jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Career.find().sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Create job
exports.createJob = async (req, res) => {
  try {
    const { title, description, timePeriod, experience, expiryDate } = req.body;
    const image = req.file ? `/uploads/careers/${req.file.filename}` : null;
    const job = await Career.create({ title, description, timePeriod, experience, expiryDate, image });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    ['title', 'description', 'timePeriod', 'experience', 'expiryDate', 'isActive'].forEach(f => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });
    if (req.file) {
      if (job.image) { const op = path.join(__dirname, '..', job.image); if (fs.existsSync(op)) fs.unlinkSync(op); }
      job.image = `/uploads/careers/${req.file.filename}`;
    }
    await job.save();
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADMIN: Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.image) { const ip = path.join(__dirname, '..', job.image); if (fs.existsSync(ip)) fs.unlinkSync(ip); }
    await Career.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUBLIC: Submit application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, jobTitle, name, age, gender, email, phone, message } = req.body;
    if (!jobId || !jobTitle || !name || !age || !gender || !email || !phone) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }
    // Prevent duplicate application by same email for same job
    const existing = await JobApplication.findOne({ jobId, email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    }
    const application = await JobApplication.create({ jobId, jobTitle, name, age, gender, email, phone, message: message || '' });
    res.status(201).json({ success: true, message: 'Application submitted successfully!', data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Get applications for a specific job
exports.getApplicationsByJob = async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.jobId }).sort({ createdAt: -1 });
    res.json({ success: true, data: applications, count: applications.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
