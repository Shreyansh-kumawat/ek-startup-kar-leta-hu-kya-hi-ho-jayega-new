// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// FIXED: Initialize Razorpay payment
export const initializePayment = async (options) => {
  try {
    // Load Razorpay script if not already loaded
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    
    // Check if Razorpay is available
    if (typeof window.Razorpay === 'undefined') {
      throw new Error('Razorpay SDK not available');
    }

    // FIXED: Check environment variable
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    // console.log('🔍 Razorpay Key Check:', razorpayKey ? 'Key Found' : 'Key Missing');
    
    if (!razorpayKey) {
      throw new Error('Razorpay key not configured in environment variables');
    }
    
    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: razorpayKey, // FIXED: Correct environment variable
        amount: Math.round(options.amount * 100), // FIXED: Convert to paise
        currency: options.currency || 'INR',
        name: import.meta.env.VITE_APP_NAME || '3Digree-TBS',
        description: options.description || 'Template Purchase',
        order_id: options.orderId,
        image: options.image || '/favicon.ico',
        
        // FIXED: Customer details with correct property names
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.phone || '',
        },
        
        // Theme customization
        theme: {
          color: options.themeColor || '#3B82F6',
        },
        
        // Modal configuration
        modal: {
          ondismiss: () => {
            // console.log('💭 Payment cancelled by user');
            reject(new Error('Payment cancelled by user'));
          },
        },
        
        // FIXED: Success callback with correct response format
        handler: (response) => {
          // console.log('✅ Payment Success:', response);
          resolve({
            success: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        
        // Notes (optional)
        notes: options.notes || {},
      };

      
      
      const rzp = new window.Razorpay(razorpayOptions);
      
      // Error handling
      rzp.on('payment.failed', (response) => {
        console.error('❌ Payment Failed:', response.error);
        reject({
          success: false,
          error: response.error.description,
          code: response.error.code,
          metadata: response.error.metadata,
        });
      });
      
      // Open payment modal
      rzp.open();
    });
    
  } catch (error) {
    console.error('❌ Razorpay initialization error:', error);
    throw error;
  }
};

// Keep all other functions same...
export const verifyPayment = async (paymentData, apiClient) => {
  try {
    const response = await apiClient.post('/orders/verify', {
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    });
    
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error.response?.data || error.message;
  }
};

// Rest of your existing functions remain same...
export const createRazorpayOrder = async (orderData, apiClient) => {
  try {
    const response = await apiClient.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error.response?.data || error.message;
  }
};

export const processPayment = async (paymentDetails, apiClient, onProgress) => {
  try {
    // Step 1: Create order
    onProgress && onProgress('Creating order...');
    const orderResponse = await createRazorpayOrder({
      templateId: paymentDetails.templateId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'INR',
    }, apiClient);
    
    // Step 2: Initialize payment
    onProgress && onProgress('Opening payment gateway...');
    const paymentResponse = await initializePayment({
      orderId: orderResponse.data.razorpayOrderId,
      amount: orderResponse.data.amount / 100, // Convert back from paise
      currency: orderResponse.data.currency,
      description: `Template Purchase - ${paymentDetails.templateName}`,
      prefill: {
        name: paymentDetails.customerName,
        email: paymentDetails.customerEmail,
        phone: paymentDetails.customerPhone,
      },
      notes: {
        templateId: paymentDetails.templateId,
        orderId: orderResponse.data.orderId,
      },
    });
    
    // Step 3: Verify payment
    onProgress && onProgress('Verifying payment...');
    const verificationResponse = await verifyPayment(paymentResponse, apiClient);
    
    onProgress && onProgress('Payment completed successfully!');
    
    return {
      success: true,
      orderId: orderResponse.data.orderId,
      paymentId: paymentResponse.razorpay_payment_id,
      verificationData: verificationResponse,
    };
    
  } catch (error) {
    console.error('Payment process error:', error);
    throw error;
  }
};

// Rest remains same...
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const convertToPaise = (amount) => {
  return Math.round(amount * 100);
};

export const convertFromPaise = (amountInPaise) => {
  return amountInPaise / 100;
};

export default {
  initializePayment,
  verifyPayment,
  createRazorpayOrder,
  processPayment,
  PAYMENT_STATUS,
  formatCurrency,
  convertToPaise,
  convertFromPaise,
};
