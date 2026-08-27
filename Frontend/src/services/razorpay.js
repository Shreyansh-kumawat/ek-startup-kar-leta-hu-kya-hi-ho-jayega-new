import { planApi } from './apiClient';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializePayment = async (options) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) throw new Error('Failed to load Razorpay SDK');
  if (typeof window.Razorpay === 'undefined') throw new Error('Razorpay SDK not available');

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!razorpayKey) throw new Error('Razorpay key not configured');

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: razorpayKey,
      amount: Math.round(options.amount * 100),
      currency: options.currency || 'INR',
      name: import.meta.env.VITE_APP_NAME || '3Digree-TBS',
      description: options.description || 'Template Purchase',
      order_id: options.orderId,
      image: options.image || '/favicon.ico',
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.phone || '',
      },
      theme: { color: options.themeColor || '#3B82F6' },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by user')),
      },
      handler: (response) => {
        resolve({
          success: true,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      notes: options.notes || {},
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.on('payment.failed', (response) => {
      reject({
        success: false,
        error: response.error.description,
        code: response.error.code,
        metadata: response.error.metadata,
      });
    });
    rzp.open();
  });
};

export const verifyPayment = async (paymentData) => {
  return planApi.verifyPayment(paymentData);
};

export const createRazorpayOrder = async (orderData) => {
  return planApi.createOrder(orderData.planType || orderData.templateId);
};

export const processPayment = async (paymentDetails, _apiClient, onProgress) => {
  onProgress && onProgress('Creating order...');
  const orderResponse = await createRazorpayOrder({
    planType: paymentDetails.planType,
    templateId: paymentDetails.templateId,
    amount: paymentDetails.amount,
  });

  onProgress && onProgress('Opening payment gateway...');
  const paymentResponse = await initializePayment({
    orderId: orderResponse.data?.razorpayOrder?.id || orderResponse.data?.orderId,
    amount: paymentDetails.amount,
    currency: paymentDetails.currency || 'INR',
    description: `Template Purchase - ${paymentDetails.templateName}`,
    prefill: {
      name: paymentDetails.customerName,
      email: paymentDetails.customerEmail,
      phone: paymentDetails.customerPhone,
    },
    notes: { templateId: paymentDetails.templateId },
  });

  onProgress && onProgress('Verifying payment...');
  const verificationResponse = await verifyPayment(paymentResponse);

  onProgress && onProgress('Payment completed successfully!');
  return {
    success: true,
    paymentId: paymentResponse.razorpay_payment_id,
    verificationData: verificationResponse,
  };
};

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
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const convertToPaise = (amount) => Math.round(amount * 100);
export const convertFromPaise = (amountInPaise) => amountInPaise / 100;

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
