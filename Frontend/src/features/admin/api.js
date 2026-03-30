// Frontend/src/features/admin/api.js
import apiClient from '../../services/apiClient';


// ==================== DASHBOARD & STATS ====================

export const getDashboard = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getSystemStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== USER MANAGEMENT ====================

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const createSecondaryAdmin = async (userData) => {
  try {
    const response = await apiClient.post('/admin/secondary', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}`, {
      data: { confirmDelete: true }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ✅ NEW: Update user credits
export const updateUserCredits = async (userId, credits) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/credits`, { credits });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== MEETING MANAGEMENT ====================

export const getAllMeetings = async () => {
  try {
    const response = await apiClient.get('/meetings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const getMeetingRequests = async () => {
  try {
    const response = await apiClient.get('/meetings/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const scheduleMeeting = async (meetingId, scheduleData) => {
  try {
    const response = await apiClient.put(`/meetings/${meetingId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateMeetingStatus = async (meetingId, status) => {
  try {
    const response = await apiClient.put(`/meetings/${meetingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== ORDER MANAGEMENT ====================

export const getAllOrders = async () => {
  try {
    const response = await apiClient.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== PROJECT MANAGEMENT ====================

export const getAllProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateProjectStatus = async (projectId, status, notes = '') => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const updateProjectLinks = async (projectId, previewLink, liveLink) => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/links`, { 
      previewLink, 
      liveLink 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const activateWebsite = async (projectId, websiteUrl) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/activate`, { websiteUrl });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


export const addNotification = async (projectId, message, type = 'info') => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/notification`, { 
      message, 
      type 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== WEBSITE BOOKING MANAGEMENT (B2B) ====================

export const getAllWebsiteBookings = async (params = {}) => {
  try {
    const response = await apiClient.get('/website-booking/admin/all', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const approveWebsiteBooking = async (bookingId) => {
  try {
    const response = await apiClient.patch(`/website-booking/admin/${bookingId}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const completeWebsiteBooking = async (bookingId, previewLink) => {
  try {
    const response = await apiClient.patch(`/website-booking/admin/${bookingId}/complete`, {
      previewLink
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWebsiteBookingStats = async () => {
  try {
    const response = await apiClient.get('/website-booking/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// ==================== CHAT MANAGEMENT ====================

export const getChatMessages = async (bookingId) => {
  try {
    const response = await apiClient.get(`/chat/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendChatMessage = async (bookingId, message) => {
  try {
    const response = await apiClient.post(`/chat/${bookingId}`, { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
