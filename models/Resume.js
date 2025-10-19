const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    summary: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
      },
    ],
    visibility: {
      showProjects: {
        type: Boolean,
        default: true,
      },
      showCourses: {
        type: Boolean,
        default: true,
      },
      showHackathons: {
        type: Boolean,
        default: true,
      },
      showInternships: {
        type: Boolean,
        default: true,
      },
      showCertifications: {
        type: Boolean,
        default: true,
      },
    },
    template: {
      type: String,
      enum: ['modern', 'classic', 'minimal'],
      default: 'modern',
    },
    completeness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);