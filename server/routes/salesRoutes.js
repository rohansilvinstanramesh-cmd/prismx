const express = require('express');
const {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getAllSales)
  .post(protect, createSale);

router.route('/:id')
  .get(protect, getSaleById)
  .put(protect, updateSale)
  .delete(protect, deleteSale);

module.exports = router;