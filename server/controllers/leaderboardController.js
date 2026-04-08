const Sale = require('../models/Sale');
const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'month') {
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), quarter * 3, 1)
        }
      };
    } else if (period === 'year') {
      dateFilter = {
        date: {
          $gte: new Date(now.getFullYear(), 0, 1)
        }
      };
    }
    
    const leaderboard = await Sale.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: '$agentId',
          agentName: { $first: '$agentName' },
          totalSales: { $sum: 1 },
          revenue: { $sum: '$amount' },
          avgDealSize: { $avg: '$amount' },
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 }
    ]);
    
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const user = await User.findById(entry._id).select('avatar email');
        return {
          rank: index + 1,
          agentId: entry._id,
          agentName: entry.agentName,
          avatar: user?.avatar,
          email: user?.email,
          totalSales: entry.totalSales,
          revenue: entry.revenue,
          avgDealSize: Math.round(entry.avgDealSize),
          performance: Math.min(100, Math.round((entry.revenue / 500000) * 100)),
        };
      })
    );
    
    res.json(enrichedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };