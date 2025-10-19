const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['hackathon', 'course', 'internship', 'project', 'certification'],
      required: [true, 'Please specify achievement type'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Please add an organization'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    skills: {
      type: [String],
      default: [],
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['verified', 'pending', 'unverified'],
      default: 'unverified',
    },
    source: {
      type: String,
      enum: ['manual', 'devpost', 'coursera', 'udemy', 'github', 'linkedin'],
      default: 'manual',
    },
    metadata: {
      // For hackathons
      position: String,
      prize: String,
      teamSize: Number,
      
      // For courses
      grade: String,
      duration: String,
      instructor: String,
      
      // For internships
      role: String,
      department: String,
      
      // For projects
      techStack: [String],
      githubUrl: String,
      liveUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);