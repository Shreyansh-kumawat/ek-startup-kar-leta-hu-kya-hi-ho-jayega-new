import apiClient from '../../services/apiClient';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Google Login
  googleLogin: async (code) => {
    const response = await apiClient.post('/auth/google', { code });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // ✅ UPDATED: Forgot password - Send OTP
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // ✅ UPDATED: Reset password with OTP
  resetPassword: async (resetData) => {
    // resetData = { email, otp, newPassword }
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  },

  // ✅ NEW: Update user profile (name, phone)
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  // ✅ NEW: Change password (for logged-in users with current password)
  changePassword: async (passwordData) => {
    // passwordData = { currentPassword, newPassword }
    const response = await apiClient.put('/auth/change-password', passwordData);
    return response.data;
  },

  // ✅ NEW: Verify email (if you implement email verification)
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // ✅ NEW: Resend verification email
  resendVerificationEmail: async () => {
    const response = await apiClient.post('/auth/resend-verification');
    return response.data;
  },
  
};



// ✅ NEW: Tutorial tracking functions
export const recordTutorialInteraction = async (action, sessionId = null) => {
  try {
    const response = await apiClient.post('/tutorials/interaction', {
      action,
      sessionId: sessionId || Date.now().toString(),
      deviceInfo: navigator.userAgent,
    });
    return response.data;
  } catch (error) {
    console.error('Record tutorial interaction error:', error);
    throw error.response?.data || error.message;
  }
};

export const updateVideoProgress = async (interactionId, videoNumber) => {
  try {
    const response = await apiClient.put('/tutorials/video-progress', {
      interactionId,
      videoNumber,
    });
    return response.data;
  } catch (error) {
    console.error('Update video progress error:', error);
    throw error.response?.data || error.message;
  }
};

export const getUserTutorialHistory = async () => {
  try {
    const response = await apiClient.get('/tutorials/my-history');
    return response.data;
  } catch (error) {
    console.error('Get tutorial history error:', error);
    throw error.response?.data || error.message;
  }
};

// Admin only
export const getTutorialAnalytics = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get('/tutorials/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Get tutorial analytics error:', error);
    throw error.response?.data || error.message;
  }
};