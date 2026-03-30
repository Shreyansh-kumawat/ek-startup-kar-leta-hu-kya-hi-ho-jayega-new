// Backend/routes/careerRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getActiveJobs,
  getJobByJobId,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/careerController');

// Ensure uploads/careers dir exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'careers');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `career_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// ── Public Routes ──
router.get('/', getActiveJobs);
router.get('/:jobId', getJobByJobId);

// ── Admin Routes ──
router.get('/admin/all', verifyToken, isAdmin, getAllJobs);
router.post('/', verifyToken, isAdmin, upload.single('image'), createJob);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateJob);
router.delete('/:id', verifyToken, isAdmin, deleteJob);

module.exports = router;
