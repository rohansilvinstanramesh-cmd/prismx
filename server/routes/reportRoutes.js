const express = require('express');
const {
  exportSalesToCSV,
  exportSalesToPDF,
  exportCustomersToCSV,
  exportSalesToExcel,
  exportCustomersToExcel,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/sales/csv', protect, exportSalesToCSV);
router.get('/sales/pdf', protect, exportSalesToPDF);
router.get('/sales/excel', protect, exportSalesToExcel);
router.get('/customers/csv', protect, exportCustomersToCSV);
router.get('/customers/excel', protect, exportCustomersToExcel);

module.exports = router;