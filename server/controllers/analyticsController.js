const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Region = require('../models/Region');

const getDashboardStats = async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    
    const monthlySales = await Sale.countDocuments({
      date: { $gte: monthStart }
    });

    const monthlyRevenue = await Sale.aggregate([
      { $match: { date: { $gte: monthStart }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      activeCustomers,
      monthlySales,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesAnalytics = async (req, res) => {
  try {
    const salesByMonth = await Sale.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const salesByRegion = await Sale.aggregate([
      {
        $group: {
          _id: '$region',
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const salesByProduct = await Sale.aggregate([
      {
        $group: {
          _id: '$product',
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      salesByMonth,
      salesByRegion,
      salesByProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgentPerformance = async (req, res) => {
  try {
    const performance = await Sale.aggregate([
      {
        $group: {
          _id: '$agentId',
          agentName: { $first: '$agentName' },
          totalSales: { $sum: 1 },
          revenue: { $sum: '$amount' },
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBusinessHealthScore = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);

    const currentMonthSales = await Sale.countDocuments({
      date: { $gte: monthStart }
    });

    const lastMonthSales = await Sale.countDocuments({
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    const currentMonthRevenue = await Sale.aggregate([
      { $match: { date: { $gte: monthStart }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const lastMonthRevenue = await Sale.aggregate([
      { $match: { date: { $gte: lastMonthStart, $lte: lastMonthEnd }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const salesGrowth = lastMonthSales > 0 
      ? ((currentMonthSales - lastMonthSales) / lastMonthSales * 100).toFixed(2)
      : 0;

    const revenueGrowth = (lastMonthRevenue[0]?.total || 0) > 0
      ? (((currentMonthRevenue[0]?.total || 0) - (lastMonthRevenue[0]?.total || 0)) / (lastMonthRevenue[0]?.total || 0) * 100).toFixed(2)
      : 0;

    const activeCustomersCount = await Customer.countDocuments({ status: 'active' });
    const totalCustomersCount = await Customer.countDocuments();
    const customerRetention = totalCustomersCount > 0
      ? ((activeCustomersCount / totalCustomersCount) * 100).toFixed(2)
      : 0;

    const healthScore = Math.min(
      100,
      Math.round(
        (parseFloat(salesGrowth) > 0 ? 25 : 0) +
        (parseFloat(revenueGrowth) > 0 ? 35 : 0) +
        (parseFloat(customerRetention) * 0.4)
      )
    );

    res.json({
      healthScore,
      salesGrowth: parseFloat(salesGrowth),
      revenueGrowth: parseFloat(revenueGrowth),
      customerRetention: parseFloat(customerRetention),
      currentMonthSales,
      currentMonthRevenue: currentMonthRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGeoAnalytics = async (req, res) => {
  try {
    const regions = await Region.find();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getAgentPerformance,
  getBusinessHealthScore,
  getGeoAnalytics,
};