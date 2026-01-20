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
  getTemplateByDisplayId
} = require('../controllers/templateController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateTemplate } = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (before :id)
router.get('/search', searchTemplates);
router.get('/admin/all', verifyToken, isAdmin, getAdminTemplates);
router.get('/display/:displayId', getTemplateByDisplayId);
router.get('/by-website-id/:websiteId', getTemplateByWebsiteId);

// Public routes
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById); // ✅ MUST BE LAST

// Protected admin routes
router.post('/', verifyToken, isAdmin, uploadImage, validateTemplate, createTemplate);
router.put('/:id', verifyToken, isAdmin, uploadImage, updateTemplate);
router.delete('/:id', verifyToken, isAdmin, deleteTemplate);
router.patch('/:id/status', verifyToken, isAdmin, toggleTemplateStatus);

module.exports = router;
