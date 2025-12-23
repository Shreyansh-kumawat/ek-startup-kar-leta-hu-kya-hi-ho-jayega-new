const Project = require('../models/Project');
const Order = require('../models/Order');
const User = require('../models/User');
const Template = require('../models/Template');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendWelcomeEmail } = require('../utils/emailUtils');

// Get project details (user/admin)
exports.getProjectDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // If userId provided in params, use it (admin access)
    // If not, use current user's ID
    const targetUserId = userId || req.user.id;
    
    // Check if current user can access this project
    const isOwner = targetUserId === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'secondaryAdmin';
    
    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Access denied - You can only view your own projects', null, 403);
    }

    const project = await Project.findOne({ userId: targetUserId })
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price previewImage templateLink')
      .populate('orderId', 'razorpayOrderId amount paymentStatus')
      .select('-__v')
      .sort({ createdAt: -1 });

    if (!project) {
      return errorResponse(res, 'No project found for this user', null, 404);
    }

    return successResponse(res, 'Project details fetched successfully', project);
  } catch (error) {
    console.error('Get project details error:', error);
    return errorResponse(res, 'Server error while fetching project details', error);
  }
};

// MISSING FUNCTION - ADDED
// Get user's projects (user)
exports.getUserProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('templateId', 'name description price previewImage')
      .populate('orderId', 'razorpayOrderId amount paymentStatus paymentDate')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);
    
    // Get project stats for user
    const stats = {
      total: await Project.countDocuments({ userId: req.user.id }),
      initiated: await Project.countDocuments({ userId: req.user.id, status: 'initiated' }),
      inProgress: await Project.countDocuments({ userId: req.user.id, status: 'in_progress' }),
      completed: await Project.countDocuments({ userId: req.user.id, status: 'completed' }),
      active: await Project.countDocuments({ userId: req.user.id, status: 'active' })
    };

    return successResponse(res, 'User projects fetched successfully', {
      projects,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    return errorResponse(res, 'Server error while fetching user projects', error);
  }
};

// MISSING FUNCTION - ADDED
// Get all projects (admin only)
exports.getAllProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      // Search in user name, email, or project name
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { userId: { $in: userIds } },
        { projectName: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('userId', 'name username email phone createdAt')
      .populate('templateId', 'name description price previewImage')
      .populate('orderId', 'razorpayOrderId amount paymentStatus paymentDate')
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);
    
    // Get comprehensive stats
    const stats = {
      total: await Project.countDocuments(),
      initiated: await Project.countDocuments({ status: 'initiated' }),
      inProgress: await Project.countDocuments({ status: 'in_progress' }),
      review: await Project.countDocuments({ status: 'review' }),
      completed: await Project.countDocuments({ status: 'completed' }),
      active: await Project.countDocuments({ status: 'active' }),
      
      // Recent activity
      recentProjects: await Project.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }),
      
      // Revenue related
      completedThisMonth: await Project.countDocuments({
        status: 'completed',
        updatedAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        }
      })
    };

    return successResponse(res, 'All projects fetched successfully', {
      projects,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    return errorResponse(res, 'Server error while fetching all projects', error);
  }
};

// Update project status (admin only)
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['initiated', 'in_progress', 'review', 'completed', 'active', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status. Must be one of: initiated, in_progress, review, completed, active, cancelled', null, 400);
    }

    const project = await Project.findById(id)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price');

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    const oldStatus = project.status;

    // Update project status and notes
    project.status = status;
    if (notes) {
      project.adminNotes = notes;
      // Add to status history
      if (!project.statusHistory) project.statusHistory = [];
      project.statusHistory.push({
        status: status,
        notes: notes,
        updatedBy: req.user.id,
        updatedAt: new Date()
      });
    }
    project.updatedAt = new Date();

    // Set completion date if status is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      project.completedAt = new Date();
    }

    await project.save();

    // Send status update email to user
    try {
      const statusMessages = {
        initiated: 'Your project has been initiated and is in the queue.',
        in_progress: 'Great news! Our team has started working on your project.',
        review: 'Your project is under review and testing. Almost ready!',
        completed: 'Congratulations! Your project has been completed successfully.',
        active: 'Your website is now live and active!',
        cancelled: 'Your project has been cancelled. Please contact support for details.'
      };

      await sendWelcomeEmail({
        email: project.userId.email,
        subject: `Project Status Update - ${project.templateId?.name || 'Your Project'}`,
        template: 'project_status_update',
        data: {
          userName: project.userId.name,
          projectName: project.templateId?.name || 'Your Project',
          oldStatus: oldStatus,
          newStatus: status,
          statusMessage: statusMessages[status],
          notes: notes || '',
          projectId: project._id
        }
      });
    } catch (emailError) {
      console.warn('Failed to send status update email:', emailError.message);
    }

    return successResponse(res, `Project status updated to ${status}`, {
      projectId: project._id,
      status: project.status,
      oldStatus: oldStatus,
      updatedAt: project.updatedAt,
      user: project.userId,
      template: project.templateId,
      notes: notes
    });
  } catch (error) {
    console.error('Update project status error:', error);
    return errorResponse(res, 'Server error while updating project status', error);
  }
};

// MISSING FUNCTION - ADDED
// Update project links (admin only)
exports.updateProjectLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const { previewLink, liveLink, notes } = req.body;

    if (!previewLink && !liveLink) {
      return errorResponse(res, 'At least one link (preview or live) is required', null, 400);
    }

    const project = await Project.findById(id)
      .populate('userId', 'name username email phone');

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Update links
    if (previewLink) project.previewLink = previewLink;
    if (liveLink) project.liveLink = liveLink;
    if (notes) project.adminNotes = notes;
    
    project.updatedAt = new Date();

    // If live link is provided, update status to active
    if (liveLink && project.status !== 'active') {
      project.status = 'active';
      project.activatedAt = new Date();
    }

    await project.save();

    // Send notification email to user
    try {
      const emailData = {
        userName: project.userId.name,
        projectName: project.templateId?.name || 'Your Project',
        notes: notes || ''
      };

      if (previewLink && liveLink) {
        // Both links provided
        await sendWelcomeEmail({
          email: project.userId.email,
          subject: 'Your Website Links Are Ready! 🚀',
          template: 'project_links_ready',
          data: {
            ...emailData,
            previewLink: previewLink,
            liveLink: liveLink,
            message: 'Both preview and live links are now available!'
          }
        });
      } else if (previewLink) {
        // Only preview link
        await sendWelcomeEmail({
          email: project.userId.email,
          subject: 'Preview Link Ready for Review 👀',
          template: 'project_preview_ready',
          data: {
            ...emailData,
            previewLink: previewLink,
            message: 'Your project preview is ready for review!'
          }
        });
      } else if (liveLink) {
        // Only live link
        await sendWelcomeEmail({
          email: project.userId.email,
          subject: 'Your Website is Live! 🎉',
          template: 'project_live',
          data: {
            ...emailData,
            liveLink: liveLink,
            message: 'Congratulations! Your website is now live!'
          }
        });
      }
    } catch (emailError) {
      console.warn('Failed to send links notification email:', emailError.message);
    }

    return successResponse(res, 'Project links updated successfully', {
      projectId: project._id,
      previewLink: project.previewLink,
      liveLink: project.liveLink,
      status: project.status,
      updatedAt: project.updatedAt,
      user: project.userId
    });
  } catch (error) {
    console.error('Update project links error:', error);
    return errorResponse(res, 'Server error while updating project links', error);
  }
};

// Activate website (admin only)
exports.activateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { websiteUrl, domainName, notes } = req.body;

    if (!websiteUrl) {
      return errorResponse(res, 'Website URL is required', null, 400);
    }

    const project = await Project.findById(id)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description');

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Activate website
    project.liveLink = websiteUrl;
    project.domainName = domainName;
    project.status = 'active';
    project.activatedAt = new Date();
    if (notes) project.adminNotes = notes;
    project.updatedAt = new Date();

    await project.save();

    // Send activation email to user
    try {
      await sendWelcomeEmail({
        email: project.userId.email,
        subject: '🎉 Your Website is Now Live!',
        template: 'website_activated',
        data: {
          userName: project.userId.name,
          projectName: project.templateId?.name || 'Your Project',
          websiteUrl: websiteUrl,
          domainName: domainName || websiteUrl,
          notes: notes || '',
          activatedAt: project.activatedAt.toDateString()
        }
      });
    } catch (emailError) {
      console.warn('Failed to send activation email:', emailError.message);
    }

    return successResponse(res, 'Website activated successfully', {
      projectId: project._id,
      websiteUrl: websiteUrl,
      domainName: domainName,
      status: project.status,
      activatedAt: project.activatedAt,
      user: project.userId
    });
  } catch (error) {
    console.error('Activate website error:', error);
    return errorResponse(res, 'Server error while activating website', error);
  }
};

// Add notification (admin only)
exports.addNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type = 'info' } = req.body;

    if (!message) {
      return errorResponse(res, 'Notification message is required', null, 400);
    }

    const project = await Project.findById(id)
      .populate('userId', 'name username email phone');

    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Add notification to project
    if (!project.notifications) project.notifications = [];
    
    const notification = {
      message: message,
      type: type,
      createdBy: req.user.id,
      createdAt: new Date(),
      read: false
    };

    project.notifications.push(notification);
    project.updatedAt = new Date();

    await project.save();

    // Send email notification to user
    try {
      const typeEmojis = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        update: '🔄'
      };

      await sendWelcomeEmail({
        email: project.userId.email,
        subject: `${typeEmojis[type] || 'ℹ️'} Project Notification - ${project.templateId?.name || 'Your Project'}`,
        template: 'project_notification',
        data: {
          userName: project.userId.name,
          projectName: project.templateId?.name || 'Your Project',
          notificationType: type,
          message: message,
          createdAt: notification.createdAt.toDateString()
        }
      });
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError.message);
    }

    return successResponse(res, 'Notification added successfully', {
      projectId: project._id,
      notification: notification,
      user: project.userId
    });
  } catch (error) {
    console.error('Add notification error:', error);
    return errorResponse(res, 'Server error while adding notification', error);
  }
};

// BONUS FUNCTIONS

// Get project notifications (user)
exports.getProjectNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Check if user can access this project
    if (project.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'secondaryAdmin') {
      return errorResponse(res, 'Access denied', null, 403);
    }

    const notifications = project.notifications || [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    return successResponse(res, 'Project notifications fetched successfully', {
      notifications: paginatedNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.length / limit),
        totalNotifications: notifications.length,
        hasNext: endIndex < notifications.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get project notifications error:', error);
    return errorResponse(res, 'Server error while fetching project notifications', error);
  }
};

// Mark notifications as read (user)
exports.markNotificationsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return errorResponse(res, 'Project not found', null, 404);
    }

    // Check if user owns this project
    if (project.userId.toString() !== req.user.id) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    // Mark all notifications as read
    if (project.notifications) {
      project.notifications.forEach(notification => {
        notification.read = true;
      });
      
      project.updatedAt = new Date();
      await project.save();
    }

    return successResponse(res, 'Notifications marked as read', {
      projectId: project._id,
      updatedAt: project.updatedAt
    });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return errorResponse(res, 'Server error while marking notifications as read', error);
  }
};
