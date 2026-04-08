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
    
    // Batch fetch all users at once to avoid N+1 query problem
    const agentIds = leaderboard.map(entry => entry._id);
    const users = await User.find({ _id: { $in: agentIds } }).select('avatar email');
    
    // Create a Map for O(1) lookup
    const userMap = new Map(users.map(user => [user._id.toString(), user]));
    
    const enrichedLeaderboard = leaderboard.map((entry, index) => {
      const user = userMap.get(entry._id.toString());
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
    });
    
    res.json(enrichedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };