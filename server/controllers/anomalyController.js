const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const stats = require('simple-statistics');

const detectAnomalies = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }

    const recentSales = await Sale.find({
      ...query,
      status: 'completed',
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    });

    if (recentSales.length < 10) {
      return res.json({ anomalies: [], message: 'Insufficient data for anomaly detection' });
    }

    const amounts = recentSales.map(s => s.amount);
    const mean = stats.mean(amounts);
    const stdDev = stats.standardDeviation(amounts);
    const threshold = 2.5;

    const anomalies = [];

    for (const sale of recentSales) {
      const zScore = Math.abs((sale.amount - mean) / stdDev);
      
      if (zScore > threshold) {
        anomalies.push({
          sale: {
            id: sale._id,
            customerName: sale.customerName,
            product: sale.product,
            amount: sale.amount,
            date: sale.date,
            agentName: sale.agentName,
          },
          type: sale.amount > mean ? 'unusually_high' : 'unusually_low',
          zScore: zScore.toFixed(2),
          deviation: ((sale.amount - mean) / mean * 100).toFixed(2),
          severity: zScore > 3 ? 'critical' : 'warning',
        });
      }
    }

    const dailySales = {};
    recentSales.forEach(sale => {
      const dateKey = sale.date.toISOString().split('T')[0];
      dailySales[dateKey] = (dailySales[dateKey] || 0) + 1;
    });

    const dailyCounts = Object.values(dailySales);
    if (dailyCounts.length > 0) {
      const avgDaily = stats.mean(dailyCounts);
      const today = new Date().toISOString().split('T')[0];
      const todayCount = dailySales[today] || 0;
      
      if (todayCount < avgDaily * 0.3 && todayCount > 0) {
        anomalies.push({
          type: 'low_activity',
          message: `Sales activity today (${todayCount}) is ${((1 - todayCount/avgDaily) * 100).toFixed(0)}% below average`,
          severity: 'warning',
        });
      }
    }

    res.json({
      anomalies,
      stats: {
        totalSales: recentSales.length,
        avgAmount: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        anomalyCount: anomalies.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { detectAnomalies };