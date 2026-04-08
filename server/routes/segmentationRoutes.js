const express = require('express');
const { getCustomerSegments } = require('../controllers/segmentationController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, admin, getCustomerSegments);

module.exports = router;