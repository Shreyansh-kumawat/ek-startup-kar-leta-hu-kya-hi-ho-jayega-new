import { chatApi } from './apiClient';

export const getMessages = (bookingId) => chatApi.getMessages(bookingId);
export const sendMessage = (bookingId, message) => chatApi.sendMessage(bookingId, message);

export default { getMessages, sendMessage };
