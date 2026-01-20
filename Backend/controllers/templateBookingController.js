const mongoose = require('mongoose');
const TemplateBooking = require('../models/TemplateBooking');
const Template = require('../models/Template');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const { 
  sendNotificationEmail,
  sendTemplateBookingConfirmation,
  sendPaymentPercentageNotification,
  sendWebsiteReadyNotification
} = require('../utils/emailUtils');
const crypto = require('crypto');
const Razorpay = require('razorpay');



// Predefined Google Meet links (always available)
const PREDEFINED_MEET_links = [
'https://meet.google.com/myu-hrpq-mix',
'https://meet.google.com/pyw-rwve-vgc',
// 'https://meet.google.com/qqz-cxsk-owc',
// 'https://meet.google.com/ytt-phxb-tyx',
// 'https://meet.google.com/aeo-uyrs-hhc'
];

// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  // console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization error:', error);
}

// 🔥 DEBUG: Environment variables check

// 🔥 PAYMENT FUNCTIONS

// Create Payment Order
exports.createPaymentOrder = async (req, res) => {
  try {
    // console.log('🔥 DEBUG: createPaymentOrder function called');
    // console.log('🔍 DEBUG: req.params:', req.params);
    // console.log('🔍 DEBUG: req.body:', req.body);
    // console.log('🔍 DEBUG: req.user:', req.user);
    
    const { bookingId } = req.params;
    const { paymentType } = req.body; // 'partial' or 'final'
    const userId = req.user.id;

    // console.log('💰 Creating payment order:', { bookingId, paymentType, userId });

    // Validate paymentType
    if (!paymentType || !['partial', 'final'].includes(paymentType)) {
      // console.log('❌ Invalid payment type:', paymentType);
      return errorResponse(res, 'Invalid payment type. Must be "partial" or "final"', null, 400);
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return errorResponse(res, 'Payment service not available', null, 500);
    }

    // Find booking
    // console.log('🔍 Looking for booking:', bookingId);
    const booking = await TemplateBooking.findOne({
      _id: bookingId,
      userId
    }).populate('userId', 'name email phone');

    if (!booking) {
      // console.log('❌ Booking not found:', bookingId);
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // console.log('✅ Booking found:', booking._id);
    // console.log('🔍 Booking status:', booking.status);
    // console.log('🔍 Payment details:', booking.paymentDetails);

    // Calculate payment amount
    let paymentAmount = 0;
    let paymentPercentage = 0;

    if (paymentType === 'partial') {
      if (!booking.paymentDetails.paymentPercentage || booking.paymentDetails.paymentPercentage <= 0) {
        // console.log('❌ Payment percentage not set:', booking.paymentDetails.paymentPercentage);
        return errorResponse(res, 'Payment percentage not set by admin yet', null, 400);
      }
      
      paymentAmount = Math.round((booking.paymentDetails.totalAmount * booking.paymentDetails.paymentPercentage) / 100);
      paymentPercentage = booking.paymentDetails.paymentPercentage;
      
      // Check if partial payment already done
      if (booking.paymentDetails.partialPaymentId) {
        // console.log('❌ Partial payment already completed:', booking.paymentDetails.partialPaymentId);
        return errorResponse(res, 'Partial payment already completed', null, 400);
      }
      
    } else if (paymentType === 'final') {
      // Final payment = Total - Already paid
      paymentAmount = booking.paymentDetails.totalAmount - booking.paymentDetails.paidAmount;
      paymentPercentage = 100 - (booking.paymentProgress || 0);
      
      if (paymentAmount <= 0) {
        // console.log('❌ No pending payment required:', paymentAmount);
        return errorResponse(res, 'No pending payment required', null, 400);
      }
      
      // Check if website is ready
      if (booking.status !== 'website_ready' && booking.status !== 'final_payment_pending') {
        // console.log('❌ Website not ready for final payment. Status:', booking.status);
        return errorResponse(res, 'Website is not ready for final payment yet', null, 400);
      }
    }

    // console.log('💰 Payment calculation:', { paymentAmount, paymentPercentage });

    // Create Razorpay order
   const razorpayOrderOptions = {
  amount: Math.round(paymentAmount * 100), // Convert to paise
  currency: 'INR',
  receipt: `${bookingId.slice(-8)}_${paymentType.charAt(0)}_${Date.now().toString().slice(-8)}`, // ✅ SHORT
  notes: {
    bookingId: bookingId,
    userId: userId,
    paymentType: paymentType,
    templateName: booking.templateName,
    paymentPercentage: paymentPercentage
  }
};

    // console.log('🔍 Creating Razorpay order with options:', razorpayOrderOptions);
    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
    // console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Create payment record
    const paymentData = {
      paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderId: razorpayOrder.receipt,
      bookingId: bookingId,
      userId: userId,
      razorpay: {
        orderId: razorpayOrder.id,
        paymentId: '', // Will be filled after payment
        signature: '' // Will be filled after verification
      },
      amount: paymentAmount,
      currency: 'INR',
      paymentType: paymentType,
      paymentPercentage: paymentPercentage,
      status: 'created',
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    };

    // console.log('🔍 Creating payment record:', paymentData);
    const payment = new Payment(paymentData);
    await payment.save();
    // console.log('✅ Payment record saved:', payment.paymentId);

    // Add order to booking's razorpayOrderIds array
    booking.paymentDetails.razorpayOrderIds.push({
      orderId: razorpayOrder.id,
      amount: paymentAmount,
      paymentType: paymentType,
      status: 'created'
    });
    await booking.save();
    // console.log('✅ Booking updated with Razorpay order');

    // console.log('✅ Payment order created successfully:', razorpayOrder.id);

    return successResponse(res, 'Payment order created successfully', {
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      paymentDetails: {
        paymentId: payment.paymentId,
        amount: paymentAmount,
        paymentType: paymentType,
        paymentPercentage: paymentPercentage,
        bookingId: bookingId,
        templateName: booking.templateName
      },
      customerDetails: {
        name: booking.userId.name,
        email: booking.userId.email,
        phone: booking.userId.phone
      }
    }, 201);

  } catch (error) {
    console.error('❌ Create payment order error:', error);
    console.error('❌ Error stack:', error.stack);
    return errorResponse(res, 'Failed to create payment order', error.message, 500);
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    const userId = req.user.id;

   

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Missing payment verification data', null, 400);
    }

    // Find payment record
    const payment = await Payment.findOne({
      bookingId: bookingId,
      userId: userId,
      'razorpay.orderId': razorpay_order_id,
      status: 'created'
    });

    if (!payment) {
      return errorResponse(res, 'Payment record not found', null, 404);
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      
      await payment.markAsFailed('Invalid signature');
      
      return errorResponse(res, 'Payment verification failed', null, 400);
    }

    // Find booking
    const booking = await TemplateBooking.findById(bookingId)
      .populate('userId', 'name email');

    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Update payment record
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;
    await payment.markAsCompleted({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      verifiedAt: new Date()
    });

    // Update booking payment details
    await booking.recordPayment(razorpay_payment_id, payment.amount, payment.paymentType);

    // Add communication log
    await booking.addCommunication(
      'payment',
      `Payment of ₹${payment.amount} completed for ${payment.paymentType} payment (${payment.paymentPercentage}%)`,
      userId,
      false
    );

    // console.log('✅ Payment verified and recorded successfully');

    return successResponse(res, 'Payment verified successfully', {
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        paymentType: payment.paymentType,
        status: payment.status
      },
      booking: {
        id: booking._id,
        status: booking.status,
        paymentProgress: booking.paymentProgress,
        remainingAmount: booking.remainingAmount
      }
    });

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    return errorResponse(res, 'Failed to verify payment', error.message, 500);
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // console.log('📊 Getting payment history:', { bookingId, userId });

    // Verify booking access
    const booking = await TemplateBooking.findOne({
      _id: bookingId,
      userId
    });

    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Get payment history
    const payments = await Payment.findByBooking(bookingId);

    return successResponse(res, 'Payment history retrieved successfully', {
      payments,
      paymentSummary: {
        totalAmount: booking.paymentDetails.totalAmount,
        paidAmount: booking.paymentDetails.paidAmount,
        remainingAmount: booking.remainingAmount,
        paymentProgress: booking.paymentProgress
      }
    });

  } catch (error) {
    console.error('❌ Get payment history error:', error);
    return errorResponse(res, 'Failed to get payment history', error.message, 500);
  }
};

// 🔥 BOOKING FUNCTIONS

// Get available meeting link (not busy)
const getAvailableMeetingLink = async (scheduledDate, scheduledTime) => {
  try {
    // Check which links are already booked for this date/time
    const bookedMeetings = await TemplateBooking.find({
      'meetingDetails.scheduledDate': scheduledDate,
      'meetingDetails.scheduledTime': scheduledTime,
      'meetingDetails.meetingStatus': { $in: ['scheduled', 'completed'] }
    }).select('meetingDetails.meetingLink');

    const busyLinks = bookedMeetings.map(booking => booking.meetingDetails.meetingLink);
    
    // Find first available link
    const availableLink = PREDEFINED_MEET_LINKS.find(link => !busyLinks.includes(link));
    
    return availableLink || PREDEFINED_MEET_LINKS[0]; // Fallback to first link
  } catch (error) {
    console.error('Error getting available meeting link:', error);
    return PREDEFINED_MEET_LINKS[0]; // Fallback
  }
};

// ✅ UPDATED: Book Template with Credit System
exports.bookTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { scheduledDate, scheduledTime, additionalRequirements } = req.body;
    const userId = req.user.id;

    // console.log('📝 Booking template:', templateId, userId, scheduledDate, scheduledTime);

    // Validate input
    if (!scheduledDate || !scheduledTime) {
      return errorResponse(res, 'Scheduled date and time are required', null, 400);
    }

    // Check if date is at least 24 hours from now
    const requestedDateTime = new Date(`${scheduledDate} ${scheduledTime}`);
    const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (requestedDateTime < minDateTime) {
      return errorResponse(res, 'Meeting must be scheduled at least 24 hours in advance', null, 400);
    }

    // Get template details
    const template = await Template.findById(templateId);
    if (!template || !template.isActive) {
      return errorResponse(res, 'Template not found or not available', null, 404);
    }

    // ✅ NEW: Get user to check credits
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // ✅ NEW: Check if user has enough credits
    const requiredCredits = template.creditsRequired || 1;
    if (user.credits < requiredCredits) {
      return errorResponse(res, 
        `Insufficient credits. This ${template.withBackend ? 'backend-enabled ' : ''}website requires ${requiredCredits} credit${requiredCredits > 1 ? 's' : ''}, but you only have ${user.credits} credit${user.credits !== 1 ? 's' : ''}. Please purchase a plan to continue.`, 
        null, 
        400
      );
    }

    // Check if user already has a booking for this template
    const existingBooking = await TemplateBooking.findOne({
      userId,
      templateId,
      status: { $nin: ['completed', 'cancelled'] }
    });

    if (existingBooking) {
      return errorResponse(res, 'You already have an active booking for this template', null, 400);
    }

    // Get available meeting link
    const meetingLink = await getAvailableMeetingLink(scheduledDate, scheduledTime);

   // Create template booking
const templateBooking = new TemplateBooking({
  userId,
  templateId,
  templateName: template.name,
  templatePrice: template.price,
  meetingDetails: {
    scheduledDate: new Date(scheduledDate),
    scheduledTime,
    meetingLink,
    meetingStatus: 'scheduled',
    additionalRequirements: additionalRequirements || ''
  },
  paymentDetails: {
    totalAmount: template.price,
    paidAmount: 0,
    paymentPercentage: 0
  },
  developmentStatus: {
    stage: 'not_started',
    progress: 0
  },
  status: 'meeting_scheduled',
  metadata: {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
    sourceChannel: 'website',
    creditsUsed: requiredCredits, // ✅ NEW: Track credits used
    withBackend: template.withBackend || false // ✅ NEW: Track if backend website
  }
});

await templateBooking.save();

// ✅ NEW: Deduct credits from user
user.credits -= requiredCredits;
await user.save();

// Populate for response
await templateBooking.populate('userId', 'name email');
await templateBooking.populate('templateId', 'name previewImage');

// Add communication log
await templateBooking.addCommunication(
  'meeting',
  `Meeting scheduled for ${scheduledDate} at ${scheduledTime}. ${requiredCredits} credit(s) deducted.`,
  userId,
  false
);

// console.log('✅ Template booking created successfully:', templateBooking._id);

// 🔥 SEND RESPONSE FIRST
res.status(201).json({
  success: true,
  message: `Template booked successfully! ${requiredCredits} credit(s) used. Remaining credits: ${user.credits}`,
  data: {
    booking: templateBooking,
    bookingId: templateBooking.bookingId,
    meetingLink: templateBooking.meetingDetails.meetingLink,
    creditsUsed: requiredCredits,
    remainingCredits: user.credits
  }
});

// 🔥 SEND EMAIL AFTER (NON-BLOCKING)
setImmediate(async () => {
  try {
    const userWithEmail = await User.findById(userId);
    if (userWithEmail && userWithEmail.email) {
      await sendTemplateBookingConfirmation(userWithEmail, templateBooking);
      // console.log('✅ Booking confirmation email sent to:', userWithEmail.email);
    }
  } catch (emailError) {
    console.error('❌ Email notification error:', emailError.message);
  }
});

  } catch (error) {
    console.error('❌ Book template error:', error);
    return errorResponse(res, 'Failed to book template', error.message, 500);
  }
};

// Get User's Template Bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // console.log('📋 Getting user bookings:', { userId, status, page, limit });

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with corrected population
    const bookings = await TemplateBooking.find(query)
      .populate('templateId', 'name previewImage category')
      .populate('adminSettings.assignedAdmin', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await TemplateBooking.countDocuments(query);

    const response = {
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total,
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    };

    // console.log('✅ Retrieved user bookings:', bookings.length);
    return successResponse(res, 'Bookings retrieved successfully', response);

  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    return errorResponse(res, 'Failed to retrieve bookings', error.message, 500);
  }
};

// Get Single Booking Details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // console.log('🔍 Getting booking details:', { bookingId, userId });

    const booking = await TemplateBooking.findOne({
      _id: bookingId,
      userId
    })
    .populate('templateId', 'name previewImage description liveDemo')
    .populate('userId', 'name email phone')
    .populate('adminSettings.assignedAdmin', 'name email')
    .populate('communications.createdBy', 'name');

    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // console.log('✅ Retrieved booking details:', booking._id);
    return successResponse(res, 'Booking details retrieved successfully', { booking });

  } catch (error) {
    console.error('❌ Get booking details error:', error);
    return errorResponse(res, 'Failed to retrieve booking details', error.message, 500);
  }
};

// 🔥 ADMIN FUNCTIONS

// Admin: Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    // console.log('📋 Admin getting all bookings:', { status, page, limit, search });

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { templateName: { $regex: search, $options: 'i' } },
        { 'meetingDetails.additionalRequirements': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings
    const bookings = await TemplateBooking.find(query)
      .populate('userId', 'name email phone')
      .populate('templateId', 'name previewImage')
      .populate('adminSettings.assignedAdmin', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await TemplateBooking.countDocuments(query);

    // Get booking stats
    const stats = await TemplateBooking.getBookingStats();

    const response = {
      bookings,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBookings: total,
        hasNext: skip + bookings.length < total,
        hasPrev: parseInt(page) > 1
      }
    };

    // console.log('✅ Retrieved all bookings:', bookings.length);
    return successResponse(res, 'All bookings retrieved successfully', response);

  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    return errorResponse(res, 'Failed to retrieve bookings', error.message, 500);
  }
};

// Admin: Set Payment Percentage
exports.setPaymentPercentage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentPercentage } = req.body;
    const adminId = req.user.id;

    // console.log('💰 Setting payment percentage:', { bookingId, paymentPercentage, adminId });

    // Validate percentage
    if (!paymentPercentage || paymentPercentage < 0 || paymentPercentage > 100) {
      return errorResponse(res, 'Payment percentage must be between 0 and 100', null, 400);
    }

    // Find booking
    const booking = await TemplateBooking.findById(bookingId)
      .populate('userId', 'name email');

    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Check if meeting is completed
    if (booking.meetingDetails.meetingStatus !== 'completed') {
      return errorResponse(res, 'Meeting must be completed before setting payment percentage', null, 400);
    }

    // Set payment percentage using model method
    await booking.setPaymentPercentage(paymentPercentage, adminId);

    // Calculate payment amount
    const paymentAmount = booking.currentPaymentAmount;

    // Add communication log
    await booking.addCommunication(
      'payment',
      `Payment percentage set to ${paymentPercentage}% (₹${paymentAmount})`,
      adminId,
      true
    );

    // Send email notification to user
    try {
      if (booking.userId && booking.userId.email) {
        await sendPaymentPercentageNotification(booking.userId, booking, paymentAmount);
        // console.log(`✅ Payment percentage notification email sent to ${booking.userId.email}`);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the operation if email fails
    }

    // console.log('✅ Payment percentage set successfully:', paymentPercentage);

    return successResponse(res, 'Payment percentage set successfully', {
      booking,
      currentPaymentAmount: paymentAmount
    });

  } catch (error) {
    console.error('❌ Set payment percentage error:', error);
    return errorResponse(res, 'Failed to set payment percentage', error.message, 500);
  }
};

// Admin: Update Meeting Status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { meetingStatus, meetingNotes } = req.body;
    const adminId = req.user.id;

    // console.log('📅 Updating meeting status:', { bookingId, meetingStatus, adminId });

    // Find booking
    const booking = await TemplateBooking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Update meeting status
    booking.meetingDetails.meetingStatus = meetingStatus;
    if (meetingNotes) {
      booking.meetingDetails.meetingNotes = meetingNotes;
    }

    // Update booking status if meeting completed
    if (meetingStatus === 'completed') {
      booking.status = 'meeting_completed';
    }

    await booking.save();

    // Add communication log
    await booking.addCommunication(
      'meeting',
      `Meeting status updated to ${meetingStatus}${meetingNotes ? `: ${meetingNotes}` : ''}`,
      adminId,
      true
    );

    // console.log('✅ Meeting status updated successfully');

    return successResponse(res, 'Meeting status updated successfully', { booking });

  } catch (error) {
    console.error('❌ Update meeting status error:', error);
    return errorResponse(res, 'Failed to update meeting status', error.message, 500);
  }
};

// Admin: Update Development Progress
exports.updateDevelopmentProgress = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { progress, stage, developerNotes, websitePreviewUrl } = req.body;
    const adminId = req.user.id;

    // console.log('🚀 Updating development progress:', { bookingId, progress, stage });

    // Find booking
    const booking = await TemplateBooking.findById(bookingId)
      .populate('userId', 'name email');

    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Update development progress using model method
    await booking.updateDevelopmentProgress(progress, stage, developerNotes);

    // Update website preview URL if provided
    if (websitePreviewUrl) {
      booking.websiteUrls.previewUrl = websitePreviewUrl;
      await booking.save();
    }

    // Add communication log
    await booking.addCommunication(
      'development',
      `Development progress updated to ${progress}% (${stage})${developerNotes ? `: ${developerNotes}` : ''}`,
      adminId,
      true
    );

    // Send email notification if website is ready
    if (stage === 'completed' && booking.userId && booking.userId.email) {
      try {
        await sendWebsiteReadyNotification(booking.userId, booking);
        // console.log(`✅ Website ready notification email sent to ${booking.userId.email}`);
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    // console.log('✅ Development progress updated successfully');

    return successResponse(res, 'Development progress updated successfully', { booking });

  } catch (error) {
    console.error('❌ Update development progress error:', error);
    return errorResponse(res, 'Failed to update development progress', error.message, 500);
  }
};


// ✅ FIXED: Update Website URLs (Remove status restriction)
exports.updateWebsiteUrls = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { previewUrl, liveUrl, sourceCodeUrl } = req.body;
    const adminId = req.user.id;
    
    // console.log('🔗 Updating website URLs:', bookingId, { previewUrl, liveUrl, sourceCodeUrl });
    
    // Find booking
    const booking = await TemplateBooking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }
    
    // ✅ REMOVED: Status restriction - URLs can be updated anytime
    // Old restriction code removed
    
    // Update website URLs
    if (previewUrl) booking.websiteUrls.previewUrl = previewUrl;
    if (liveUrl) booking.websiteUrls.finalUrl = liveUrl;
    if (sourceCodeUrl) booking.websiteUrls.downloadUrl = sourceCodeUrl;
    
    // ✅ UPDATE STATUS: Set to 'websiteready' if all URLs provided
    if (previewUrl && liveUrl && sourceCodeUrl) {
      booking.status = 'websiteready';
      booking.developmentProgress.stage = 'completed';
      booking.developmentProgress.progress = 100;
      booking.developmentProgress.completedAt = new Date();
    } else if (previewUrl) {
      booking.status = 'developmentinprogress';
    }
    
    await booking.save();
    
    // Add communication log
    const urlsUpdated = [
      previewUrl ? 'Preview' : null,
      liveUrl ? 'Live' : null,
      sourceCodeUrl ? 'Source Code' : null
    ].filter(Boolean);
    
    await booking.addCommunication(
      'development',
      `Website URLs updated: ${urlsUpdated.join(', ')}`,
      adminId,
      true
    );
    
    // console.log('✅ Website URLs updated successfully');
    
    return successResponse(res, 'Website URLs updated successfully', booking);
    
  } catch (error) {
    console.error('❌ Update website URLs error:', error);
    return errorResponse(res, 'Failed to update website URLs', error.message, 500);
  }
};


// Admin: Set Final Website URL
exports.setFinalWebsiteUrl = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { finalUrl, downloadUrl } = req.body;
    const adminId = req.user.id;

    // console.log('🌐 Setting final website URL:', { bookingId, finalUrl });

    // Find booking
    const booking = await TemplateBooking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // 🔥 FIXED: Check if FINAL payment is completed (not partial)
    const remainingAmount = booking.paymentDetails.totalAmount - booking.paymentDetails.paidAmount;
    if (remainingAmount > 0) {
      return errorResponse(res, 'Final payment must be completed before releasing live website access', null, 400);
    }

    // ✅ ONLY update final URLs - keep existing preview
    if (finalUrl) booking.websiteUrls.finalUrl = finalUrl;
    if (downloadUrl) booking.websiteUrls.downloadUrl = downloadUrl;
    
    booking.status = 'completed';

    await booking.save();

    // Add communication log
    await booking.addCommunication(
      'delivery',
      `Project completed! Live website and source code delivered.`,
      adminId,
      true
    );

    // console.log('✅ Final website URLs set successfully');

    return successResponse(res, 'Project completed! Website delivered successfully.', { booking });

  } catch (error) {
    console.error('❌ Set final website URL error:', error);
    return errorResponse(res, 'Failed to complete website delivery', error.message, 500);
  }
};

// Get Available Meeting Slots
exports.getAvailableMeetingSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, 'Date parameter is required', null, 400);
    }

    // console.log('📅 Getting available meeting slots for:', date);

    // Available time slots
    const timeSlots = [
      '10:00', '11:00', '12:00',
      '15:00', '16:00', '19:00', '20:00'
    ];

    // Get booked meetings for this date
    const bookedMeetings = await TemplateBooking.find({
      'meetingDetails.scheduledDate': new Date(date),
      'meetingDetails.meetingStatus': { $in: ['scheduled', 'completed'] }
    }).select('meetingDetails.scheduledTime meetingDetails.meetingLink');

    // Count bookings per time slot
    const slotCounts = {};
    bookedMeetings.forEach(meeting => {
      const time = meeting.meetingDetails.scheduledTime;
      slotCounts[time] = (slotCounts[time] || 0) + 1;
    });

    // Determine available slots (max 5 meetings per slot = number of predefined links)
    const availableSlots = timeSlots.map(time => ({
      time,
      available: (slotCounts[time] || 0) < PREDEFINED_MEET_LINKS.length,
      bookedCount: slotCounts[time] || 0,
      maxSlots: PREDEFINED_MEET_LINKS.length
    }));

    return successResponse(res, 'Available meeting slots retrieved', {
      date,
      slots: availableSlots
    });

  } catch (error) {
    console.error('❌ Get available meeting slots error:', error);
    return errorResponse(res, 'Failed to get available meeting slots', error.message, 500);
  }
};

// Add Communication Message
exports.addCommunication = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message, type = 'other' } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'secondaryAdmin';

    // console.log('💬 Adding communication:', { bookingId, type, userId, isAdmin });

    if (!message || !message.trim()) {
      return errorResponse(res, 'Message is required', null, 400);
    }

    // Find booking
    const booking = await TemplateBooking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }

    // Check access - user can only access their own bookings, admins can access all
    if (!isAdmin && booking.userId.toString() !== userId) {
      return errorResponse(res, 'Access denied', null, 403);
    }

    // Add communication
    await booking.addCommunication(type, message.trim(), userId, isAdmin);

    // console.log('✅ Communication added successfully');

    return successResponse(res, 'Message added successfully', { booking });

  } catch (error) {
    console.error('❌ Add communication error:', error);
    return errorResponse(res, 'Failed to add message', error.message, 500);
  }
};

// // // // 
// 🔥 NEW: Get Dashboard Stats for User
// 🔥 NEW: Get Dashboard Stats for User
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // console.log('📊 Getting dashboard stats for user:', userId);

    // Get recent bookings (last 5)
    const recentBookings = await TemplateBooking.find({ userId })
      .populate('templateId', 'name previewImage category')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming meetings
    const upcomingMeetings = await TemplateBooking.find({
      userId,
      'meetingDetails.meetingStatus': 'scheduled',
      'meetingDetails.scheduledDate': { $gte: new Date() }
    })
    .populate('templateId', 'name')
    .sort({ 'meetingDetails.scheduledDate': 1 })
    .limit(3);

    // Get booking counts by status
    const bookingStats = await TemplateBooking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$paymentDetails.totalAmount' },
          paidAmount: { $sum: '$paymentDetails.paidAmount' }
        }
      }
    ]);

    // Calculate total stats
    const totalBookings = await TemplateBooking.countDocuments({ userId });
    const totalSpent = await TemplateBooking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$paymentDetails.paidAmount' } } }
    ]);

    // Get recent activities (last 10 communications)
    const recentActivities = await TemplateBooking.find({ userId })
      .populate('templateId', 'name')
      .sort({ 'communications.createdAt': -1 })
      .limit(10)
      .select('templateName communications status createdAt')
      .then(bookings => {
        const activities = [];
        bookings.forEach(booking => {
          if (booking.communications && booking.communications.length > 0) {
            booking.communications.slice(-3).forEach(comm => {
              activities.push({
                action: comm.type === 'payment' ? 'Payment completed' : 
                        comm.type === 'meeting' ? 'Meeting scheduled' :
                        comm.type === 'development' ? 'Project updated' : 'Activity',
                item: booking.templateName,
                time: formatRelativeTime(comm.createdAt),
                type: comm.type,
                avatar: comm.type === 'payment' ? '💰' : 
                        comm.type === 'meeting' ? '📅' : 
                        comm.type === 'development' ? '🔄' : '📌',
                createdAt: comm.createdAt
              });
            });
          }
        });
        return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      });

    const dashboardData = {
      stats: {
        totalBookings,
        totalSpent: totalSpent[0]?.total || 0,
        upcomingMeetings: upcomingMeetings.length,
        activeProjects: recentBookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length
      },
      recentBookings,
      upcomingMeetings,
      recentActivities,
      bookingStats
    };

    // console.log('✅ Dashboard stats retrieved successfully');
    return successResponse(res, 'Dashboard stats retrieved successfully', dashboardData);

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to retrieve dashboard stats', error.message, 500);
  }
};

// Helper function for relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(now - targetDate);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString();
};

// ✅ NEW: Delete Booking Function
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminId = req.user.id;
    
    // console.log('🗑️ Deleting booking:', bookingId, 'by admin:', adminId);
    
    // Find booking
    const booking = await TemplateBooking.findById(bookingId)
      .populate('userId', 'name email');
    
    if (!booking) {
      return errorResponse(res, 'Booking not found', null, 404);
    }
    
    // Check if booking can be deleted (optional business logic)
    if (booking.status === 'completed') {
      return errorResponse(res, 'Cannot delete completed bookings', null, 400);
    }
    
    // Delete related payments (optional - or keep for audit)
    // await Payment.deleteMany({ bookingId: bookingId });
    
    // Delete the booking
    await TemplateBooking.findByIdAndDelete(bookingId);
    
    // console.log('✅ Booking deleted successfully:', bookingId);
    
    return successResponse(res, 'Booking deleted successfully', {
      deletedBooking: {
        id: booking._id,
        templateName: booking.templateName,
        customerName: booking.userId?.name,
        status: booking.status
      }
    });
    
  } catch (error) {
    console.error('❌ Delete booking error:', error);
    return errorResponse(res, 'Failed to delete booking', error.message, 500);
  }
};

////////

module.exports = {
  createPaymentOrder: exports.createPaymentOrder,
  verifyPayment: exports.verifyPayment,
  getPaymentHistory: exports.getPaymentHistory,
  bookTemplate: exports.bookTemplate,
  getUserBookings: exports.getUserBookings,
  getBookingDetails: exports.getBookingDetails,
  getAllBookings: exports.getAllBookings,
  setPaymentPercentage: exports.setPaymentPercentage,
  updateMeetingStatus: exports.updateMeetingStatus,
  updateDevelopmentProgress: exports.updateDevelopmentProgress,
  updateWebsiteUrls: exports.updateWebsiteUrls,
  setFinalWebsiteUrl: exports.setFinalWebsiteUrl,
  getAvailableMeetingSlots: exports.getAvailableMeetingSlots,
  addCommunication: exports.addCommunication,
  getDashboardStats: exports.getDashboardStats,
  deleteBooking: exports.deleteBooking
};
