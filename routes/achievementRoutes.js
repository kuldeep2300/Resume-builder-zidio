const express = require('express');
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementStats,
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getAchievements).post(protect, createAchievement);

router.get('/stats', protect, getAchievementStats);

router
  .route('/:id')
  .get(protect, getAchievement)
  .put(protect, updateAchievement)
  .delete(protect, deleteAchievement);

module.exports = router;