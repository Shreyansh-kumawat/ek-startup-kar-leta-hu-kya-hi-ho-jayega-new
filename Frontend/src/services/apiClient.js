// apiClient.js - Supabase Migration
// Replaces axios-based Render backend with Supabase
import { supabase } from '../lib/supabase';

// ============================================================
// AUTH
// ============================================================

export const authApi = {
  register: async ({ name, email, password, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, full_name: name },
      },
    });
    if (error) throw error;

    // Update profile with phone
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ phone: phone?.replace(/\D/g, '') || '' })
        .eq('id', data.user.id);
    }

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        id: data.user?.id,
        name,
        email,
        role: 'user',
        credits: 0,
      },
    };
  },

  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await getProfileData(data.user.id);

    if (!profile.is_active) {
      await supabase.auth.signOut();
      throw new Error('Account is deactivated');
    }

    // Send login notification email (fire and forget)
    supabase.functions.invoke('send-email', {
      body: {
        type: 'login_alert',
        to: email,
        name: profile.name,
        data: { loginTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
      },
    }).catch(() => {});

    return {
      success: true,
      message: 'Login successful',
      data: {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          credits: profile.credits || 0,
          profilePicture: profile.profile_picture,
        },
      },
    };
  },

  googleLogin: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    return { success: true, message: 'Logged out successfully' };
  },

  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const profile = await getProfileData(user.id);
    return {
      success: true,
      data: {
        id: user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        credits: profile.credits || 0,
        profilePicture: profile.profile_picture,
      },
    };
  },

  updateProfile: async ({ name, phone }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), phone: phone.replace(/\D/g, '') })
      .eq('id', user.id);

    if (error) throw error;
    return { success: true, message: 'Profile updated successfully' };
  },

  forgotPassword: async ({ email }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return { success: true, message: 'Password reset email sent' };
  },

  resetPassword: async ({ newPassword }) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { success: true, message: 'Password reset successful' };
  },

  changePassword: async ({ newPassword }) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { success: true, message: 'Password changed successfully' };
  },

  getUserCredits: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    return { success: true, data: { credits: data?.credits || 0 } };
  },
};

// ============================================================
// TEMPLATES
// ============================================================

export const templateApi = {
  getAll: async ({ page = 1, limit = 10, search = '', category, isActive, withBackend } = {}) => {
    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) query = query.eq('category', category);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true' || isActive === true);
    if (withBackend !== undefined) query = query.eq('with_backend', withBackend === 'true' || withBackend === true);

    const offset = (page - 1) * limit;
    const { data: templates, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: {
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          totalTemplates: count || 0,
          limit,
        },
      },
    };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  getByDisplayId: async (displayId) => {
    const cleanId = displayId.startsWith('#') ? displayId : `#${displayId}`;

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('display_id', cleanId)
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  search: async (query) => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  },

  // Admin operations
  create: async (formData) => {
    const result = await supabase.functions.invoke('upload-image', {
      body: formData,
    });
    return result.data;
  },

  update: async (id, formData) => {
    // If there's a file, upload it first
    let previewImage;
    if (formData instanceof FormData && formData.get('file')) {
      const uploadRes = await supabase.functions.invoke('upload-image', {
        body: formData,
      });
      previewImage = uploadRes.data?.data?.url;
    }

    const updateData = {};
    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        if (key !== 'file') {
          const dbKey = camelToSnake(key);
          updateData[dbKey] = value;
        }
      }
    } else {
      Object.entries(formData).forEach(([key, value]) => {
        updateData[camelToSnake(key)] = value;
      });
    }

    if (previewImage) updateData.preview_image = previewImage;
    updateData.updated_at = new Date().toISOString();

    // Parse JSON fields
    ['whats_included', 'template_info', 'development_process'].forEach((field) => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try { updateData[field] = JSON.parse(updateData[field]); } catch {}
      }
    });

    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    // Boolean conversion
    if (updateData.with_backend !== undefined) {
      updateData.with_backend = updateData.with_backend === 'true' || updateData.with_backend === true;
    }

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Template updated', data };
  },

  delete: async (id) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Template deleted' };
  },

  toggleStatus: async (id) => {
    const { data: template } = await supabase
      .from('templates')
      .select('is_active')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('templates')
      .update({ is_active: !template.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },
};

// ============================================================
// WEBSITE BOOKINGS
// ============================================================

export const websiteBookingApi = {
  purchase: async ({ templateDisplayId }) => {
    const { data, error } = await supabase.functions.invoke('purchase-website', {
      body: { templateDisplayId },
    });
    if (error) throw error;
    return data;
  },

  getMyBookings: async ({ page = 1, limit = 10, status, search } = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('website_bookings')
      .select('*, templates!template_id(name, preview_image, live_demo)', { count: 'exact' })
      .eq('user_id', user.id);

    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('template_name', `%${search}%`);

    const offset = (page - 1) * limit;
    const { data: bookings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          totalBookings: count || 0,
          limit,
        },
      },
    };
  },

  getBookingDetails: async (bookingId) => {
    const { data, error } = await supabase
      .from('website_bookings')
      .select('*, templates!template_id(name, preview_image, live_demo), profiles!user_id(name, email)')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  getDashboardStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const [total, active, completed] = await Promise.all([
      supabase.from('website_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('website_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['purchased', 'approved', 'inprogress']),
      supabase.from('website_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    ]);

    return {
      success: true,
      data: {
        totalBookings: total.count || 0,
        activeBookings: active.count || 0,
        completedBookings: completed.count || 0,
      },
    };
  },

  // Admin
  getAllBookings: async ({ status } = {}) => {
    return supabase.functions.invoke('bookings', {
      body: {},
      method: 'GET',
    }).then(r => r.data);
  },

  approveBooking: async (bookingId) => {
    const { data, error } = await supabase.functions.invoke('bookings', {
      body: { bookingId },
    });
    if (error) throw error;
    return data;
  },

  completeBooking: async (bookingId, previewLink) => {
    const { data, error } = await supabase.functions.invoke('bookings', {
      body: { bookingId, previewLink },
    });
    if (error) throw error;
    return data;
  },
};

// ============================================================
// PLANS / RAZORPAY
// ============================================================

export const planApi = {
  createOrder: async (planType) => {
    const { data, error } = await supabase.functions.invoke('razorpay/create-order', {
      body: { planType },
    });
    if (error) throw error;
    return data;
  },

  verifyPayment: async (paymentData) => {
    const { data, error } = await supabase.functions.invoke('razorpay/verify-payment', {
      body: paymentData,
    });
    if (error) throw error;
    return data;
  },

  getMyPlans: async ({ page = 1, limit = 10 } = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const offset = (page - 1) * limit;
    const { data: purchases, count, error } = await supabase
      .from('plan_purchases')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
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
  },
};

// ============================================================
// CHAT
// ============================================================

export const chatApi = {
  getMessages: async (bookingId) => {
    // Get or create chat
    let { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (!chat) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({ booking_id: bookingId })
        .select()
        .single();
      chat = newChat;
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*, profiles!sender_id(name, email, role)')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: { id: chat.id, bookingId, messages } };
  },

  sendMessage: async (bookingId, message) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const profile = await getProfileData(user.id);
    const senderRole = ['admin', 'secondaryAdmin'].includes(profile.role) ? 'admin' : 'user';

    // Get or create chat
    let { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (!chat) {
      const { data: newChat } = await supabase
        .from('chats')
        .insert({ booking_id: bookingId })
        .select()
        .single();
      chat = newChat;
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chat.id,
        sender_id: user.id,
        sender_role: senderRole,
        message: message.trim(),
      })
      .select('*, profiles!sender_id(name, email, role)')
      .single();

    if (error) throw error;

    // Return full chat
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*, profiles!sender_id(name, email, role)')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    return { success: true, message: 'Message sent', data: { id: chat.id, bookingId, messages } };
  },
};

// ============================================================
// CAREERS
// ============================================================

export const careerApi = {
  getActiveJobs: async () => {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('is_active', true)
      .gt('expiry_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  },

  getJobByJobId: async (jobId) => {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  submitApplication: async (applicationData) => {
    const { data, error } = await supabase.functions.invoke('careers/apply', {
      body: applicationData,
    });
    if (error) throw error;
    return data;
  },
};

// ============================================================
// MEETINGS
// ============================================================

export const meetingApi = {
  getUserMeetings: async ({ page = 1, limit = 10, status } = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('meetings')
      .select('*, templates!template_id(name, description, price, preview_image)', { count: 'exact' })
      .eq('user_id', user.id);

    if (status && status !== 'all') query = query.eq('status', status);

    const offset = (page - 1) * limit;
    const { data: meetings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const now = new Date();
    return {
      success: true,
      data: {
        meetings,
        upcomingMeetings: meetings?.filter(m => m.scheduled_date && new Date(m.scheduled_date) > now) || [],
        pastMeetings: meetings?.filter(m => !m.scheduled_date || new Date(m.scheduled_date) <= now) || [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((count || 0) / limit),
          totalMeetings: count || 0,
        },
      },
    };
  },

  requestMeeting: async ({ title, description, preferredDate, preferredTime, templateId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        template_id: templateId || null,
        title,
        description,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        status: 'requested',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, message: 'Meeting request submitted', data };
  },
};

// ============================================================
// TUTORIALS
// ============================================================

export const tutorialApi = {
  recordInteraction: async ({ action, sessionId, deviceInfo }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const profile = await getProfileData(user.id);

    const { data, error } = await supabase
      .from('tutorial_interactions')
      .insert({
        user_id: user.id,
        user_email: profile.email,
        action,
        session_id: sessionId || Date.now().toString(),
        device_info: deviceInfo || navigator.userAgent,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: { interactionId: data.id, action: data.action } };
  },

  updateVideoProgress: async ({ interactionId, videoNumber }) => {
    const { data: interaction, error: fetchErr } = await supabase
      .from('tutorial_interactions')
      .select('*')
      .eq('id', interactionId)
      .single();

    if (fetchErr) throw fetchErr;

    const watched = interaction.videos_watched || [];
    if (!watched.includes(videoNumber)) {
      watched.push(videoNumber);
      const { error } = await supabase
        .from('tutorial_interactions')
        .update({
          videos_watched: watched,
          total_videos_watched: watched.length,
          last_video_watched: videoNumber,
          completion_percentage: Math.round((watched.length / 15) * 100),
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', interactionId);

      if (error) throw error;
    }

    return {
      success: true,
      data: {
        videosWatched: watched,
        totalVideosWatched: watched.length,
        completionPercentage: Math.round((watched.length / 15) * 100),
      },
    };
  },

  getUserHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tutorial_interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return { success: true, data: { interactions: data } };
  },
};

// ============================================================
// ADMIN API (calls Edge Functions)
// ============================================================

export const adminApi = {
  getDashboard: () => supabase.functions.invoke('admin/dashboard').then(r => r.data),
  getUsers: (params) => supabase.functions.invoke('admin/users', { body: params }).then(r => r.data),
  getUserDetail: (id) => supabase.functions.invoke('admin/user-detail', { body: { id } }).then(r => r.data),
  updateStatus: (data) => supabase.functions.invoke('admin/update-status', { body: data }).then(r => r.data),
  updateCredits: (data) => supabase.functions.invoke('admin/update-credits', { body: data }).then(r => r.data),
  addCredits: (data) => supabase.functions.invoke('admin/add-credits', { body: data }).then(r => r.data),
  deductCredits: (data) => supabase.functions.invoke('admin/deduct-credits', { body: data }).then(r => r.data),
  deleteUser: (data) => supabase.functions.invoke('admin/delete-user', { body: data }).then(r => r.data),
  createAdmin: (data) => supabase.functions.invoke('admin/create-admin', { body: data }).then(r => r.data),
  sendBulkEmail: (data) => supabase.functions.invoke('admin/bulk-email', { body: data }).then(r => r.data),
};

// ============================================================
// HELPERS
// ============================================================

async function getProfileData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// ============================================================
// BACKWARD COMPATIBILITY
// Keep these exports so existing code doesn't break immediately
// ============================================================

export const setAuthToken = () => {};
export const clearAuth = async () => {
  await supabase.auth.signOut();
};

export const checkAPIStatus = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    return { status: error ? 'offline' : 'online' };
  } catch {
    return { status: 'offline' };
  }
};

export const getServerImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return imagePath;
};

// Default export for backward compatibility
const apiClient = {
  get: async (url) => {
    console.warn('apiClient.get() is deprecated. Use Supabase client directly.');
    return { data: {} };
  },
  post: async (url, data) => {
    console.warn('apiClient.post() is deprecated. Use Supabase client directly.');
    return { data: {} };
  },
};

export default apiClient;
