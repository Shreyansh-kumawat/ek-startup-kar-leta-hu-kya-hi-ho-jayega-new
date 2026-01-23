// Backend\controllers\templateController.js
const Template = require('../models/Template');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises;

// Get all templates with pagination and filters
exports.getAllTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category;
    const isActive = req.query.isActive;
    const withBackend = req.query.withBackend; // ✅ Filter by backend

    // Build query
    let query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // ✅ Filter by backend
    if (withBackend !== undefined) {
      query.withBackend = withBackend === 'true';
    }

    // Get total count
    const total = await Template.countDocuments(query);

    // Get templates
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTemplates: total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get all templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Get single template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const {
      name, description, price, liveDemo, category, tags,
      withBackend, creditsRequired, whatsIncluded,
      templateInfo, developmentProcess
    } = req.body;

    const templateData = {
      name,
      description,
      price,
      liveDemo,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      withBackend: withBackend === true || withBackend === 'true',
      creditsRequired: parseInt(creditsRequired) || 1,
      createdBy: req.user._id
    };

    // ✅ FIX: Middleware already uploaded to Cloudinary!
    if (req.file) {
      templateData.previewImage = req.file.path; // Already cloudinary URL
    }

    // Parse sections
    if (whatsIncluded) {
      templateData.whatsIncluded = typeof whatsIncluded === 'string' 
        ? JSON.parse(whatsIncluded) : whatsIncluded;
    }
    if (templateInfo) {
      templateData.templateInfo = typeof templateInfo === 'string' 
        ? JSON.parse(templateInfo) : templateInfo;
    }
    if (developmentProcess) {
      templateData.developmentProcess = typeof developmentProcess === 'string' 
        ? JSON.parse(developmentProcess) : developmentProcess;
    }

    const template = await Template.create(templateData);

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};


// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const {
      name, description, price, liveDemo, category, tags,
      withBackend, creditsRequired, whatsIncluded,
      templateInfo, developmentProcess
    } = req.body;

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const updateData = {
      name: name || template.name,
      description: description || template.description,
      price: price !== undefined ? price : template.price,
      liveDemo: liveDemo || template.liveDemo,
      category: category || template.category,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : template.tags,
      withBackend: withBackend !== undefined 
        ? (withBackend === true || withBackend === 'true') 
        : template.withBackend,
      creditsRequired: creditsRequired !== undefined 
        ? parseInt(creditsRequired) 
        : template.creditsRequired
    };

    // ✅ FIX: Middleware already uploaded to Cloudinary!
    if (req.file) {
      updateData.previewImage = req.file.path; // Already cloudinary URL
    }

    // Parse sections
    if (whatsIncluded) {
      updateData.whatsIncluded = typeof whatsIncluded === 'string' 
        ? JSON.parse(whatsIncluded) : whatsIncluded;
    }
    if (templateInfo) {
      updateData.templateInfo = typeof templateInfo === 'string' 
        ? JSON.parse(templateInfo) : templateInfo;
    }
    if (developmentProcess) {
      updateData.developmentProcess = typeof developmentProcess === 'string' 
        ? JSON.parse(developmentProcess) : developmentProcess;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // ✅ FIX: Comment out Cloudinary delete (optional cleanup)
    // Delete from database first - most important!
    await Template.findByIdAndDelete(req.params.id);

    // Optional: Delete from Cloudinary in background (don't await)
    if (template.previewImage && template.previewImage.includes('cloudinary')) {
      deleteFromCloudinary(template.previewImage).catch(err =>
        console.log('⚠️ Cloudinary cleanup failed (non-critical):', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};


// Toggle template status (active/inactive)
exports.toggleTemplateStatus = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: template
    });
  } catch (error) {
    console.error('Toggle template status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling template status',
      error: error.message
    });
  }
};

// Get templates by category
exports.getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const templates = await Template.find({ category, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Search templates
exports.searchTemplates = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const templates = await Template.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Search templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching templates',
      error: error.message
    });
  }
};

// ✅ NEW: Get Admin Templates (with pagination)
exports.getAdminTemplates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Template.countDocuments(query);

    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTemplates: total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('❌ Get admin templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get templates',
      error: error.message
    });
  }
};

// ✅ NEW: Get Template by Website ID
exports.getTemplateByWebsiteId = async (req, res) => {
  try {
    const { websiteId } = req.params;

    const template = await Template.findOne({ websiteId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('❌ Get template by website ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template',
      error: error.message
    });
  }
};

// ✅ NEW: Get Template by Display ID (#3di-XXXXXX)
exports.getTemplateByDisplayId = async (req, res) => {
  try {
    const { displayId } = req.params;

    // Extract last 6 characters from display ID
    const last6 = displayId.replace('#3di-', '').replace('3di-', '');

    // Find template where _id ends with these characters
    const templates = await Template.find({}).lean();
    const template = templates.find(t => 
      t._id.toString().slice(-6) === last6
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('❌ Get template by display ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get template',
      error: error.message
    });
  }
};

// ✅ EXPORTS - All functions
module.exports = {
  getAllTemplates: exports.getAllTemplates,
  getTemplateById: exports.getTemplateById,
  createTemplate: exports.createTemplate,
  updateTemplate: exports.updateTemplate,
  deleteTemplate: exports.deleteTemplate,
  toggleTemplateStatus: exports.toggleTemplateStatus,
  getTemplatesByCategory: exports.getTemplatesByCategory,
  searchTemplates: exports.searchTemplates,
  getAdminTemplates: exports.getAdminTemplates,           // ✅ NEW
  getTemplateByWebsiteId: exports.getTemplateByWebsiteId, // ✅ NEW
  getTemplateByDisplayId: exports.getTemplateByDisplayId  // ✅ NEW
};
