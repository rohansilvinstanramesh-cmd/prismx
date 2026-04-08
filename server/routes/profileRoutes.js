const express = require('express');
const { updateProfile, updatePassword, deleteAvatar, upload } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/update', protect, upload.single('avatar'), updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/avatar', protect, deleteAvatar);

module.exports = router;
