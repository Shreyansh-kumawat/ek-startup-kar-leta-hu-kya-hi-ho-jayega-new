const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Order = require('../models/Order');
const Meeting = require('../models/Meeting');
const Project = require('../models/Project');
const Template = require('../models/Template');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendWelcomeEmail } = require('../utils/emailUtils');

// Get admin dashboard statistics
exports.getDashboard = async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Gather comprehensive statistics
    const [
      totalUsers,
      totalOrders,
      totalProjects,
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
      Order.countDocuments(),
      Project.countDocuments(),
      Template.countDocuments(),
      Meeting.countDocuments({ status: 'requested' }),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'completed' }),
      User.find()
        .select('name username email createdAt role')
        .sort({ createdAt: -1 })
        .limit(5),
      Order.find()
        .select('userId amount status createdAt paymentStatus')
        .populate('userId', 'name username')
        .populate('templateId', 'name price')
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      User.countDocuments({ 
        createdAt: { $gte: startOfWeek } 
      }),
      Order.countDocuments({ 
        createdAt: { $gte: startOfDay } 
      })
    ]);

    // Get user role breakdown
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get order status breakdown
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] 
            } 
          }
        }
      }
    ]);

    // Get recent activity summary
    const recentActivity = await Promise.all([
      Meeting.find({ status: 'requested' })
        .populate('userId', 'name username')
        .sort({ createdAt: -1 })
        .limit(3),
      Project.find()
        .populate('userId', 'name username')
        .populate('templateId', 'name')
        .sort({ updatedAt: -1 })
        .limit(3)
    ]);

    const stats = {
      // Main stats
      totalUsers,
      totalOrders,
      totalProjects,
      totalTemplates,
      pendingMeetings,
      activeProjects,
      completedProjects,
      
      // Revenue
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalRevenue: orderStatuses.reduce((sum, status) => sum + status.revenue, 0),
      
      // Growth metrics
      weeklyUsers,
      todayOrders,
      
      // Breakdowns
      userRoles: userRoles.reduce((acc, role) => {
        acc[role._id || 'user'] = role.count;
        return acc;
      }, {}),
      
      orderStatuses: orderStatuses.reduce((acc, status) => {
        acc[status._id] = {
          count: status.count,
          revenue: status.revenue
        };
        return acc;
      }, {}),
      
      // Recent data
      recentUsers,
      recentOrders,
      recentMeetings: recentActivity[0],
      recentProjects: recentActivity[1]
    };

    return successResponse(res, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Server error while fetching dashboard statistics', error);
  }
};

// MISSING FUNCTION - ADDED
// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get user statistics
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

// MISSING FUNCTION - ADDED
// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Get user's related data
    const [userOrders, userProjects, userMeetings] = await Promise.all([
      Order.find({ userId: id })
        .populate('templateId', 'name price')
        .sort({ createdAt: -1 })
        .limit(10),
      Project.find({ userId: id })
        .populate('templateId', 'name price')
        .sort({ createdAt: -1 }),
      Meeting.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const userStats = {
      totalOrders: userOrders.length,
      completedOrders: userOrders.filter(order => order.status === 'completed').length,
      totalSpent: userOrders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.amount, 0),
      totalProjects: userProjects.length,
      activeProjects: userProjects.filter(project => project.status === 'active').length,
      totalMeetings: userMeetings.length
    };

    return successResponse(res, 'User details fetched successfully', {
      user,
      stats: userStats,
      orders: userOrders,
      projects: userProjects,
      meetings: userMeetings
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return errorResponse(res, 'Server error while fetching user details', error);
  }
};

// Create secondary admin (main admin only)
exports.createSecondaryAdmin = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      return errorResponse(res, 'Name, username, email, and password are required', null, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email or username already exists', null, 400);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new secondary admin
    const newAdmin = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'secondaryAdmin',
      isActive: true,
      createdBy: req.user.id
    });

    await newAdmin.save();

    // Send welcome email
    try {
      await sendWelcomeEmail({
        email: newAdmin.email,
        subject: 'Welcome to 3Digree TBS - Admin Access Granted',
        template: 'admin_welcome',
        data: {
          name: newAdmin.name,
          username: newAdmin.username,
          role: 'Secondary Admin',
          loginUrl: `${process.env.FRONTEND_URL}/login`,
          createdBy: req.user.name || req.user.username
        }
      });
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError.message);
    }

    return successResponse(res, 'Secondary admin created successfully', {
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt
      }
    }, 201);
  } catch (error) {
    console.error('Create secondary admin error:', error);
    return errorResponse(res, 'Server error while creating secondary admin', error);
  }
};

// MISSING FUNCTION - ADDED
// Update user status (main admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;

    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 'isActive must be a boolean value', null, 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Prevent deactivating main admin
    if (user.role === 'admin' && !isActive) {
      return errorResponse(res, 'Cannot deactivate main admin account', null, 403);
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user.id && !isActive) {
      return errorResponse(res, 'You cannot deactivate your own account', null, 403);
    }

    const oldStatus = user.isActive;

    // Update user status
    user.isActive = isActive;
    user.statusReason = reason || '';
    user.statusUpdatedBy = req.user.id;
    user.statusUpdatedAt = new Date();
    user.updatedAt = new Date();

    await user.save();

    // Send notification email to user
    if (oldStatus !== isActive) {
      try {
        const statusMessage = isActive 
          ? 'Your account has been activated and you can now access all features.'
          : 'Your account has been temporarily deactivated. Please contact support for more information.';

        await sendWelcomeEmail({
          email: user.email,
          subject: `Account ${isActive ? 'Activated' : 'Deactivated'} - 3Digree TBS`,
          template: 'account_status_update',
          data: {
            name: user.name,
            status: isActive ? 'Activated' : 'Deactivated',
            statusMessage: statusMessage,
            reason: reason || 'No specific reason provided',
            contactEmail: process.env.SUPPORT_EMAIL || 'support@3digree.com'
          }
        });
      } catch (emailError) {
        console.warn('Failed to send status update email:', emailError.message);
      }
    }

    return successResponse(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, {
      userId: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      reason: reason,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, 'Server error while updating user status', error);
  }
};

// MISSING FUNCTION - ADDED
// Delete user (main admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmDelete, reason } = req.body;

    if (!confirmDelete) {
      return errorResponse(res, 'Please confirm deletion by setting confirmDelete to true', null, 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Prevent deleting main admin
    if (user.role === 'admin') {
      return errorResponse(res, 'Cannot delete main admin account', null, 403);
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', null, 403);
    }

    // Check if user has active projects or orders
    const [activeProjects, activeOrders] = await Promise.all([
      Project.countDocuments({ 
        userId: id, 
        status: { $in: ['initiated', 'in_progress', 'review'] } 
      }),
      Order.countDocuments({ 
        userId: id, 
        status: { $in: ['pending', 'processing'] } 
      })
    ]);

    if (activeProjects > 0 || activeOrders > 0) {
      return errorResponse(res, 
        `Cannot delete user with active projects (${activeProjects}) or orders (${activeOrders}). Please complete or cancel them first.`, 
        null, 400
      );
    }

    // Store user info for response
    const userInfo = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Send deletion notification email
    try {
      await sendWelcomeEmail({
        email: user.email,
        subject: 'Account Deleted - 3Digree TBS',
        template: 'account_deleted',
        data: {
          name: user.name,
          reason: reason || 'Account deletion requested by administrator',
          contactEmail: process.env.SUPPORT_EMAIL || 'support@3digree.com',
          deletedAt: new Date().toDateString()
        }
      });
    } catch (emailError) {
      console.warn('Failed to send deletion notification email:', emailError.message);
    }

    // Delete user
    await User.deleteOne({ _id: id });

    return successResponse(res, 'User deleted successfully', {
      deletedUser: userInfo,
      reason: reason,
      deletedAt: new Date(),
      deletedBy: req.user.id
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Server error while deleting user', error);
  }
};

// MISSING FUNCTION - ADDED
// Get system statistics (admin only)
exports.getSystemStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get comprehensive system statistics
    const [
      userStats,
      orderStats,
      projectStats,
      meetingStats,
      templateStats,
      revenueStats,
      growthStats
    ] = await Promise.all([
      // User Statistics
      User.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
            byStatus: [{ $group: { _id: "$isActive", count: { $sum: 1 } } }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Order Statistics
      Order.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            byPayment: [{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Project Statistics
      Project.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Meeting Statistics
      Meeting.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // Template Statistics 
      Template.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { isActive: true } }, { $count: "count" }],
            inactive: [{ $match: { isActive: false } }, { $count: "count" }]
          }
        }
      ]),

      // total Revenue Statistics
      Order.aggregate([
        {
          $match: { paymentStatus: 'paid' }
        },
        {
          $facet: {
            totalRevenue: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
            recentRevenue: [
              { $match: { paymentDate: { $gte: startDate } } },
              { $group: { _id: null, total: { $sum: "$amount" } } }
            ],
            dailyRevenue: [
              { $match: { paymentDate: { $gte: startDate } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
                  revenue: { $sum: "$amount" },
                  orders: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),

      // Growth Statistics
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const systemStats = {
      users: {
        total: userStats[0].total[0]?.count || 0,
        byRole: userStats[0].byRole.reduce((acc, item) => {
          acc[item._id || 'user'] = item.count;
          return acc;
        }, {}),
        byStatus: userStats[0].byStatus.reduce((acc, item) => {
          acc[item._id ? 'active' : 'inactive'] = item.count;
          return acc;
        }, {}),
        recent: userStats[0].recent[0]?.count || 0
      },



      orders: {
        total: orderStats[0].total[0]?.count || 0,
        byStatus: orderStats[0].byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPayment: orderStats[0].byPayment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recent: orderStats[0].recent[0]?.count || 0
      },

      projects: {
        total: projectStats[0].total[0]?.count || 0,
        byStatus: projectStats[0].byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recent: projectStats[0].recent[0]?.count || 0
      },

      meetings: {
        total: meetingStats[0].total[0]?.count || 0,
        byStatus: meetingStats[0].byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recent: meetingStats[0].recent[0]?.count || 0
      },

      templates: {
        total: templateStats[0].total[0]?.count || 0,
        active: templateStats[0].active[0]?.count || 0,
        inactive: templateStats[0].inactive[0]?.count || 0
      },

      revenue: {
        total: revenueStats[0].totalRevenue[0]?.total || 0,
        recent: revenueStats[0].recentRevenue[0]?.total || 0,
        daily: revenueStats[0].dailyRevenue || []
      },

      growth: {
        dailyUsers: growthStats || []
      },

      period: parseInt(period),
      generatedAt: new Date()
    };
    return successResponse(res, 'System statistics fetched successfully', systemStats);
  } catch (error) {
    console.error('Get  system stats error:', error);
    return errorResponse(res, 'Server error while fetching system statistics', error);
  }
};

// BONUS FUNCTIONS

// Get admin activity log
exports.getAdminActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, action, startDate, endDate } = req.query;

    // This would require an ActivityLog model to track admin actions
    // For now, we can return recent activities from various models
    
    const activities = [];
    
    // Get recent user status changes
    const userUpdates = await User.find({
      statusUpdatedBy: { $exists: true },
      statusUpdatedAt: { $exists: true }
    })
    .populate('statusUpdatedBy', 'name username')
    .sort({ statusUpdatedAt: -1 })
    .limit(20);

    userUpdates.forEach(user => {
      activities.push({
        type: 'user_status_update',
        admin: user.statusUpdatedBy,
        target: { id: user._id, name: user.name, email: user.email },
        action: `Updated user status to ${user.isActive ? 'active' : 'inactive'}`,
        timestamp: user.statusUpdatedAt
      });
    });


    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return successResponse(res, 'Admin activity log fetched successfully', {
      activities: activities.slice(0, parseInt(limit)),
      pagination: {
        currentPage: parseInt(page),
        totalActivities: activities.length
      }
    });
  } catch (error) {
    console.error('Get admin activity log error:', error);
    return errorResponse(res, 'Server error while fetching admin activity log', error);
  }
};
