const express = require('express');
const {
  getDashboardStats,
  getSalesAnalytics,
  getAgentPerformance,
  getBusinessHealthScore,
  getGeoAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, getSalesAnalytics);
router.get('/agents', protect, getAgentPerformance);
router.get('/health', protect, getBusinessHealthScore);
router.get('/geo', protect, getGeoAnalytics);

module.exports = router;