const express = require('express');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  getAdminTemplates,
  searchTemplates
} = require('../controllers/templateController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { validateTemplate } = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/search', searchTemplates);
router.get('/:id', getTemplateById);

// Protected admin routes
router.get('/admin/all', verifyToken, isAdmin, getAdminTemplates);
router.post('/', verifyToken, isAdmin, uploadImage, validateTemplate, createTemplate);
router.put('/:id', verifyToken, isAdmin, uploadImage, updateTemplate);
router.delete('/:id', verifyToken, isAdmin, deleteTemplate);
router.patch('/:id/status', verifyToken, isAdmin, toggleTemplateStatus); // FIXED

module.exports = router;

