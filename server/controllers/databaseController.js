const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Region = require('../models/Region');
const Notification = require('../models/Notification');
const Target = require('../models/Target');

const getDatabaseStats = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const stats = await mongoose.connection.db.stats();
    
    const collections = await Promise.all([
      Sale.countDocuments(),
      Customer.countDocuments(),
      User.countDocuments(),
      Agent.countDocuments(),
      Region.countDocuments(),
      Notification.countDocuments(),
      Target.countDocuments(),
    ]);

    const [salesCount, customersCount, usersCount, agentsCount, regionsCount, notificationsCount, targetsCount] = collections;

    res.json({
      status: stateMap[dbState],
      database: {
        name: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      },
      stats: {
        collections: stats.collections,
        dataSize: (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
        storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
        indexes: stats.indexes,
        indexSize: (stats.indexSize / 1024 / 1024).toFixed(2) + ' MB',
      },
      documents: {
        sales: salesCount,
        customers: customersCount,
        users: usersCount,
        agents: agentsCount,
        regions: regionsCount,
        notifications: notificationsCount,
        targets: targetsCount,
        total: salesCount + customersCount + usersCount + agentsCount + regionsCount + notificationsCount + targetsCount,
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

const testConnection = async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'connected',
      message: 'MongoDB connection is healthy',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected',
      message: 'MongoDB connection failed',
      error: error.message 
    });
  }
};

module.exports = { getDatabaseStats, testConnection };
