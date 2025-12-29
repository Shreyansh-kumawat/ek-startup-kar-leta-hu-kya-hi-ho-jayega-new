// Frontend\src\services\websiteBookingApi.js
import apiClient from './apiClient';

const BASE_URL = '/website-booking';

// ==================== USER APIS ====================

// Purchase website
export const purchaseWebsite = async (templateDisplayId) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/purchase`, {
      templateDisplayId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to purchase website' };
  }
};

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/my-bookings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking details' };
  }
};

// ==================== ADMIN APIS ====================

// Get all bookings (Admin)
export const getAllBookings = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/admin/all`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Approve booking (Admin)
export const approveBooking = async (bookingId) => {
  try {
    const response = await apiClient.patch(`${BASE_URL}/admin/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve booking' };
  }
};

// Complete booking (Admin)
export const completeBooking = async (bookingId, previewLink) => {
  try {
    const response = await apiClient.patch(`${BASE_URL}/admin/${bookingId}/complete`, {
      previewLink
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to complete booking' };
  }
};

// Get admin stats
export const getAdminStats = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/admin/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch stats' };
  }
};

// Helper functions
export const formatCurrency = (amount) => {
  return `₹${amount?.toLocaleString('en-IN') || 0}`;
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  purchaseWebsite,
  getUserBookings,
  getBookingDetails,
  getAllBookings,
  approveBooking,
  completeBooking,
  getAdminStats,
  formatCurrency,
  formatDate,
  formatDateTime
};
