const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  company: {
    type: String,
  },
  region: {
    type: String,
    required: true,
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastPurchase: {
    type: Date,
  },
});

module.exports = mongoose.model('Customer', customerSchema);