const express = require('express');
const { detectAnomalies } = require('../controllers/anomalyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, detectAnomalies);

module.exports = router;