const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Template = require('../models/Template');
const TemplateBooking = require('../models/TemplateBooking');
const WebsiteBooking = require('../models/WebsiteBooking');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendWelcomeEmail, sendBulkEmailUtil } = require('../utils/emailUtils');

// ✅ Get admin dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalOrders,
      totalTemplates,
      pendingMeetings,
      activeProjects,
      completedProjects,
      recentUsers,
      recentOrders,
      monthlyRevenue,
      weeklyUsers,
      todayOrders
    ] = await Promise.all([
      User.countDocuments(),
      TemplateBooking.countDocuments(),
      Template.countDocuments(),
      TemplateBooking.countDocuments({ status: 'meeting_scheduled' }),
      TemplateBooking.countDocuments({ 
        status: { 
          $in: ['partial_payment_done', 'development_in_progress', 'website_ready'] 
        }
      }),
      TemplateBooking.countDocuments({ status: 'completed' }),
      User.find()
        .select('name username email createdAt role')
        .sort({ createdAt: -1 })
        .limit(5),
      TemplateBooking.find()
        .select('userId templatePrice status createdAt')
        .populate('userId', 'name username')
        .populate('templateId', 'name price')
        .sort({ createdAt: -1 })
        .limit(5),
      TemplateBooking.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$templatePrice' } 
          }
        }
      ]),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      TemplateBooking.countDocuments({ createdAt: { $gte: startOfDay } })
    ]);

    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const orderStatuses = await TemplateBooking.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'completed'] }, 
                '$templatePrice', 
                0
              ] 
            } 
          }
        } 
      }
    ]);

    const [recentMeetings, recentProjects] = await Promise.all([
      TemplateBooking.find({ status: 'meeting_scheduled' })
        .populate('userId', 'name username')
        .sort({ createdAt: -1 })
        .limit(3),
      TemplateBooking.find()
        .populate('userId', 'name username')
        .populate('templateId', 'name')
        .sort({ updatedAt: -1 })
        .limit(3)
    ]);

    const stats = {
      totalUsers,
      totalOrders,
      totalProjects: totalOrders,
      totalTemplates,
      pendingMeetings,
      activeProjects,
      completedProjects,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: orderStatuses.reduce((sum, status) => sum + status.revenue, 0),
      weeklyUsers,
      todayOrders,
      userRoles: userRoles.reduce((acc, role) => {
        acc[role._id || 'user'] = role.count;
        return acc;
      }, {}),
      orderStatuses: orderStatuses.reduce((acc, status) => {
        acc[status._id] = { count: status.count, revenue: status.revenue };
        return acc;
      }, {}),
      recentUsers,
      recentOrders,
      recentMeetings,
      recentProjects
    };

    return successResponse(res, 'Dashboard statistics retrieved successfully', stats);

  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Server error while fetching dashboard statistics', error);
  }
};

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      role, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    const userStats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      inactive: await User.countDocuments({ isActive: false }),
      admins: await User.countDocuments({ role: { $in: ['admin', 'secondaryAdmin'] } }),
      users: await User.countDocuments({ role: 'user' })
    };

    return successResponse(res, 'Users fetched successfully', {
      users,
      stats: userStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 'Server error while fetching users', error);
  }
};

// ✅ Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return errorResponse(res, 'User not found', null, 404);

    const [userOrders, userMeetings] = await Promise.all([
      TemplateBooking.find({ userId: id }).populate('templateId', 'name price').sort({ createdAt: -1 }).limit(10),
      TemplateBooking.find({ userId: id, status: 'meeting_scheduled' }).sort({ createdAt: -1 }).limit(5)
    ]);

    const userStats = {
      totalOrders: userOrders.length,
      completedOrders: userOrders.filter(o => o.status === 'completed').length,
      totalSpent: userOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.templatePrice || 0), 0),
      totalProjects: userOrders.length,
      activeProjects: userOrders.filter(o => ['partial_payment_done','development_in_progress','website_ready'].includes(o.status)).length,
      totalMeetings: userMeetings.length
    };

    return successResponse(res, 'User details fetched successfully', { user, stats: userStats, orders: userOrders, projects: userOrders, meetings: userMeetings });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return errorResponse(res, 'Server error while fetching user details', error);
  }
};

// ✅ Create secondary admin
exports.createSecondaryAdmin = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;
    if (!name || !username || !email || !password)
      return errorResponse(res, 'Name, username, email, and password are required', null, 400);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return errorResponse(res, 'User with this email or username already exists', null, 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = new User({ name, username, email, password: hashedPassword, phone: phone || '', role: 'secondaryAdmin', isActive: true, createdBy: req.user.id });
    await newAdmin.save();

    try {
      await sendWelcomeEmail({
        email: newAdmin.email,
        subject: 'Welcome to 3Digree TBS - Admin Access Granted',
        template: 'admin_welcome',
        data: { name: newAdmin.name, username: newAdmin.username, role: 'Secondary Admin', loginUrl: `${process.env.FRONTEND_URL}/login`, createdBy: req.user.name || req.user.username }
      });
    } catch (emailError) { console.warn('Failed to send welcome email:', emailError.message); }

    return successResponse(res, 'Secondary admin created successfully', {
      user: { id: newAdmin._id, name: newAdmin.name, username: newAdmin.username, email: newAdmin.email, role: newAdmin.role, isActive: newAdmin.isActive, createdAt: newAdmin.createdAt }
    }, 201);
  } catch (error) {
    console.error('Create secondary admin error:', error);
    return errorResponse(res, 'Server error while creating secondary admin', error);
  }
};

// ✅ Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    if (typeof isActive !== 'boolean')
      return errorResponse(res, 'isActive must be a boolean value', null, 400);

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', null, 404);
    if (user.role === 'admin' && !isActive)
      return errorResponse(res, 'Cannot deactivate main admin account', null, 403);
    if (user._id.toString() === req.user.id && !isActive)
      return errorResponse(res, 'You cannot deactivate your own account', null, 403);

    const oldStatus = user.isActive;
    user.isActive = isActive;
    user.statusReason = reason;
    user.statusUpdatedBy = req.user.id;
    user.statusUpdatedAt = new Date();
    user.updatedAt = new Date();
    await user.save();

    if (oldStatus !== isActive) {
      try {
        await sendWelcomeEmail({
          email: user.email,
          subject: `Account ${isActive ? 'Activated' : 'Deactivated'} - 3Digree TBS`,
          template: 'account_status_update',
          data: { name: user.name, status: isActive ? 'Activated' : 'Deactivated', statusMessage: isActive ? 'Your account has been activated.' : 'Your account has been temporarily deactivated.', reason: reason || 'No specific reason provided', contactEmail: process.env.SUPPORT_EMAIL || 'support@3digree.com' }
        });
      } catch (emailError) { console.warn('Failed to send status update email:', emailError.message); }
    }

    return successResponse(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { userId: user._id, name: user.name, username: user.username, email: user.email, isActive: user.isActive, reason, updatedAt: user.updatedAt });
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, 'Server error while updating user status', error);
  }
};

// ✅ Update user credits
exports.updateUserCredits = async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;
    if (typeof credits !== 'number' || credits < 0)
      return errorResponse(res, 'Credits must be a non-negative number', null, 400);

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', null, 404);

    const oldCredits = user.credits || 0;
    user.credits = credits;
    await user.save();

    return successResponse(res, 'Credits updated successfully', { userId: user._id, name: user.name, email: user.email, oldCredits, newCredits: user.credits, diff: user.credits - oldCredits });
  } catch (error) {
    console.error('Update user credits error:', error);
    return errorResponse(res, 'Server error while updating user credits', error);
  }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmDelete, reason } = req.body;
    if (!confirmDelete)
      return errorResponse(res, 'Please confirm deletion by setting confirmDelete to true', null, 400);

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 'User not found', null, 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot delete main admin account', null, 403);
    if (user._id.toString() === req.user.id) return errorResponse(res, 'You cannot delete your own account', null, 403);

    const activeOrders = await TemplateBooking.countDocuments({ userId: id, status: { $in: ['meeting_scheduled','partial_payment_pending','development_in_progress'] } });
    if (activeOrders > 0)
      return errorResponse(res, `Cannot delete user with ${activeOrders} active booking(s).`, null, 400);

    const userInfo = { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role };
    try {
      await sendWelcomeEmail({ email: user.email, subject: 'Account Deleted - 3Digree TBS', template: 'account_deleted', data: { name: user.name, reason: reason || 'Account deletion requested by administrator', contactEmail: process.env.SUPPORT_EMAIL || 'support@3digree.com', deletedAt: new Date().toDateString() } });
    } catch (emailError) { console.warn('Failed to send deletion notification email:', emailError.message); }

    await User.deleteOne({ _id: id });
    return successResponse(res, 'User deleted successfully', { deletedUser: userInfo, reason, deletedAt: new Date(), deletedBy: req.user.id });
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Server error while deleting user', error);
  }
};

// ✅ Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [userStats, orderStats, meetingStats, templateStats, revenueStats, growthStats] = await Promise.all([
      User.aggregate([{ $facet: { total: [{ $count: 'count' }], byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }], byStatus: [{ $group: { _id: '$isActive', count: { $sum: 1 } } }], recent: [{ $match: { createdAt: { $gte: startDate } } }, { $count: 'count' }] } }]),
      TemplateBooking.aggregate([{ $facet: { total: [{ $count: 'count' }], byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }], recent: [{ $match: { createdAt: { $gte: startDate } } }, { $count: 'count' }] } }]),
      TemplateBooking.aggregate([{ $match: { status: 'meeting_scheduled' } }, { $facet: { total: [{ $count: 'count' }], recent: [{ $match: { createdAt: { $gte: startDate } } }, { $count: 'count' }] } }]),
      Template.aggregate([{ $facet: { total: [{ $count: 'count' }], active: [{ $match: { isActive: true } }, { $count: 'count' }], inactive: [{ $match: { isActive: false } }, { $count: 'count' }] } }]),
      TemplateBooking.aggregate([{ $match: { status: 'completed' } }, { $facet: { totalRevenue: [{ $group: { _id: null, total: { $sum: '$templatePrice' } } }], recentRevenue: [{ $match: { createdAt: { $gte: startDate } } }, { $group: { _id: null, total: { $sum: '$templatePrice' } } }], dailyRevenue: [{ $match: { createdAt: { $gte: startDate } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$templatePrice' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }] } }]),
      User.aggregate([{ $match: { createdAt: { $gte: startDate } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, newUsers: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);

    return successResponse(res, 'System statistics fetched successfully', {
      users: { total: userStats[0].total[0]?.count || 0, byRole: userStats[0].byRole.reduce((a, i) => { a[i._id || 'user'] = i.count; return a; }, {}), byStatus: userStats[0].byStatus.reduce((a, i) => { a[i._id ? 'active' : 'inactive'] = i.count; return a; }, {}), recent: userStats[0].recent[0]?.count || 0 },
      orders: { total: orderStats[0].total[0]?.count || 0, byStatus: orderStats[0].byStatus.reduce((a, i) => { a[i._id] = i.count; return a; }, {}), recent: orderStats[0].recent[0]?.count || 0 },
      meetings: { total: meetingStats[0].total[0]?.count || 0, recent: meetingStats[0].recent[0]?.count || 0 },
      templates: { total: templateStats[0].total[0]?.count || 0, active: templateStats[0].active[0]?.count || 0, inactive: templateStats[0].inactive[0]?.count || 0 },
      revenue: { total: revenueStats[0].totalRevenue[0]?.total || 0, recent: revenueStats[0].recentRevenue[0]?.total || 0, daily: revenueStats[0].dailyRevenue },
      growth: { dailyUsers: growthStats },
      period: parseInt(period),
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    return errorResponse(res, 'Server error while fetching system statistics', error);
  }
};

// ✅ Get admin activity log
exports.getAdminActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const activities = [];
    const userUpdates = await User.find({ statusUpdatedBy: { $exists: true }, statusUpdatedAt: { $exists: true } })
      .populate('statusUpdatedBy', 'name username')
      .sort({ statusUpdatedAt: -1 })
      .limit(20);

    userUpdates.forEach(user => {
      activities.push({ type: 'user_status_update', admin: user.statusUpdatedBy, target: { id: user._id, name: user.name, email: user.email }, action: `Updated user status to ${user.isActive ? 'active' : 'inactive'}`, timestamp: user.statusUpdatedAt });
    });
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return successResponse(res, 'Admin activity log fetched successfully', { activities: activities.slice(0, parseInt(limit)), pagination: { currentPage: parseInt(page), totalActivities: activities.length } });
  } catch (error) {
    console.error('Get admin activity log error:', error);
    return errorResponse(res, 'Server error while fetching admin activity log', error);
  }
};

// ==================== BULK EMAIL ====================

// ✅ Send bulk/targeted email to users
exports.sendBulkEmail = async (req, res) => {
  try {
    const { mode, userIds = [], subject, body } = req.body;

    // Validate
    if (!subject || !subject.trim())
      return errorResponse(res, 'Email subject is required', null, 400);
    if (!body || !body.trim())
      return errorResponse(res, 'Email body is required', null, 400);
    if (!['all', 'specific'].includes(mode))
      return errorResponse(res, 'mode must be "all" or "specific"', null, 400);
    if (mode === 'specific' && (!Array.isArray(userIds) || userIds.length === 0))
      return errorResponse(res, 'At least one userId required for specific mode', null, 400);

    // Fetch recipients
    let recipients;
    if (mode === 'all') {
      recipients = await User.find({ isActive: { $ne: false } }).select('name username email').lean();
    } else {
      recipients = await User.find({ _id: { $in: userIds } }).select('name username email').lean();
    }

    if (!recipients || recipients.length === 0)
      return errorResponse(res, 'No valid recipients found', null, 400);

    // Send emails with per-recipient name interpolation
    const results = await sendBulkEmailUtil(recipients, subject, body);

    return successResponse(res, `Bulk email job complete`, {
      total: results.total,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10) // return max 10 error details
    });

  } catch (error) {
    console.error('sendBulkEmail controller error:', error);
    return errorResponse(res, 'Server error while sending bulk email', error);
  }
};
