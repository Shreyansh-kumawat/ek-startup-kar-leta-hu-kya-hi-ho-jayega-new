// models/TutorialInteraction.js
const mongoose = require('mongoose');

const tutorialInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
  },
  videosWatched: {
    type: [Number], // Array of video numbers [1, 2, 4, 5, ...]
    default: [],
  },
  totalVideosWatched: {
    type: Number,
    default: 0,
  },
  lastVideoWatched: {
    type: Number,
    default: 0,
  },
  completionPercentage: {
    type: Number,
    default: 0, // Out of 15 videos
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String, // Track multiple sessions
  },
  deviceInfo: {
    type: String,
  },
});

// Index for faster queries
tutorialInteractionSchema.index({ userId: 1, createdAt: -1 });
tutorialInteractionSchema.index({ action: 1 });

const TutorialInteraction = mongoose.model('TutorialInteraction', tutorialInteractionSchema);

module.exports = TutorialInteraction;
