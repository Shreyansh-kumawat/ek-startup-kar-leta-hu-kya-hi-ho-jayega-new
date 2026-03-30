const Career = require('../models/Career');
const JobApplication = require('../models/JobApplication');
const { cloudinary } = require('../config/cloudinary');
const { Readable } = require('stream');

// Upload buffer to Cloudinary via stream (no disk required)
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder || '3digree/careers', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Delete image from Cloudinary using its secure_url
const deleteCloudinaryImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;
    // Extract public_id: everything after /upload/vXXX/
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return;
    const publicIdWithExt = match[1];
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

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
    let image = null;
    if (req.file && req.file.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      image = result.secure_url; // Full HTTPS Cloudinary URL — permanent!
    }
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
    if (req.file && req.file.buffer) {
      await deleteCloudinaryImage(job.image); // Remove old image
      const result = await uploadBufferToCloudinary(req.file.buffer);
      job.image = result.secure_url;
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
    await deleteCloudinaryImage(job.image);
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
