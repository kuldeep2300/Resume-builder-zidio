const Resume = require('../models/Resume');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { generateSummary, calculateCompleteness } = require('../utils/resumeGenerator');
const { extractSkills } = require('../utils/skillExtractor');

// @desc    Get user resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user._id }).populate(
      'achievements'
    );

    if (!resume) {
      // Create default resume if doesn't exist
      resume = await Resume.create({
        userId: req.user._id,
        personalInfo: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          location: req.user.location,
          linkedin: req.user.linkedin,
          github: req.user.github,
          portfolio: req.user.portfolio,
        },
      });

      resume = await Resume.findOne({ userId: req.user._id }).populate(
        'achievements'
      );
    }

    res.json({
      success: true,
      data: resume,
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

// @desc    Update resume
// @route   PUT /api/resume
// @access  Private
const updateResume = async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    const { personalInfo, summary, template } = req.body;

    if (personalInfo) {
      resume.personalInfo = { ...resume.personalInfo, ...personalInfo };
    }

    if (summary !== undefined) {
      resume.summary = summary;
    }

    if (template) {
      resume.template = template;
    }

    // Recalculate completeness
    const user = await User.findById(req.user._id);
    resume.completeness = calculateCompleteness(resume, user);

    await resume.save();

    resume = await Resume.findOne({ userId: req.user._id }).populate(
      'achievements'
    );

    res.json({
      success: true,
      data: resume,
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

// @desc    Update resume visibility settings
// @route   PATCH /api/resume/visibility
// @access  Private
const updateVisibility = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume.visibility = { ...resume.visibility, ...req.body };

    await resume.save();

    res.json({
      success: true,
      data: resume,
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

// @desc    Regenerate resume summary
// @route   POST /api/resume/regenerate-summary
// @access  Private
const regenerateSummary = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    const achievements = await Achievement.find({ userId: req.user._id });
    const user = await User.findById(req.user._id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume.summary = generateSummary(user, achievements);
    await resume.save();

    res.json({
      success: true,
      data: {
        summary: resume.summary,
      },
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

// @desc    Get resume with filtered achievements
// @route   GET /api/resume/preview
// @access  Private
const getResumePreview = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).populate(
      'achievements'
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Filter achievements based on visibility settings
    const filteredAchievements = resume.achievements.filter((achievement) => {
      switch (achievement.type) {
        case 'project':
          return resume.visibility.showProjects;
        case 'course':
          return resume.visibility.showCourses;
        case 'hackathon':
          return resume.visibility.showHackathons;
        case 'internship':
          return resume.visibility.showInternships;
        case 'certification':
          return resume.visibility.showCertifications;
        default:
          return true;
      }
    });

    const previewData = {
      ...resume.toObject(),
      achievements: filteredAchievements,
    };

    res.json({
      success: true,
      data: previewData,
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

module.exports = {
  getResume,
  updateResume,
  updateVisibility,
  regenerateSummary,
  getResumePreview,
};