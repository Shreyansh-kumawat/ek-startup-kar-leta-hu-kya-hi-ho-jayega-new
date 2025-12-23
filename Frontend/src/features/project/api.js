import apiClient from '../../services/apiClient';

// Get user's project details
export const getProjectDetails = async (projectId = null) => {
  try {
    const url = projectId ? `/projects/${projectId}` : '/projects/my-projects';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's projects list
export const getUserProjects = async () => {
  try {
    const response = await apiClient.get('/projects/my-projects');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all projects (admin only)
export const getAllProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update project status (admin only)
export const updateProjectStatus = async (projectId, status, notes = '') => {
  try {
    const response = await apiClient.put(`/projects/${projectId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update project links (admin only)
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

// Activate website (admin only)
export const activateWebsite = async (projectId, websiteUrl) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/activate`, {
      websiteUrl
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add project notification (admin only)
export const addProjectNotification = async (projectId, userId, message, type = 'info') => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/notification`, {
      userId,
      message,
      type
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get project notifications
export const getProjectNotifications = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/notifications`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};