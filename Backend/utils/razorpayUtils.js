const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID_TEST,
  key_secret: process.env.RAZORPAY_KEY_SECRET_TEST,
});

// Create a Razorpay order
exports.createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount: Amount must be greater than 0');
    }

    if (!receipt) {
      receipt = `receipt_${Date.now()}`;
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  } catch (error) {
    throw new Error('Failed to create Razorpay order: ' + error.message);
  }
};

// Verify Razorpay payment signature
exports.verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    // Validate input
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Missing required payment details');
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET_TEST)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Compare signatures
    if (generatedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    return { success: true, message: 'Payment signature verified successfully' };
  } catch (error) {
    throw new Error('Failed to verify Razorpay signature: ' + error.message);
  }
};

