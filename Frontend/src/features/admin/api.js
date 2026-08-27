import { supabase } from '../../lib/supabase';
import { adminApi, chatApi, websiteBookingApi, meetingApi } from '../../services/apiClient';

// ==================== DASHBOARD & STATS ====================

export const getDashboard = () => adminApi.getDashboard();
export const getSystemStats = () => adminApi.getDashboard();

// ==================== USER MANAGEMENT ====================

export const getAllUsers = (params) => adminApi.getUsers(params);
export const getUserById = (userId) => adminApi.getUserDetail(userId);
export const createSecondaryAdmin = (userData) => adminApi.createAdmin(userData);

export const updateUserStatus = (userId, isActive) =>
  adminApi.updateStatus({ userId, isActive });

export const deleteUser = (userId) =>
  adminApi.deleteUser({ userId, confirmDelete: true });

export const updateUserCredits = (userId, credits) =>
  adminApi.updateCredits({ userId, credits });

// ==================== MEETING MANAGEMENT ====================

export const getAllMeetings = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, profiles!user_id(name, email), templates!template_id(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const getMeetingRequests = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, profiles!user_id(name, email), templates!template_id(name)')
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const scheduleMeeting = async (meetingId, scheduleData) => {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      scheduled_date: scheduleData.scheduledDate,
      scheduled_time: scheduleData.scheduledTime,
      meeting_link: scheduleData.meetingLink,
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, message: 'Meeting scheduled', data };
};

export const updateMeetingStatus = async (meetingId, status) => {
  const { data, error } = await supabase
    .from('meetings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

// ==================== ORDER MANAGEMENT ====================

export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from('plan_purchases')
    .select('*, profiles!user_id(name, email)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('plan_purchases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

// ==================== PROJECT MANAGEMENT ====================

export const getAllProjects = async () => {
  const { data, error } = await supabase
    .from('website_bookings')
    .select('*, profiles!user_id(name, email), templates!template_id(name, preview_image)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const updateProjectStatus = async (projectId, status, notes = '') => {
  const { data, error } = await supabase
    .from('website_bookings')
    .update({ status, admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

export const updateProjectLinks = async (projectId, previewLink, liveLink) => {
  const { data, error } = await supabase
    .from('website_bookings')
    .update({ preview_link: previewLink, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

export const activateWebsite = async (projectId, websiteUrl) => {
  const { data, error } = await supabase
    .from('website_bookings')
    .update({
      preview_link: websiteUrl,
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

export const addNotification = async (projectId, message, type = 'info') => {
  const { data: booking } = await supabase
    .from('website_bookings')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (!booking) throw new Error('Booking not found');

  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: booking.user_id, message, type })
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};

// ==================== WEBSITE BOOKING MANAGEMENT ====================

export const getAllWebsiteBookings = async (params = {}) => {
  let query = supabase
    .from('website_bookings')
    .select('*, profiles!user_id(name, email), templates!template_id(name, preview_image)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.status) query = query.eq('status', params.status);

  const { data, count, error } = await query;
  if (error) throw error;
  return { success: true, data, count: count || 0 };
};

export const approveWebsiteBooking = (bookingId) =>
  websiteBookingApi.approveBooking(bookingId);

export const completeWebsiteBooking = (bookingId, previewLink) =>
  websiteBookingApi.completeBooking(bookingId, previewLink);

export const getWebsiteBookingStats = () =>
  websiteBookingApi.getDashboardStats();

// ==================== CHAT MANAGEMENT ====================

export const getChatMessages = (bookingId) => chatApi.getMessages(bookingId);
export const sendChatMessage = (bookingId, message) => chatApi.sendMessage(bookingId, message);
