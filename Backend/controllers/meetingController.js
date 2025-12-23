const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Template = require('../models/Template');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { sendWelcomeEmail } = require('../utils/emailUtils');

// Request a meeting (user)
exports.requestMeeting = async (req, res) => {
  try {
    const { title, description, preferredDate, preferredTime, templateId } = req.body;

    // Validate input
    if (!title || !preferredDate || !preferredTime) {
      return errorResponse(res, 'Title, preferred date, and time are required', null, 400);
    }

    // Validate date is in future
    const requestedDate = new Date(preferredDate);
    if (requestedDate < new Date()) {
      return errorResponse(res, 'Preferred date must be in the future', null, 400);
    }

    // Check if template exists (optional)
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
      if (!template) {
        return errorResponse(res, 'Template not found', null, 404);
      }
    }

    // Create new meeting request
    const meeting = new Meeting({
      userId: req.user.id,
      templateId: templateId || null,
      title,
      description,
      preferredDate: requestedDate,
      preferredTime,
      status: 'requested',
      requestedAt: new Date()
    });

    await meeting.save();
    
    // Populate user and template info
    await meeting.populate('userId', 'name username email phone');
    if (templateId) {
      await meeting.populate('templateId', 'name description price');
    }

    // Send notification email to admin
    try {
      await sendWelcomeEmail({
        email: process.env.ADMIN_EMAIL || 'admin@3digree.com',
        subject: 'New Meeting Request - 3Digree TBS',
        template: 'meeting_request',
        data: {
          userName: meeting.userId.name,
          userEmail: meeting.userId.email,
          meetingTitle: title,
          preferredDate: preferredDate,
          preferredTime: preferredTime,
          templateName: template?.name || 'No template specified'
        }
      });
    } catch (emailError) {
      console.warn('Failed to send admin notification:', emailError.message);
    }

    return successResponse(res, 'Meeting request submitted successfully', meeting, 201);
  } catch (error) {
    console.error('Request meeting error:', error);
    return errorResponse(res, 'Server error while submitting meeting request', error);
  }
};

// Get all pending meeting requests (admin only)
exports.getMeetingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'requested' } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    return successResponse(res, 'Meeting requests fetched successfully', {
      meetings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get meeting requests error:', error);
    return errorResponse(res, 'Server error while fetching meeting requests', error);
  }
};

// Schedule a meeting (admin only)
exports.scheduleMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime, meetingLink, notes } = req.body;

    // Validate input
    if (!scheduledDate || !scheduledTime) {
      return errorResponse(res, 'Scheduled date and time are required', null, 400);
    }

    const meeting = await Meeting.findById(id)
      .populate('userId', 'name username email phone');
      
    if (!meeting) {
      return errorResponse(res, 'Meeting request not found', null, 404);
    }

    if (meeting.status !== 'requested') {
      return errorResponse(res, 'Only requested meetings can be scheduled', null, 400);
    }

    // Validate scheduled date is in future
    const scheduledDateTime = new Date(scheduledDate);
    if (scheduledDateTime < new Date()) {
      return errorResponse(res, 'Scheduled date must be in the future', null, 400);
    }

    // Update meeting details
    meeting.status = 'scheduled';
    meeting.scheduledDate = scheduledDateTime;
    meeting.scheduledTime = scheduledTime;
    meeting.meetingLink = meetingLink;
    meeting.adminNotes = notes;
    meeting.scheduledBy = req.user.id;
    meeting.updatedAt = new Date();

    await meeting.save();

    // Send confirmation email to user
    try {
      await sendWelcomeEmail({
        email: meeting.userId.email,
        subject: 'Meeting Scheduled - 3Digree TBS',
        template: 'meeting_scheduled',
        data: {
          userName: meeting.userId.name,
          meetingTitle: meeting.title,
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          meetingLink: meetingLink || 'Link will be provided separately',
          notes: notes || ''
        }
      });
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError.message);
    }

    return successResponse(res, 'Meeting scheduled successfully', meeting);
  } catch (error) {
    console.error('Schedule meeting error:', error);
    return errorResponse(res, 'Server error while scheduling meeting', error);
  }
};

// Get user's meetings
exports.getUserMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate('templateId', 'name description price previewImage')
      .select('-__v')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    // Separate upcoming and past meetings
    const now = new Date();
    const upcomingMeetings = meetings.filter(meeting => 
      meeting.scheduledDate && new Date(meeting.scheduledDate) > now
    );
    const pastMeetings = meetings.filter(meeting => 
      !meeting.scheduledDate || new Date(meeting.scheduledDate) <= now
    );

    return successResponse(res, 'User meetings fetched successfully', {
      meetings,
      upcomingMeetings,
      pastMeetings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMeetings: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user meetings error:', error);
    return errorResponse(res, 'Server error while fetching user meetings', error);
  }
};

// MISSING FUNCTION - ADDED
// Update meeting status (admin only)
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['requested', 'scheduled', 'completed', 'cancelled', 'no-show'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status. Must be one of: requested, scheduled, completed, cancelled, no-show', null, 400);
    }

    const meeting = await Meeting.findById(id)
      .populate('userId', 'name username email phone');
      
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', null, 404);
    }

    const oldStatus = meeting.status;
    
    // Update meeting
    meeting.status = status;
    if (notes) meeting.adminNotes = notes;
    meeting.updatedAt = new Date();

    // Set completion/cancellation date
    if (status === 'completed') {
      meeting.completedAt = new Date();
    } else if (status === 'cancelled') {
      meeting.cancelledAt = new Date();
    }

    await meeting.save();

    // Send status update email to user if status changed significantly
    if (oldStatus !== status && ['completed', 'cancelled'].includes(status)) {
      try {
        await sendWelcomeEmail({
          email: meeting.userId.email,
          subject: `Meeting ${status.charAt(0).toUpperCase() + status.slice(1)} - 3Digree TBS`,
          template: 'meeting_status_update',
          data: {
            userName: meeting.userId.name,
            meetingTitle: meeting.title,
            status: status,
            notes: notes || '',
            statusMessage: status === 'completed' 
              ? 'Your meeting has been completed successfully!' 
              : 'Your meeting has been cancelled.'
          }
        });
      } catch (emailError) {
        console.warn('Failed to send status update email:', emailError.message);
      }
    }

    return successResponse(res, `Meeting status updated to ${status}`, {
      meetingId: meeting._id,
      status: meeting.status,
      updatedAt: meeting.updatedAt,
      user: meeting.userId,
      notes: meeting.adminNotes
    });
  } catch (error) {
    console.error('Update meeting status error:', error);
    return errorResponse(res, 'Server error while updating meeting status', error);
  }
};

// MISSING FUNCTION - ADDED
// Get all meetings (admin only)
exports.getAllMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const meetings = await Meeting.find(query)
      .populate('userId', 'name username email phone')
      .populate('templateId', 'name description price')
      .populate('scheduledBy', 'name username')
      .select('-__v')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);
    
    // Get stats
    
    const stats = {
      total: await Meeting.countDocuments(),
      requested: await Meeting.countDocuments({ status: 'requested' }),
      scheduled: await Meeting.countDocuments({ status: 'scheduled' }),
      completed: await Meeting.countDocuments({ status: 'completed' }),
      cancelled: await Meeting.countDocuments({ status: 'cancelled' })
    };

    // Get upcoming meetings
    const upcomingMeetings = await Meeting.find({
      status: 'scheduled',
      scheduledDate: { $gte: new Date() }
    })
      .populate('userId', 'name username email')
      .sort({ scheduledDate: 1 })
      .limit(5);

    return successResponse(res, 'All meetings fetched successfully', {
      meetings,
      stats,
      upcomingMeetings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMeetings: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all meetings error:', error);
    return errorResponse(res, 'Server error while fetching all meetings', error);
  }
};

// BONUS FUNCTIONS

// Reschedule meeting (admin only)
exports.rescheduleMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return errorResponse(res, 'New date and time are required', null, 400);
    }

    const meeting = await Meeting.findById(id)
      .populate('userId', 'name username email');
      
    if (!meeting) {
      return errorResponse(res, 'Meeting not found', null, 404);
    }

    if (meeting.status !== 'scheduled') {
      return errorResponse(res, 'Only scheduled meetings can be rescheduled', null, 400);
    }

    // Store old details
    const oldDate = meeting.scheduledDate;
    const oldTime = meeting.scheduledTime;

    // Update meeting
    meeting.scheduledDate = new Date(newDate);
    meeting.scheduledTime = newTime;
    meeting.rescheduleReason = reason;
    meeting.rescheduledAt = new Date();
    meeting.updatedAt = new Date();

    await meeting.save();



    // Send reschedule notification to user
    try {
      await sendWelcomeEmail({
        email: meeting.userId.email,
        subject: 'Meeting Rescheduled - 3Digree TBS',
        template: 'meeting_rescheduled',
        data: {
          userName: meeting.userId.name,
          meetingTitle: meeting.title,
          oldDate: oldDate?.toDateString(),
          oldTime: oldTime,
          newDate: newDate,
          newTime: newTime,
          reason: reason || 'Schedule conflict',
          meetingLink: meeting.meetingLink || 'Link will be provided separately'
        }
      });
    } catch (emailError) {
      console.warn('Failed to send reschedule email:', emailError.message);
    }

    return successResponse(res, 'Meeting rescheduled successfully', meeting);
  } catch (error) {
    console.error('Reschedule meeting error:', error);
    return errorResponse(res, 'Server error while rescheduling meeting', error);
  }
};