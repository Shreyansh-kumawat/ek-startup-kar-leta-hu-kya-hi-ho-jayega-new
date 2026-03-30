const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getActiveJobs, getJobByJobId, getAllJobs,
  createJob, updateJob, deleteJob,
  submitApplication, getApplicationsByJob,
} = require('../controllers/careerController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'careers');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `career_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// ── Public Routes ──
router.get('/', getActiveJobs);
router.post('/apply', submitApplication);          // Submit application
router.get('/:jobId', getJobByJobId);              // MUST be after /apply

// ── Admin Routes ──
router.get('/admin/all', verifyToken, isAdmin, getAllJobs);
router.get('/admin/applications/:jobId', verifyToken, isAdmin, getApplicationsByJob);
router.post('/', verifyToken, isAdmin, upload.single('image'), createJob);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateJob);
router.delete('/:id', verifyToken, isAdmin, deleteJob);

module.exports = router;
