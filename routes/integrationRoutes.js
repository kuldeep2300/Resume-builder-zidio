const express = require('express');
const {
  getIntegrations,
  createIntegration,
  simulateWebhook,
  toggleIntegration,
  deleteIntegration,
} = require('../controllers/integrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getIntegrations).post(protect, createIntegration);

router.post('/webhook', simulateWebhook); // Public endpoint for webhooks

router.patch('/:id/toggle', protect, toggleIntegration);
router.delete('/:id', protect, deleteIntegration);

module.exports = router;