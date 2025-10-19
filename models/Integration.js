const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['devpost', 'coursera', 'udemy', 'github', 'linkedin'],
      required: true,
    },
    platformUserId: {
      type: String,
      default: '',
    },
    apiKey: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSynced: {
      type: Date,
      default: null,
    },
    syncCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate integrations
integrationSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);