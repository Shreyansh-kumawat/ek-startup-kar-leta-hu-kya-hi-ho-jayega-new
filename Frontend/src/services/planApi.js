import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const planAPI = axios.create({
  baseURL: `${API_URL}/plans`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
planAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
planAPI.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('❌ Plan API Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        
        case 403:
          throw new Error('Access denied. Admin privileges required.');
        
        case 404:
          throw new Error(data.message || 'Resource not found');
        
        case 400:
          throw new Error(data.message || 'Invalid request');
        
        case 500:
          throw new Error('Server error. Please try again later.');
        
        default:
          throw new Error(data.message || 'Something went wrong');
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// ✅ CREATE PLAN ORDER (Step 1: Get Razorpay Order)
export const createPlanOrder = async (planType) => {
  try {
    console.log('💎 Creating plan order for:', planType);
    
    const response = await planAPI.post('/create-order', { planType });
    
    console.log('✅ Plan order created:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Create plan order failed:', error);
    throw error;
  }
};

// ✅ VERIFY PLAN PAYMENT (Step 2: After Razorpay Success)
export const verifyPlanPayment = async (paymentData) => {
  try {
    console.log('🔐 Verifying plan payment...');
    
    const response = await planAPI.post('/verify-payment', paymentData);
    
    console.log('✅ Payment verified, credits added:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    throw error;
  }
};

// ✅ GET USER'S PLAN PURCHASE HISTORY
export const getMyPlans = async (page = 1, limit = 10) => {
  try {
    console.log('📊 Fetching plan purchase history...');
    
    const response = await planAPI.get('/my-plans', {
      params: { page, limit }
    });
    
    console.log('✅ Purchase history fetched:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch purchase history:', error);
    throw error;
  }
};

// ✅ ADMIN: GET ALL PLAN PURCHASES
export const getAllPlanPurchases = async (status = null, page = 1, limit = 20) => {
  try {
    console.log('📊 Admin fetching all purchases...');
    
    const params = { page, limit };
    if (status) params.status = status;
    
    const response = await planAPI.get('/all-purchases', { params });
    
    console.log('✅ All purchases fetched:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch all purchases:', error);
    throw error;
  }
};

// ✅ LOAD RAZORPAY SCRIPT (Helper function)
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// ✅ OPEN RAZORPAY CHECKOUT (Helper function)
export const openRazorpayCheckout = async (orderData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script if not already loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load payment gateway. Please refresh and try again.');
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key',
      amount: orderData.razorpayOrder.amount,
      currency: orderData.razorpayOrder.currency,
      order_id: orderData.razorpayOrder.id,
      name: '3Digree',
      description: `${orderData.planDetails.planType} Plan - ${orderData.planDetails.credits} Credits`,
      image: 'https://res.cloudinary.com/dwrwqrxbq/image/upload/v1766657966/favicon_njluzi.png', // Your logo
      prefill: {
        name: orderData.customerDetails.name,
        email: orderData.customerDetails.email,
        contact: orderData.customerDetails.phone
      },
      theme: {
        color: '#6498fe'
      },
      handler: async function (response) {
        console.log('✅ Razorpay payment success:', response);
        
        try {
          // Verify payment on backend
          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };
          
          const verifyResponse = await verifyPlanPayment(verificationData);
          
          // Call success callback
          if (onSuccess) {
            onSuccess(verifyResponse);
          }
        } catch (error) {
          console.error('❌ Payment verification failed:', error);
          if (onFailure) {
            onFailure(error);
          }
        }
      },
      modal: {
        ondismiss: function() {
          console.log('⚠️ Payment cancelled by user');
          if (onFailure) {
            onFailure(new Error('Payment cancelled'));
          }
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('❌ Razorpay checkout error:', error);
    if (onFailure) {
      onFailure(error);
    }
  }
};

// Default export
export default {
  createPlanOrder,
  verifyPlanPayment,
  getMyPlans,
  getAllPlanPurchases,
  loadRazorpayScript,
  openRazorpayCheckout
};
