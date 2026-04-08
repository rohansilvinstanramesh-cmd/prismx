const express = require('express');
const { getTargets, createTarget, updateTarget, deleteTarget } = require('../controllers/targetController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getTargets);
router.post('/', protect, admin, createTarget);
router.put('/:id', protect, admin, updateTarget);
router.delete('/:id', protect, admin, deleteTarget);

module.exports = router;