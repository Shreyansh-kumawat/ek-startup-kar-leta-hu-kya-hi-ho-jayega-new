import { websiteBookingApi } from './apiClient';

export const purchaseWebsite = (templateDisplayId) =>
  websiteBookingApi.purchase({ templateDisplayId });

export const getUserBookings = (params) =>
  websiteBookingApi.getMyBookings(params);

export const getBookingDetails = (bookingId) =>
  websiteBookingApi.getBookingDetails(bookingId);

export const getAllBookings = (params) =>
  websiteBookingApi.getAllBookings(params);

export const approveBooking = (bookingId) =>
  websiteBookingApi.approveBooking(bookingId);

export const completeBooking = (bookingId, previewLink) =>
  websiteBookingApi.completeBooking(bookingId, previewLink);

export const getAdminStats = () =>
  websiteBookingApi.getDashboardStats();

export const formatCurrency = (amount) =>
  `₹${amount?.toLocaleString('en-IN') || 0}`;

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
  formatDateTime,
};
