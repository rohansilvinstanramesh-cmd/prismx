const express = require('express');
const { getAIRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/recommendations', protect, getAIRecommendations);

module.exports = router;