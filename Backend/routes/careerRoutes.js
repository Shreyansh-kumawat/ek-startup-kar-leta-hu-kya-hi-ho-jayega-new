const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const {
  getActiveJobs, getJobByJobId, getAllJobs,
  createJob, updateJob, deleteJob,
  submitApplication, getApplicationsByJob,
} = require('../controllers/careerController');

// Memory storage — no disk writes, buffer piped to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Public: exact paths
router.get('/', getActiveJobs);
router.post('/apply', submitApplication);

// Admin: exact paths (before /:id wildcards)
router.get('/admin/all', verifyToken, isAdmin, getAllJobs);
router.get('/admin/applications/:jobId', verifyToken, isAdmin, getApplicationsByJob);
router.post('/', verifyToken, isAdmin, upload.single('image'), createJob);

// Wildcard param routes (MUST be last)
router.get('/:jobId', getJobByJobId);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateJob);
router.delete('/:id', verifyToken, isAdmin, deleteJob);

module.exports = router;
