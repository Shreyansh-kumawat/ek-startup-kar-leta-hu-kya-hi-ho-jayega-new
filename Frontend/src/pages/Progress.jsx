import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { websiteBookingApi, chatApi } from '../services/apiClient';

const Progress = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await websiteBookingApi.getMyBookings();
      if (result.success) {
        setBookings(result.data?.bookings || result.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (bookingId) => {
    try {
      const result = await chatApi.getMessages(bookingId);
      if (result.success) {
        setChatMessages(result.data.messages || []);
      }
    } catch (err) {
      console.error('Fetch chat error:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedBooking) return;

    setSendingMessage(true);

    try {
      const result = await chatApi.sendMessage(selectedBooking.id, newMessage);
      if (result.success) {
        setChatMessages(result.data.messages || []);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const openChat = (booking) => {
    setSelectedBooking(booking);
    fetchChatMessages(booking.id);
  };

  const closeChat = () => {
    setSelectedBooking(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      purchased: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      inprogress: 'bg-purple-100 text-purple-800 border-purple-300',
      readyforcompletion: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
    };

    const labels = {
      purchased: 'Purchased',
      approved: 'Approved',
      inprogress: 'In Progress',
      readyforcompletion: 'Ready',
      completed: 'Completed',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${badges[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Website Progress
          </h1>
          <p className="text-gray-600">Track all your website bookings</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-200">
            <div className="text-6xl mb-4">No bookings yet</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start by booking your first website!</p>
            <a
              href="/booking"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Book Website
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-400 transition"
              >
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <img
                      src={booking.template_image || booking.templateImage || booking.templates?.preview_image}
                      alt={booking.template_name || booking.templateName}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {booking.template_name || booking.templateName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Booking ID: <span className="font-mono font-bold">{booking.template_display_id || booking.id?.slice(0, 8)}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Purchased: {new Date(booking.created_at || booking.purchasedAt).toLocaleDateString()}
                    </p>

                    {getStatusBadge(booking.status)}

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">Progress</span>
                        <span className="font-bold text-blue-600">{booking.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${booking.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    {booking.status === 'completed' && booking.preview_link && (
                      <a
                        href={booking.preview_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-semibold transition mb-2"
                      >
                        View Website
                      </a>
                    )}

                    <button
                      onClick={() => openChat(booking)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="border-b-2 border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Chat - {selectedBooking.template_name || selectedBooking.templateName}
                </h3>
                <button
                  onClick={closeChat}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  x
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_role === 'admin'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {msg.sender_role === 'admin' ? 'Admin' : 'You'}
                        </p>
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at || msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t-2 border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
