// Backend/controllers/careerController.js
const Career = require('../models/Career');
const path = require('path');
const fs = require('fs');

// ─── PUBLIC: Get all active (non-expired) jobs ───────────────────────────────
exports.getActiveJobs = async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Career.find({
      isActive: true,
      expiryDate: { $gt: now },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC: Get single job by jobId (e.g. 3di001) ───────────────────────────
exports.getJobByJobId = async (req, res) => {
  try {
    const job = await Career.findOne({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Get ALL jobs (including expired/inactive) ────────────────────────
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Career.find().sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Create job ────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const { title, description, timePeriod, experience, expiryDate } = req.body;
    let image = null;

    if (req.file) {
      image = `/uploads/careers/${req.file.filename}`;
    }

    const job = await Career.create({
      title,
      description,
      timePeriod,
      experience,
      expiryDate,
      image,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Update job ────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const fields = ['title', 'description', 'timePeriod', 'experience', 'expiryDate', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });

    if (req.file) {
      // Delete old image if exists
      if (job.image) {
        const oldPath = path.join(__dirname, '..', job.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      job.image = `/uploads/careers/${req.file.filename}`;
    }

    await job.save();
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Delete job ────────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Career.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Delete image file
    if (job.image) {
      const imgPath = path.join(__dirname, '..', job.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Career.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
