import { websiteBookingApi } from './apiClient';

export const purchaseWebsite = (templateDisplayId, meetingDetails = {}) =>
  websiteBookingApi.purchase({ templateDisplayId });

export const getUserBookings = (params) =>
  websiteBookingApi.getMyBookings(params);

export const getBookingDetails = (bookingId) =>
  websiteBookingApi.getBookingDetails(bookingId);

export const getDashboardStats = () =>
  websiteBookingApi.getDashboardStats();

export const getAllBookings = (params) =>
  websiteBookingApi.getAllBookings(params);

export const getAdminStats = () =>
  websiteBookingApi.getDashboardStats();

export const approveBooking = (bookingId) =>
  websiteBookingApi.approveBooking(bookingId);

export const completeBooking = (bookingId, previewLink) =>
  websiteBookingApi.completeBooking(bookingId, previewLink);

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
};

export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', ...options,
    });
  } catch { return 'Invalid Date'; }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return 'Invalid Date'; }
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return 'Invalid Time'; }
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch { return 'N/A'; }
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
    inprogress: '#8b5cf6',
    ready_for_completion: '#f97316',
    readyforcompletion: '#f97316',
  };
  return statusColors[status?.toLowerCase()] || '#9ca3af';
};

export const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
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
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

export const validateFileSize = (file, maxSizeInMB = 5) =>
  file.size <= maxSizeInMB * 1024 * 1024;

export const validateFileType = (file, allowedTypes = []) =>
  allowedTypes.includes(file.type);

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

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
  getErrorMessage,
};
