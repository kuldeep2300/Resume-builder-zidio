const Achievement = require("../models/Achievement");
const Resume = require("../models/Resume");
const { extractSkills } = require("../utils/skillExtractor");
const {
  generateSummary,
  calculateCompleteness,
} = require("../utils/resumeGenerator");
const User = require("../models/User");

// @desc    Get all achievements for a user
// @route   GET /api/achievements
// @access  Private
const getAchievements = async (req, res) => {
  try {
    const { type, status, sort } = req.query;

    const filter = { userId: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    let sortOption = { createdAt: -1 }; // Default: newest first

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "date") {
      sortOption = { startDate: -1 };
    }

    const achievements = await Achievement.find(filter).sort(sortOption);

    res.json({
      success: true,
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Private
const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Check ownership
    if (achievement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this achievement",
      });
    }

    res.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Create new achievement
// @route   POST /api/achievements
// @access  Private
const createAchievement = async (req, res) => {
  try {
    const achievementData = {
      ...req.body,
      userId: req.user._id,
    };

    const achievement = await Achievement.create(achievementData);

    // Update resume with new achievement
    await updateResumeWithAchievement(req.user._id);

    res.status(201).json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private
const updateAchievement = async (req, res) => {
  try {
    let achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Check ownership
    if (achievement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this achievement",
      });
    }

    achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update resume
    await updateResumeWithAchievement(req.user._id);

    res.json({
      success: true,
      data: achievement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Check ownership
    if (achievement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this achievement",
      });
    }

    await achievement.deleteOne();

    // Update resume
    await updateResumeWithAchievement(req.user._id);

    res.json({
      success: true,
      message: "Achievement removed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to update resume when achievement changes
const updateResumeWithAchievement = async (userId) => {
  try {
    // Get all achievements
    const achievements = await Achievement.find({ userId });

    // Get user
    const user = await User.findById(userId);

    // Get resume
    let resume = await Resume.findOne({ userId });

    if (!resume) {
      resume = await Resume.create({ userId });
    }

    // Update achievements array
    resume.achievements = achievements.map((a) => a._id);

    // Extract and update skills
    resume.skills = extractSkills(achievements);

    // Generate summary
    resume.summary = generateSummary(user, achievements);

    // Calculate completeness
    resume.completeness = calculateCompleteness(resume, user);

    await resume.save();

    return resume;
  } catch (error) {
    console.error("Error updating resume:", error);
    throw error;
  }
};

// @desc    Get achievement statistics
// @route   GET /api/achievements/stats
// @access  Private
const getAchievementStats = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id });

    const stats = {
      total: achievements.length,
      byType: {
        hackathon: 0,
        course: 0,
        internship: 0,
        project: 0,
        certification: 0,
      },
      byStatus: {
        verified: 0,
        pending: 0,
        unverified: 0,
      },
      skills: extractSkills(achievements),
    };

    achievements.forEach((achievement) => {
      stats.byType[achievement.type]++;
      stats.byStatus[achievement.status]++;
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementStats,
};
