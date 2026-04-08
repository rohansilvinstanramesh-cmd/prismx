const express = require('express');
const {
  exportSalesToCSV,
  exportSalesToPDF,
  exportCustomersToCSV,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/sales/csv', protect, exportSalesToCSV);
router.get('/sales/pdf', protect, exportSalesToPDF);
router.get('/customers/csv', protect, exportCustomersToCSV);

module.exports = router;