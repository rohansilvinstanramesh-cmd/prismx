const stats = require('simple-statistics');
const Sale = require('../models/Sale');

const getSalesForecast = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    let query = {};
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }
    
    const historicalSales = await Sale.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          revenue: { $sum: '$amount' },
          sales: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    if (historicalSales.length < 3) {
      return res.json({
        forecast: [],
        message: 'Insufficient data for forecasting. Need at least 3 months of data.',
      });
    }

    const revenueData = historicalSales.map((item, index) => [index, item.revenue]);
    const salesData = historicalSales.map((item, index) => [index, item.sales]);

    const revenueRegression = stats.linearRegression(revenueData);
    const salesRegression = stats.linearRegression(salesData);

    const forecast = [];
    const startIndex = historicalSales.length;
    const currentDate = new Date();

    for (let i = 0; i < parseInt(months); i++) {
      const futureDate = new Date(currentDate);
      futureDate.setMonth(currentDate.getMonth() + i + 1);
      
      const predictedRevenue = Math.max(0, Math.round(
        revenueRegression.m * (startIndex + i) + revenueRegression.b
      ));
      const predictedSales = Math.max(0, Math.round(
        salesRegression.m * (startIndex + i) + salesRegression.b
      ));

      forecast.push({
        month: futureDate.getMonth() + 1,
        year: futureDate.getFullYear(),
        monthName: futureDate.toLocaleString('default', { month: 'short' }),
        predictedRevenue,
        predictedSales,
        confidence: Math.max(60, 95 - (i * 5)),
      });
    }

    const totalPredicted = forecast.reduce((sum, f) => sum + f.predictedRevenue, 0);
    const avgMonthly = totalPredicted / forecast.length;
    const trend = revenueRegression.m > 0 ? 'upward' : 'downward';

    res.json({
      forecast,
      historical: historicalSales,
      insights: {
        totalPredicted,
        avgMonthly,
        trend,
        growthRate: ((revenueRegression.m / revenueRegression.b) * 100).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSalesForecast };