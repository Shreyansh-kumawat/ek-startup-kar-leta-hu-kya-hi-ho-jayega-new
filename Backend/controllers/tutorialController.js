// controllers/tutorialController.js
const TutorialInteraction = require('../models/TutorialInteraction');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseUtils');

// ✅ Record tutorial interaction (Yes/No click)
exports.recordTutorialInteraction = async (req, res) => {
  try {
    const { action, sessionId, deviceInfo } = req.body;

    if (!action || !['yes', 'no'].includes(action)) {
      return errorResponse(res, 'Invalid action. Must be "yes" or "no"', null, 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Create tutorial interaction
    const interaction = new TutorialInteraction({
      userId: req.user.id,
      userEmail: user.email,
      action,
      sessionId: sessionId || Date.now().toString(),
      deviceInfo: deviceInfo || req.headers['user-agent'],
      startedAt: new Date(),
      lastUpdatedAt: new Date(),
    });

    await interaction.save();

    // console.log(`📊 Tutorial interaction recorded: ${user.email} clicked ${action.toUpperCase()}`);

    return successResponse(res, 'Tutorial interaction recorded successfully', {
      interactionId: interaction._id,
      action: interaction.action,
    }, 201);
  } catch (error) {
    console.error('❌ Record tutorial interaction error:', error);
    return errorResponse(res, 'Server error while recording tutorial interaction', error);
  }
};

// ✅ Update video progress
exports.updateVideoProgress = async (req, res) => {
  try {
    const { interactionId, videoNumber } = req.body;

    if (!interactionId || !videoNumber) {
      return errorResponse(res, 'Interaction ID and video number are required', null, 400);
    }

    if (videoNumber < 1 || videoNumber > 15) {
      return errorResponse(res, 'Video number must be between 1 and 15', null, 400);
    }

    const interaction = await TutorialInteraction.findOne({
      _id: interactionId,
      userId: req.user.id,
    });

    if (!interaction) {
      return errorResponse(res, 'Tutorial interaction not found', null, 404);
    }

    // Add video to watched list if not already present
    if (!interaction.videosWatched.includes(videoNumber)) {
      interaction.videosWatched.push(videoNumber);
      interaction.totalVideosWatched = interaction.videosWatched.length;
      interaction.lastVideoWatched = videoNumber;
      interaction.completionPercentage = Math.round((interaction.videosWatched.length / 15) * 100);
      interaction.lastUpdatedAt = new Date();

      await interaction.save();

      // console.log(`🎬 Video ${videoNumber}/15 watched by ${interaction.userEmail}`);
    }

    return successResponse(res, 'Video progress updated successfully', {
      videosWatched: interaction.videosWatched,
      totalVideosWatched: interaction.totalVideosWatched,
      completionPercentage: interaction.completionPercentage,
    });
  } catch (error) {
    console.error('❌ Update video progress error:', error);
    return errorResponse(res, 'Server error while updating video progress', error);
  }
};

// ✅ Get tutorial analytics (Admin only)
exports.getTutorialAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get total interactions
    const totalInteractions = await TutorialInteraction.countDocuments(dateFilter);

    // Get Yes/No counts
    const yesCount = await TutorialInteraction.countDocuments({ ...dateFilter, action: 'yes' });
    const noCount = await TutorialInteraction.countDocuments({ ...dateFilter, action: 'no' });

    // Get completion stats (for users who said Yes)
    const yesInteractions = await TutorialInteraction.find({ ...dateFilter, action: 'yes' });

    const completionStats = {
      fullCompletion: yesInteractions.filter(i => i.completionPercentage === 100).length,
      partialCompletion: yesInteractions.filter(i => i.completionPercentage > 0 && i.completionPercentage < 100).length,
      noProgress: yesInteractions.filter(i => i.completionPercentage === 0).length,
    };

    // Average completion percentage
    const avgCompletion = yesInteractions.length > 0
      ? Math.round(yesInteractions.reduce((sum, i) => sum + i.completionPercentage, 0) / yesInteractions.length)
      : 0;

    // Get detailed user interactions (last 50)
    const recentInteractions = await TutorialInteraction.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ startedAt: -1 })
      .limit(50);

    // Video watch distribution (how many users watched each video)
    const videoDistribution = {};
    for (let i = 1; i <= 15; i++) {
      videoDistribution[`video${i}`] = await TutorialInteraction.countDocuments({
        ...dateFilter,
        videosWatched: i,
      });
    }

    return successResponse(res, 'Tutorial analytics fetched successfully', {
      summary: {
        totalInteractions,
        yesCount,
        noCount,
        yesPercentage: totalInteractions > 0 ? Math.round((yesCount / totalInteractions) * 100) : 0,
        noPercentage: totalInteractions > 0 ? Math.round((noCount / totalInteractions) * 100) : 0,
        avgCompletion,
      },
      completionStats,
      videoDistribution,
      recentInteractions: recentInteractions.map(i => ({
        userId: i.userId?._id,
        userName: i.userId?.name,
        userEmail: i.userEmail,
        action: i.action,
        videosWatched: i.videosWatched.length,
        totalVideos: 15,
        completionPercentage: i.completionPercentage,
        lastVideoWatched: i.lastVideoWatched,
        startedAt: i.startedAt,
        lastUpdatedAt: i.lastUpdatedAt,
      })),
    });
  } catch (error) {
    console.error('❌ Get tutorial analytics error:', error);
    return errorResponse(res, 'Server error while fetching tutorial analytics', error);
  }
};

// ✅ Get user's tutorial history
exports.getUserTutorialHistory = async (req, res) => {
  try {
    const interactions = await TutorialInteraction.find({ userId: req.user.id })
      .sort({ startedAt: -1 })
      .limit(10);

    return successResponse(res, 'User tutorial history fetched successfully', {
      interactions: interactions.map(i => ({
        id: i._id,
        action: i.action,
        videosWatched: i.videosWatched,
        totalVideosWatched: i.totalVideosWatched,
        completionPercentage: i.completionPercentage,
        startedAt: i.startedAt,
        lastUpdatedAt: i.lastUpdatedAt,
      })),
    });
  } catch (error) {
    console.error('❌ Get user tutorial history error:', error);
    return errorResponse(res, 'Server error while fetching tutorial history', error);
  }
};
