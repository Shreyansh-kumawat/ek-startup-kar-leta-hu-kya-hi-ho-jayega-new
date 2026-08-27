import { supabase } from '../lib/supabase';
import { planApi } from './apiClient';

export const createPlanOrder = async (planType) => {
  const result = await planApi.createOrder(planType);
  return result;
};

export const verifyPlanPayment = async (paymentData) => {
  const result = await planApi.verifyPayment(paymentData);
  return result;
};

export const getMyPlans = async (page = 1, limit = 10) => {
  return planApi.getMyPlans({ page, limit });
};

export const getAllPlanPurchases = async (status = null, page = 1, limit = 20) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('plan_purchases')
    .select('*, profiles!user_id(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const offset = (page - 1) * limit;
  const { data: purchases, count, error } = await query
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    success: true,
    data: {
      purchases,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalPurchases: count || 0,
      },
    },
  };
};

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async (orderData, onSuccess, onFailure) => {
  try {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) throw new Error('Failed to load payment gateway.');

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.razorpayOrder.amount,
      currency: orderData.razorpayOrder.currency,
      order_id: orderData.razorpayOrder.id,
      name: '3Digree',
      description: `${orderData.planDetails.planType} Plan - ${orderData.planDetails.credits} Credits`,
      image: 'https://res.cloudinary.com/dwrwqrxbq/image/upload/v1766657966/favicon_njluzi.png',
      prefill: {
        name: orderData.customerDetails?.name || '',
        email: orderData.customerDetails?.email || '',
        contact: orderData.customerDetails?.phone || '',
      },
      theme: { color: '#6498fe' },
      handler: async function (response) {
        try {
          const verifyResponse = await verifyPlanPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (onSuccess) onSuccess(verifyResponse);
        } catch (error) {
          if (onFailure) onFailure(error);
        }
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure(new Error('Payment cancelled'));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    if (onFailure) onFailure(error);
  }
};

export default {
  createPlanOrder,
  verifyPlanPayment,
  getMyPlans,
  getAllPlanPurchases,
  loadRazorpayScript,
  openRazorpayCheckout,
};
