const Template = require('../models/Template');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// ✅ Helper function for image URLs
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  
  // ✅ If already absolute URL (Cloudinary), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // ✅ Generate full URL for relative paths
  const protocol = req.protocol;
  const host = req.get('host');
  const fullUrl = `${protocol}://${host}${imagePath}`;
  
  return fullUrl;
};

// ✅ FIXED: getAllTemplates function - Admin sees disabled templates
exports.getAllTemplates = async (req, res) => {
  try {
    // console.log('🔍 Getting all templates...');
    
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = { isActive: true }; // Default: only active templates for public
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // ✅ FIXED: Admin should see ALL templates (active + disabled)
    if (req.user && (req.user.role === 'admin' || req.user.role === 'secondaryAdmin')) {
      delete query.isActive; // Remove isActive filter for admin
      // console.log('✅ Admin access: Showing all templates (active + disabled)');
    }

    // .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await Template.countDocuments(query);

    // ✅ Process image URLs (Cloudinary URLs are already absolute)
   const templatesWithFullUrls = templates.map(template => ({
  ...template,
  displayId: `#3di-${template._id.toString().slice(-6)}`, // ✅ ADD displayId
  previewImage: getFullImageUrl(req, template.previewImage),
  originalImagePath: template.previewImage
}));

    return res.status(200).json({
      success: true,
      message: 'Templates fetched successfully',
      data: {
        templates: templatesWithFullUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTemplates: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get all templates error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return errorResponse(res, 'Server error while fetching templates', error);
  }
};

// ✅ Create template - Updated for Cloudinary
exports.createTemplate = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      // templateLink,
      backend,
      liveDemo,
      whatsIncluded,
      templateInfo,
      developmentProcess
    } = req.body;

    // ✅ FIXED: Remove templateLink from required validation
    if (!name || !price || !liveDemo) {
      return errorResponse(res, 'Name, price, and live demo are required', null, 400);
    }

    // Check for duplicate name
    const existingTemplate = await Template.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    
    if (existingTemplate) {
      return errorResponse(res, 'Template with this name already exists', null, 400);
    }

    // ✅ Handle image upload - Cloudinary URL
    let previewImage = '';
    if (req.file) {
      previewImage = req.file.path; // This will be Cloudinary URL from middleware
    }

    // Parse JSON strings
    let parsedWhatsIncluded = {
      title: "What's Included",
      items: [],
      customItems: []
    };
    
    let parsedTemplateInfo = {
      title: "Template Information",
      details: []
    };
    
    let parsedDevelopmentProcess = {
      title: "Development Process",
      steps: []
    };

    try {
      if (whatsIncluded) {
        parsedWhatsIncluded = JSON.parse(whatsIncluded);
      }
      
      if (templateInfo) {
        parsedTemplateInfo = JSON.parse(templateInfo);
      }
      
      if (developmentProcess) {
        parsedDevelopmentProcess = JSON.parse(developmentProcess);
      }

    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.error('❌ Failed to parse:', { whatsIncluded, templateInfo, developmentProcess });
      return errorResponse(res, 'Invalid JSON data in form fields', parseError, 400);
    }

    // Create template
    const template = new Template({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(price),
      // templateLink: templateLink || '', // ✅ Allow empty string
      liveDemo,
      backend: backend === 'true' || backend === true, 
      previewImage, // Cloudinary URL
      whatsIncluded: parsedWhatsIncluded,
      templateInfo: parsedTemplateInfo,
      developmentProcess: parsedDevelopmentProcess,
      createdBy: req.user ? req.user.id : null,
      isActive: true
    });

    await template.save();

    // console.log('✅ Template created successfully:', template._id);
    return successResponse(res, 'Template created successfully', template, 201);

  } catch (error) {
    console.error('❌ Create template error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(res, 'Validation failed', { errors: validationErrors }, 400);
    }
    
    if (error.code === 11000) {
      return errorResponse(res, 'Template with this name already exists', null, 400);
    }
    
    return errorResponse(res, 'Server error while creating template', error);
  }
};

// Get single template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!template) {
      return errorResponse(res, 'Template not found', null, 404);
    }

    if (!template.isActive && (!req.user || (req.user.role !== 'admin' && req.user.role !== 'secondaryAdmin'))) {
      return errorResponse(res, 'Template not available', null, 404);
    }

    // ✅ Process image URL
    const templateWithFullUrl = {
      ...template,
      previewImage: getFullImageUrl(req, template.previewImage)
    };

    return successResponse(res, 'Template fetched successfully', templateWithFullUrl);
  } catch (error) {
    console.error('❌ Get template by ID error:', error);
    return errorResponse(res, 'Server error while fetching template', error);
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return errorResponse(res, 'Template not found', null, 404);
    }

    const { 
      name, 
      description, 
      price, 
      // templateLink, 
      liveDemo,
      backend,
      whatsIncluded,
      templateInfo,
      developmentProcess
    } = req.body;

    // Check for duplicate name excluding current template
    if (name && name.trim() !== template.name) {
      const existingTemplate = await Template.findOne({ 
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: template._id }
      });
      
      if (existingTemplate) {
        return errorResponse(res, 'Template with this name already exists', null, 400);
      }
    }

    // ✅ Handle image upload - Cloudinary URL
    let previewImage = template.previewImage;
    if (req.file) {
      previewImage = req.file.path; // Cloudinary URL
    }

    // Update basic fields
    template.name = name ? name.trim() : template.name;
    template.description = description ? description.trim() : template.description;
    template.price = price ? parseFloat(price) : template.price;
    // template.templateLink = templateLink || template.templateLink;
    template.liveDemo = liveDemo || template.liveDemo;
    if (typeof backend !== 'undefined') {
  template.backend = backend === 'true' || backend === true;
}
    template.previewImage = previewImage;
    
    // Update structured sections if provided
    if (whatsIncluded) {
      try {
        template.whatsIncluded = JSON.parse(whatsIncluded);
      } catch (e) {
        return errorResponse(res, 'Invalid whatsIncluded JSON', e, 400);
      }
    }
    
    if (templateInfo) {
      try {
        template.templateInfo = JSON.parse(templateInfo);
      } catch (e) {
        return errorResponse(res, 'Invalid templateInfo JSON', e, 400);
      }
    }
    
    if (developmentProcess) {
      try {
        template.developmentProcess = JSON.parse(developmentProcess);
      } catch (e) {
        return errorResponse(res, 'Invalid developmentProcess JSON', e, 400);
      }
    }

    template.updatedAt = Date.now();
    await template.save();

    return successResponse(res, 'Template updated successfully', template);
  } catch (error) {
    console.error('❌ Update template error:', error);
    
    if (error.code === 11000) {
      return errorResponse(res, 'Template with this name already exists', null, 400);
    }
    
    return errorResponse(res, 'Server error while updating template', error);
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return errorResponse(res, 'Template not found', null, 404);
    }

    // ✅ Note: Cloudinary images are not deleted automatically
    // You may want to add Cloudinary deletion logic here if needed
    
    await Template.deleteOne({ _id: req.params.id });
    
    return successResponse(res, 'Template deleted successfully');
  } catch (error) {
    console.error('❌ Delete template error:', error);
    return errorResponse(res, 'Server error while deleting template', error);
  }
};

// Toggle template status
exports.toggleTemplateStatus = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return errorResponse(res, 'Template not found', null, 404);
    }

    template.isActive = !template.isActive;
    template.updatedAt = Date.now();
    await template.save();

    const statusText = template.isActive ? 'activated' : 'deactivated';
    return successResponse(res, `Template ${statusText} successfully`, {
      id: template._id,
      name: template.name,
      isActive: template.isActive,
      updatedAt: template.updatedAt
    });
  } catch (error) {
    console.error('❌ Toggle template status error:', error);
    return errorResponse(res, 'Server error while updating template status', error);
  }
};

// Get admin templates
exports.getAdminTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    const templates = await Template.find(query)
      .sort({ createdAt: -1 }) 
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await Template.countDocuments(query);
    const activeCount = await Template.countDocuments({ isActive: true });
    const inactiveCount = await Template.countDocuments({ isActive: false });

    // ✅ Process image URLs
    const templatesWithFullUrls = templates.map(template => ({
      ...template,
      previewImage: getFullImageUrl(req, template.previewImage)
    }));

    return successResponse(res, 'Admin templates fetched successfully', {
      templates: templatesWithFullUrls,
      stats: {
        total,
        active: activeCount,
        inactive: inactiveCount
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTemplates: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Get admin templates error:', error);
    return errorResponse(res, 'Server error while fetching admin templates', error);
  }
};

// Search templates
exports.searchTemplates = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, limit = 12 } = req.query;
    
    if (!q) {
      return errorResponse(res, 'Search query is required', null, 400);
    }

    let query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const templates = await Template.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    // ✅ Process image URLs
    const templatesWithFullUrls = templates.map(template => ({
      ...template,
      previewImage: getFullImageUrl(req, template.previewImage)
    }));

    return successResponse(res, 'Templates search completed', {
      query: q,
      results: templatesWithFullUrls,
      count: templatesWithFullUrls.length
    });
  } catch (error) {
    console.error('❌ Search templates error:', error);
    return errorResponse(res, 'Server error while searching templates', error);
  }
};


exports.getTemplateByWebsiteId = async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    if (!websiteId || websiteId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Website ID is required'
      });
    }

    const template = await Template.findOne({
      $or: [
        { externalId: websiteId.trim() },
        { publicId: websiteId.trim() },
        { websiteId: websiteId.trim() },
        { slug: websiteId.trim() }
      ]
    }).select('-__v');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found with this Website ID'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template found successfully',
      data: template
    });
  } catch (error) {
    console.error('❌ Get template by website ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// ✅ NEW: Get template by displayId (last 6 chars)
exports.getTemplateByDisplayId = async (req, res) => {
  try {
    const { displayId } = req.params;
    
    if (!displayId || displayId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Display ID is required'
      });
    }

    // Remove #3di- prefix if present
    const cleanId = displayId.replace(/^#?3di-/i, '').trim();
    
    if (cleanId.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Display ID format'
      });
    }

    // Find template where last 6 chars of _id match
    const templates = await Template.find({}).select('-__v');
    
    const template = templates.find(t => 
      t._id.toString().slice(-6).toLowerCase() === cleanId.toLowerCase()
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found with this Display ID'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template found successfully',
      data: template
    });
  } catch (error) {
    console.error('❌ Get template by display ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
