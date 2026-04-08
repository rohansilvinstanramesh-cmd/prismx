const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  performance: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?w=200',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Agent', agentSchema);