import apiClient from './apiClient';

const BASE_URL = '/chat';

// Get messages for a booking
export const getMessages = async (bookingId) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch messages' };
  }
};

// Send a message
export const sendMessage = async (bookingId, message) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/${bookingId}`, {
      message
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send message' };
  }
};

export default {
  getMessages,
  sendMessage
};
