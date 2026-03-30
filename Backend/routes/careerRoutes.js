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

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: All static/exact-path routes MUST come before /:param routes.
// Otherwise Express matches e.g. GET /admin/all as /:jobId = 'admin'
// ─────────────────────────────────────────────────────────────────────────────

// ── Public: exact paths ──
router.get('/', getActiveJobs);                                               // GET  /
router.post('/apply', submitApplication);                                     // POST /apply

// ── Admin: exact paths (before /:id wildcards) ──
router.get('/admin/all', verifyToken, isAdmin, getAllJobs);                   // GET  /admin/all
router.get('/admin/applications/:jobId', verifyToken, isAdmin, getApplicationsByJob); // GET /admin/applications/:jobId
router.post('/', verifyToken, isAdmin, upload.single('image'), createJob);   // POST /

// ── Wildcard param routes (MUST be last) ──
router.get('/:jobId', getJobByJobId);                                         // GET  /:jobId
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateJob); // PUT  /:id
router.delete('/:id', verifyToken, isAdmin, deleteJob);                      // DEL  /:id

module.exports = router;
