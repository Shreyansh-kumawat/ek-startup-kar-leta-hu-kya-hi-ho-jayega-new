// Backend\controllers\websiteBookingController.js
const WebsiteBooking = require('../models/WebsiteBooking');
const Template = require('../models/Template');
const User = require('../models/User');

// ==================== USER CONTROLLERS ====================

// @desc    Purchase website using template ID
// @route   POST /api/website-booking/purchase
// @access  Private
exports.purchaseWebsite = async (req, res) => {
  try {
    const { templateDisplayId, meetingDate, meetingTime } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!templateDisplayId || !templateDisplayId.startsWith('#3di-')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format. Use format: #3di-XXXXXX'
      });
    }

    // ✅ FIXED: Extract last 6 characters from displayId
    const last6Chars = templateDisplayId.replace('#3di-', '').toLowerCase();

    // ✅ FIXED: Find template by matching last 6 chars of _id
    const allTemplates = await Template.find({ isActive: true });
    const template = allTemplates.find(t => 
      t._id.toString().slice(-6).toLowerCase() === last6Chars
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found with this ID'
      });
    }

    // ✅ NEW: Get credits required from template
    const creditsRequired = template.creditsRequired || 1;
    // console.log(`💳 Template "${template.name}" requires ${creditsRequired} credits`);

    // ✅ FIXED: Check user exists first
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }

    // ✅ NEW: Check if user has enough credits
    if (user.credits < creditsRequired) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. Required: ${creditsRequired}, Available: ${user.credits}`,
        data: {
          required: creditsRequired,
          available: user.credits,
          shortage: creditsRequired - user.credits
        }
      });
    }

    // ✅ NEW: Deduct correct credits
    user.credits -= creditsRequired;
    await user.save();
    // console.log(`✅ Deducted ${creditsRequired} credits. Remaining: ${user.credits}`);

    // ✅ FIXED: Create booking with meeting details
    const bookingData = {
      userId,
      templateDisplayId,
      templateId: template._id,
      templateName: template.name,
      templateImage: template.previewImage,
      creditsUsed: creditsRequired, // ✅ NEW: Track credits used
      status: 'purchased',
      progress: 10,
      purchasedAt: new Date()
    };

    // ✅ Add meeting details if provided
    if (meetingDate && meetingTime) {
      bookingData.meetingDetails = {
        scheduledDate: meetingDate,
        scheduledTime: meetingTime,
        status: 'scheduled'
      };
    }

    const booking = await WebsiteBooking.create(bookingData);

    res.status(201).json({
      success: true,
      message: meetingDate && meetingTime 
        ? `Website booked! Meeting scheduled for ${meetingDate} at ${meetingTime}. ${creditsRequired} credit${creditsRequired > 1 ? 's' : ''} deducted.`
        : `Website purchased successfully! ${creditsRequired} credit${creditsRequired > 1 ? 's' : ''} deducted.`,
      data: {
        booking,
        remainingCredits: user.credits,
        creditsDeducted: creditsRequired // ✅ NEW: Return credits deducted
      }
    });

  } catch (error) {
    console.error('❌ Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase website',
      error: error.message
    });
  }
};

// @desc    Get user's all bookings
// @route   GET /api/website-booking/my-bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, search } = req.query;

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (search) {
      filter.templateName = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await WebsiteBooking.countDocuments(filter);

    const bookings = await WebsiteBooking.find(filter)
      .populate('templateId', 'name previewImage liveDemo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ FIXED: Match frontend expected structure
    res.json({
      success: true,
      data: {
        bookings: bookings,  // ✅ Nested in data.bookings
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// @desc    Get booking details
// @route   GET /api/website-booking/:bookingId
// @access  Private
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await WebsiteBooking.findById(bookingId)
      .populate('templateId', 'name previewImage liveDemo')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership (unless admin)
    if (booking.userId._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('❌ Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
};

// ==================== ADMIN CONTROLLERS ====================

// @desc    Get all bookings (Admin)
// @route   GET /api/website-booking/admin/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await WebsiteBooking.find(filter)
      .populate('userId', 'name email')
      .populate('templateId', 'name previewImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// @desc    Approve booking & start timer (Admin)
// @route   PATCH /api/website-booking/admin/:bookingId/approve
// @access  Private/Admin
exports.approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await WebsiteBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'purchased') {
      return res.status(400).json({
        success: false,
        message: 'Booking already approved or completed'
      });
    }

    // Set approval time & estimated completion (3 business days = 72 hours)
    const now = new Date();
    const completionTime = new Date(now.getTime() + (72 * 60 * 60 * 1000));

    booking.status = 'inprogress';  // ⬅️ CHANGE TO 'inprogress'
    booking.approvedAt = now;
    booking.estimatedCompletionAt = completionTime;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking approved! Auto-progress timer started (3 business days).',
      data: booking
    });

  } catch (error) {
    console.error('❌ Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
      error: error.message
    });
  }
};

// @desc    Complete booking with preview link (Admin)
// @route   PATCH /api/website-booking/admin/:bookingId/complete
// @access  Private/Admin
exports.completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { previewLink } = req.body;

    if (!previewLink) {
      return res.status(400).json({
        success: false,
        message: 'Preview link is required'
      });
    }

    // Basic URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(previewLink)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preview link format'
      });
    }

    const booking = await WebsiteBooking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking already completed'
      });
    }

    // Update to completed
    booking.status = 'completed';
    booking.progress = 100;
    booking.previewLink = previewLink;
    booking.completedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Booking marked as completed! Preview link added.',
      data: booking
    });

  } catch (error) {
    console.error('❌ Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/website-booking/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const total = await WebsiteBooking.countDocuments();
    const purchased = await WebsiteBooking.countDocuments({ status: 'purchased' });

    const approved = await WebsiteBooking.countDocuments({ status: 'approved' });
    const inProgress = await WebsiteBooking.countDocuments({ 
      status: { $in: ['inprogress', 'readyforcompletion'] } 
    });

    const completed = await WebsiteBooking.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: {
        total,
        purchased,
        approved,
        inProgress,
        completed
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// ✅ NEW: Get dashboard statistics for user
// @desc    Get dashboard stats for logged-in user
// @route   GET /api/website-booking/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalBookings = await WebsiteBooking.countDocuments({ userId });
    const activeBookings = await WebsiteBooking.countDocuments({
      userId,
      status: { $in: ['purchased', 'approved', 'in_progress'] }
    });
    const completedBookings = await WebsiteBooking.countDocuments({
      userId,
      status: 'completed'
    });

    res.json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        completedBookings
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

exports.getUserWebsiteBookings = async (req, res) => {
  try {
    const bookings = await WebsiteBooking.find({ userId: req.user.id })
      .sort({ purchasedAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
