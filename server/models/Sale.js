const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  quarter: {
    type: String,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
});

module.exports = mongoose.model('Sale', saleSchema);