const express = require('express');
const { getSalesForecast } = require('../controllers/forecastController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getSalesForecast);

module.exports = router;