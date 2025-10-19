const express = require('express');
const {
  getResume,
  updateResume,
  updateVisibility,
  regenerateSummary,
  getResumePreview,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getResume).put(protect, updateResume);

router.patch('/visibility', protect, updateVisibility);
router.post('/regenerate-summary', protect, regenerateSummary);
router.get('/preview', protect, getResumePreview);

module.exports = router;