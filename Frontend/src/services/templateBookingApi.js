// Frontend/src/services/templateBookingApi.js
import apiClient from './apiClient';

const BASE_URL = '/website-booking';

// ==================== USER APIs ====================

// ✅ FIXED: Purchase with meeting details
export const purchaseWebsite = async (templateDisplayId, meetingDetails = {}) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/purchase`, {
      templateDisplayId,
      meetingDate: meetingDetails.meetingDate,
      meetingTime: meetingDetails.meetingTime
    });
    return response.data;
  } catch (error) {
    console.error('❌ Purchase error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ FIXED: Get user's bookings
export const getUserBookings = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/my-bookings`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get bookings error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ FIXED: Get specific booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get booking details error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ NEW: Dashboard stats for user
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/dashboard-stats`);
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    throw error.response?.data || error.message;
  }
};

// ==================== ADMIN APIs ====================

// ✅ FIXED: Get all bookings (admin)
export const getAllBookings = async (params = {}) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/admin/all`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ FIXED: Get admin stats
export const getAdminStats = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL}/admin/stats`);
    return response.data;
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ FIXED: Approve booking
export const approveBooking = async (bookingId) => {
  try {
    const response = await apiClient.patch(`${BASE_URL}/admin/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    console.error('❌ Approve booking error:', error);
    throw error.response?.data || error.message;
  }
};

// ✅ FIXED: Complete booking with preview link
export const completeBooking = async (bookingId, previewLink) => {
  try {
    const response = await apiClient.patch(`${BASE_URL}/admin/${bookingId}/complete`, {
      previewLink
    });
    return response.data;
  } catch (error) {
    console.error('❌ Complete booking error:', error);
    throw error.response?.data || error.message;
  }
};

// ==================== HELPER FUNCTIONS ====================

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
    purchased: '#fbbf24',
    approved: '#6498fe',
    in_progress: '#8b5cf6',
    ready_for_completion: '#f97316',
  };
  
  return statusColors[status?.toLowerCase()] || '#9ca3af';
};

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
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

export const validateFileSize = (file, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (file, allowedTypes = []) => {
  return allowedTypes.includes(file.type);
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// ✅ DEFAULT EXPORT
export default {
  purchaseWebsite,
  getUserBookings,
  getBookingDetails,
  getDashboardStats,
  getAllBookings,
  getAdminStats,
  approveBooking,
  completeBooking,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  getStatusColor,
  generateId,
  getInitials,
  debounce,
  throttle,
  downloadFile,
  copyToClipboard,
  validateFileSize,
  validateFileType,
  getErrorMessage
};
