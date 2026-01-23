const Razorpay = require('razorpay');
const crypto = require('crypto');
const PlanPurchase = require('../models/Plan');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// ========================================
// INITIALIZE RAZORPAY
// ========================================
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  // // console.log('✅ Razorpay initialized for Plan purchases');
} catch (error) {
  console.error('❌ Razorpay initialization error:', error);
}

// ========================================
// PLAN PRICING CONFIGURATION (IN RUPEES!)
// ========================================
const PLAN_CONFIG = {
  'Starter': { price: 30000, credits: 12 },      // ✅ ₹30,000
  'Growth': { price: 60000, credits: 30 },       // ✅ ₹60,000
  'Scale': { price: 100000, credits: 65 },       // ✅ ₹1,00,000
  'Single Website': { price: 3500, credits: 1 }  // ✅ ₹3,500
};

// ========================================
// CREATE PLAN ORDER
// ========================================
const createPlanOrder = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user.id;

    // // console.log('💎 Creating plan order:', { planType, userId });

    // Validate plan type
    if (!planType || !PLAN_CONFIG[planType]) {
      return errorResponse(res, 'Invalid plan type', null, 400);
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay not initialized');
      return errorResponse(res, 'Payment service not available', null, 500);
    }

    const planDetails = PLAN_CONFIG[planType];
    const amountInRupees = planDetails.price;  // ✅ Amount in Rupees
    const amountInPaise = Math.round(amountInRupees * 100); // ✅ Convert to paise
    const credits = planDetails.credits;

    // Get user details
    const user = await User.findById(userId).select('name email phone');
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: amountInPaise, // ✅ FIXED - Amount in paise
      currency: 'INR',
      receipt: `PLAN_${userId.slice(-6)}_${Date.now().toString().slice(-8)}`,
      notes: {
        userId: userId,
        planType: planType,
        credits: credits,
        userName: user.name
      }
    };

    // // console.log('🔍 Creating Razorpay order:', razorpayOrderOptions);
    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
    // // console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Create plan purchase record
    const planPurchaseData = {
      userId: userId,
      planType: planType,
      planPrice: amountInRupees, // ✅ Store in rupees
      creditsReceived: credits,
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInRupees, // ✅ Store in rupees
        currency: 'INR'
      },
      status: 'created',
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'dashboard'
      }
    };

    const planPurchase = new PlanPurchase(planPurchaseData);
    await planPurchase.save();
    // console.log('✅ Plan purchase record created:', planPurchase.purchaseId);

    return successResponse(res, 'Plan order created successfully', {
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount, // This is in paise
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      planDetails: {
        purchaseId: planPurchase.purchaseId,
        planType: planType,
        price: amountInRupees, // ✅ Return in rupees
        credits: credits
      },
      customerDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    }, 201);

  } catch (error) {
    console.error('❌ Create plan order error:', error);
    console.error('❌ Error stack:', error.stack);
    return errorResponse(res, 'Failed to create plan order', error.message, 500);
  }
};

// ========================================
// VERIFY PLAN PAYMENT
// ========================================
const verifyPlanPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    const userId = req.user.id;

    // console.log('🔐 Verifying plan payment:', { razorpay_order_id, userId });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Missing payment verification data', null, 400);
    }

    // Find plan purchase record
    const planPurchase = await PlanPurchase.findOne({
      userId: userId,
      'paymentDetails.razorpayOrderId': razorpay_order_id,
      status: 'created'
    });

    if (!planPurchase) {
      return errorResponse(res, 'Plan purchase record not found', null, 404);
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      await planPurchase.markAsFailed('Invalid signature');
      return errorResponse(res, 'Payment verification failed', null, 400);
    }

    // console.log('✅ Payment signature verified');

    // Update plan purchase record
    planPurchase.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    planPurchase.paymentDetails.razorpaySignature = razorpay_signature;
    await planPurchase.markAsCompleted({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      verifiedAt: new Date()
    });

    // Apply credits to user
    // console.log('💳 Applying credits to user...');
    const updatedUser = await planPurchase.applyCredits(User);
    // console.log(`✅ Credits applied! New balance: ${updatedUser.credits}`);

    return successResponse(res, 'Payment verified successfully! Credits added to your account.', {
      payment: {
        purchaseId: planPurchase.purchaseId,
        planType: planPurchase.planType,
        creditsReceived: planPurchase.creditsReceived,
        status: planPurchase.status
      },
      user: {
        credits: updatedUser.credits,
        totalCreditsEarned: await PlanPurchase.getTotalCreditsEarned(userId)
      }
    });

  } catch (error) {
    console.error('❌ Verify plan payment error:', error);
    return errorResponse(res, 'Failed to verify payment', error.message, 500);
  }
};

// ========================================
// GET USER'S PLAN PURCHASE HISTORY
// ========================================
const getMyPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // console.log('📊 Getting plan purchase history:', userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await PlanPurchase.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-gatewayResponse');

    const total = await PlanPurchase.countDocuments({ userId });
    const stats = await PlanPurchase.getTotalCreditsEarned(userId);

    return successResponse(res, 'Plan purchase history retrieved successfully', {
      purchases,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPurchases: total,
        hasNext: skip + purchases.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('❌ Get plan history error:', error);
    return errorResponse(res, 'Failed to retrieve plan history', error.message, 500);
  }
};

// ========================================
// ADMIN: GET ALL PLAN PURCHASES
// ========================================
const getAllPlanPurchases = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // console.log('📊 Admin getting all plan purchases');

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await PlanPurchase.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlanPurchase.countDocuments(query);

    const stats = await PlanPurchase.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$planPrice' }
        }
      }
    ]);

    return successResponse(res, 'All plan purchases retrieved successfully', {
      purchases,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPurchases: total
      }
    });

  } catch (error) {
    console.error('❌ Get all purchases error:', error);
    return errorResponse(res, 'Failed to retrieve purchases', error.message, 500);
  }
};
 
module.exports = {
  createPlanOrder,
  verifyPlanPayment,
  getMyPlans,
  getAllPlanPurchases
};
