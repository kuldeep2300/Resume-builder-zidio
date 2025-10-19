const Integration = require('../models/Integration');
const Achievement = require('../models/Achievement');
const Resume = require('../models/Resume');
const { extractSkills } = require('../utils/skillExtractor');
const { generateSummary, calculateCompleteness } = require('../utils/resumeGenerator');
const User = require('../models/User');

// @desc    Get all integrations for user
// @route   GET /api/integrations
// @access  Private
const getIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user._id });

    res.json({
      success: true,
      count: integrations.length,
      data: integrations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create/Connect integration
// @route   POST /api/integrations
// @access  Private
const createIntegration = async (req, res) => {
  try {
    const { platform, platformUserId, apiKey } = req.body;

    // Check if integration already exists
    let integration = await Integration.findOne({
      userId: req.user._id,
      platform,
    });

    if (integration) {
      // Update existing integration
      integration.platformUserId = platformUserId || integration.platformUserId;
      integration.apiKey = apiKey || integration.apiKey;
      integration.isActive = true;
      await integration.save();
    } else {
      // Create new integration
      integration = await Integration.create({
        userId: req.user._id,
        platform,
        platformUserId,
        apiKey,
      });
    }

    res.status(201).json({
      success: true,
      data: integration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Simulate webhook from external platform
// @route   POST /api/integrations/webhook
// @access  Public (In production, verify with API key/secret)
const simulateWebhook = async (req, res) => {
  try {
    const {
      userId,
      platform,
      achievementData,
    } = req.body;

    // Validate required fields
    if (!userId || !platform || !achievementData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, platform, and achievementData',
      });
    }

    // In production, verify webhook signature here

    // Check if integration exists and is active
    const integration = await Integration.findOne({
      userId,
      platform,
      isActive: true,
    });

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found or inactive',
      });
    }

    // Create achievement from webhook data
    const achievement = await Achievement.create({
      userId,
      source: platform,
      status: 'verified', // Auto-verify from trusted platforms
      ...achievementData,
    });

    // Update integration sync info
    integration.lastSynced = new Date();
    integration.syncCount += 1;
    await integration.save();

    // Update resume
    await updateResumeFromIntegration(userId);

    res.status(201).json({
      success: true,
      message: 'Achievement added from webhook',
      data: achievement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Toggle integration active status
// @route   PATCH /api/integrations/:id/toggle
// @access  Private
const toggleIntegration = async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Check ownership
    if (integration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    integration.isActive = !integration.isActive;
    await integration.save();

    res.json({
      success: true,
      data: integration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete integration
// @route   DELETE /api/integrations/:id
// @access  Private
const deleteIntegration = async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found',
      });
    }

    // Check ownership
    if (integration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await integration.deleteOne();

    res.json({
      success: true,
      message: 'Integration removed',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Helper function to update resume from integration
const updateResumeFromIntegration = async (userId) => {
  try {
    const achievements = await Achievement.find({ userId });
    const user = await User.findById(userId);
    let resume = await Resume.findOne({ userId });

    if (!resume) {
      resume = await Resume.create({ userId });
    }

    resume.achievements = achievements.map((a) => a._id);
    resume.skills = extractSkills(achievements);
    resume.summary = generateSummary(user, achievements);
    resume.completeness = calculateCompleteness(resume, user);

    await resume.save();
  } catch (error) {
    console.error('Error updating resume from integration:', error);
  }
};

module.exports = {
  getIntegrations,
  createIntegration,
  simulateWebhook,
  toggleIntegration,
  deleteIntegration,
};