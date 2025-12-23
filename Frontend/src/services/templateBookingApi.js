// Frontend/src/services/templateBookingApi.js
import apiClient from './apiClient';

// 🔥 FIX: Remove /api prefix since apiClient already has it
const BASE_URL = '/template-booking';

// 🔥 Public APIs
export const getAvailableMeetingSlots = async (date) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/available-slots`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 🔥 User APIs  
export const bookTemplate = async (templateId, bookingData) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/book/${templateId}`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserBookings = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/my-bookings`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/my-bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addCommunication = async (bookingId, messageData) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/${bookingId}/communication`, messageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 🔥 Admin APIs
export const getAllBookings = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/admin/all`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const setPaymentPercentage = async (bookingId, percentage) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/admin/${bookingId}/payment-percentage`, {
      paymentPercentage: percentage
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateMeetingStatus = async (bookingId, statusData) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/admin/${bookingId}/meeting-status`, statusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateDevelopmentProgress = async (bookingId, progressData) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/admin/${bookingId}/development-progress`, progressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 🔥 NEW: Update Website URLs (After partial payment)
export const updateWebsiteUrls = async (bookingId, { previewUrl, liveUrl, sourceCodeUrl }) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/admin/${bookingId}/website-urls`, {
      previewUrl,
      liveUrl,
      sourceCodeUrl
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Keep existing function for final delivery
export const setFinalWebsiteUrl = async (bookingId, urlData) => {
  try {
    const response = await apiClient.put(`${BASE_URL}/admin/${bookingId}/final-website`, urlData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createPaymentOrder = async (bookingId, paymentType) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/${bookingId}/payment/create`, {
      paymentType
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyPayment = async (bookingId, paymentData) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/${bookingId}/payment/verify`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 🔥 NEW: Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/dashboard-stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPaymentHistory = async (bookingId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${bookingId}/payment/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 🔥 HELPER FUNCTIONS - ADD THESE AT THE END

// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const numAmount = parseFloat(amount);
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

// Date formatting
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-IN', defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

// DateTime formatting
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Time formatting
export const formatTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid Time';
  }
};

// Relative time formatting
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = Math.abs(now - targetDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    return 'N/A';
  }
};

// Text utilities
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Status utilities
export const getStatusColor = (status) => {
  const statusColors = {
    pending: '#fbbf24',
    processing: '#6498fe',
    completed: '#00ffab',
    cancelled: '#ef4444',
    active: '#00ffab',
    inactive: '#9ca3af',
    scheduled: '#6498fe',
    requested: '#f97316',
    meeting_scheduled: '#6498fe',
    meeting_completed: '#00ffab',
    partial_payment_pending: '#fbbf24',
    partial_payment_done: '#8b5cf6',
    development_in_progress: '#6366f1',
    website_ready: '#f97316',
    final_payment_pending: '#ef4444'
  };
  
  return statusColors[status?.toLowerCase()] || '#9ca3af';
};

// ID utilities
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Performance utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// File utilities
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Validation utilities
export const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (file, allowedTypes = []) => {
  return allowedTypes.includes(file.type);
};

// ✅ NEW: Delete booking function
export const deleteBooking = async (bookingId) => {
  try {
    const response = await apiClient.delete(`${BASE_URL}/admin/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// Error utilities
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};
