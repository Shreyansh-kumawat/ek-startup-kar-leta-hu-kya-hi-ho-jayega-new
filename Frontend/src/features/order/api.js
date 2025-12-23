import apiClient from '../../services/apiClient';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/orders/verify', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's orders
export const getUserOrders = async () => {
  try {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await apiClient.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};