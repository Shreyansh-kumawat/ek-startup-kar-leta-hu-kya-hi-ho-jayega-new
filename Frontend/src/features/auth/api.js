import { supabase } from '../../lib/supabase';
import { authApi, tutorialApi } from '../../services/apiClient';

export const authAPI = {
  register: (userData) => authApi.register(userData),
  login: (credentials) => authApi.login(credentials),

  googleLogin: () => authApi.googleLogin(),

  logout: () => authApi.logout(),

  getProfile: () => authApi.getProfile(),

  forgotPassword: ({ email }) => authApi.forgotPassword({ email }),

  resetPassword: (resetData) => authApi.resetPassword(resetData),

  updateProfile: (profileData) => authApi.updateProfile(profileData),

  changePassword: (passwordData) => authApi.changePassword(passwordData),

  verifyEmail: async () => ({ success: true }),

  resendVerificationEmail: async () => ({ success: true }),
};

export const recordTutorialInteraction = (action, sessionId) =>
  tutorialApi.recordInteraction({ action, sessionId });

export const updateVideoProgress = ({ interactionId, videoNumber }) =>
  tutorialApi.updateVideoProgress({ interactionId, videoNumber });

export const getUserTutorialHistory = () => tutorialApi.getUserHistory();

export const getTutorialAnalytics = async (startDate, endDate) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('tutorial_interactions')
    .select('*')
    .order('started_at', { ascending: false });

  if (startDate) query = query.gte('started_at', startDate);
  if (endDate) query = query.lte('started_at', endDate);

  const { data, error } = await query;
  if (error) throw error;

  const totalInteractions = data.length;
  const yesCount = data.filter(d => d.action === 'yes').length;
  const noCount = data.filter(d => d.action === 'no').length;

  const videoDistribution = {};
  data.forEach((interaction) => {
    (interaction.videos_watched || []).forEach((v) => {
      videoDistribution[v] = (videoDistribution[v] || 0) + 1;
    });
  });

  return {
    success: true,
    data: {
      totalInteractions,
      yesCount,
      noCount,
      acceptanceRate: totalInteractions > 0 ? ((yesCount / totalInteractions) * 100).toFixed(1) : 0,
      videoDistribution,
      interactions: data,
    },
  };
};
