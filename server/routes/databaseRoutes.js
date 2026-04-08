const express = require('express');
const { getDatabaseStats, testConnection } = require('../controllers/databaseController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, admin, getDatabaseStats);
router.get('/test', protect, testConnection);

module.exports = router;
