import apiClient from '../../services/apiClient';

// Request a meeting
export const requestMeeting = async (meetingData) => {
  try {
    const response = await apiClient.post('/meetings/request', meetingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's meetings
export const getUserMeetings = async () => {
  try {
    const response = await apiClient.get('/meetings/my-meetings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all meeting requests (admin only)
export const getMeetingRequests = async () => {
  try {
    const response = await apiClient.get('/meetings/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all meetings (admin only)
export const getAllMeetings = async () => {
  try {
    const response = await apiClient.get('/meetings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Schedule a meeting (admin only)
export const scheduleMeeting = async (meetingId, scheduleData) => {
  try {
    const response = await apiClient.put(`/meetings/${meetingId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update meeting status (admin only)
export const updateMeetingStatus = async (meetingId, status) => {
  try {
    const response = await apiClient.put(`/meetings/${meetingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};