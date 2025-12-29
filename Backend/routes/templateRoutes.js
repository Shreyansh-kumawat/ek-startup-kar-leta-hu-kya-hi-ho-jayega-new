const express = require('express');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  getAdminTemplates,
  searchTemplates,
  getTemplateByWebsiteId,
  getTemplateByDisplayId // ✅ ADD THIS
} = require('../controllers/templateController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateTemplate } = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// ✅ NEW ROUTES FIRST (specific routes before :id)
router.get('/display/:displayId', getTemplateByDisplayId); // ✅ BEFORE /:id
router.get('/by-website-id/:websiteId', getTemplateByWebsiteId); // ✅ BEFORE /:id
router.get('/search', searchTemplates); // ✅ BEFORE /:id

// Public routes
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById); // ✅ KEEP THIS LAST

// Protected admin routes
router.get('/admin/all', verifyToken, isAdmin, getAdminTemplates);
router.post('/', verifyToken, isAdmin, uploadImage, validateTemplate, createTemplate);
router.put('/:id', verifyToken, isAdmin, uploadImage, updateTemplate);
router.delete('/:id', verifyToken, isAdmin, deleteTemplate);
router.patch('/:id/status', verifyToken, isAdmin, toggleTemplateStatus);

module.exports = router;
