const Chat = require('../models/Chat');
const WebsiteBooking = require('../models/WebsiteBooking');

// @desc    Get all messages for a booking
// @route   GET /api/chat/:bookingId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Check if booking exists
    const booking = await WebsiteBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access (owner or admin)
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ bookingId })
      .populate('messages.sender', 'name email role');

    if (!chat) {
      chat = await Chat.create({
        bookingId,
        messages: []
      });
    }

    res.json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/chat/:bookingId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role === 'admin' ? 'admin' : 'user';

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Check if booking exists
    const booking = await WebsiteBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ bookingId });

    if (!chat) {
      chat = await Chat.create({
        bookingId,
        messages: []
      });
    }

    // Add message
    chat.messages.push({
      sender: userId,
      senderRole: userRole,
      message: message.trim(),
      timestamp: new Date()
    });

    await chat.save();

    // Populate sender details
    await chat.populate('messages.sender', 'name email role');

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: chat
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};
