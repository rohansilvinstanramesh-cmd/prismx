const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agentName: {
    type: String,
    required: true,
  },
  targetRevenue: {
    type: Number,
    required: true,
  },
  targetSales: {
    type: Number,
    required: true,
  },
  achievedRevenue: {
    type: Number,
    default: 0,
  },
  achievedSales: {
    type: Number,
    default: 0,
  },
  period: {
    type: String,
    required: true,
  },
  quarter: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'missed'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Target', targetSchema);