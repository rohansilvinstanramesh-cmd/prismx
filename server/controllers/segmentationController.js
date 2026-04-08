const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

const getCustomerSegments = async (req, res) => {
  try {
    const customers = await Customer.find();
    
    const segments = {
      vip: [],
      active: [],
      atRisk: [],
      inactive: [],
    };
    
    const avgPurchase = customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length;
    
    for (const customer of customers) {
      const daysSinceLastPurchase = customer.lastPurchase 
        ? Math.floor((new Date() - new Date(customer.lastPurchase)) / (1000 * 60 * 60 * 24))
        : 999;
      
      const recentSales = await Sale.countDocuments({
        customerId: customer._id,
        date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      });
      
      if (customer.totalPurchases > avgPurchase * 2 && daysSinceLastPurchase < 60) {
        segments.vip.push(customer);
      } else if (customer.status === 'active' && daysSinceLastPurchase < 90) {
        segments.active.push(customer);
      } else if (customer.status === 'active' && daysSinceLastPurchase >= 90 && daysSinceLastPurchase < 180) {
        segments.atRisk.push(customer);
      } else {
        segments.inactive.push(customer);
      }
    }
    
    const summary = {
      vip: {
        count: segments.vip.length,
        totalValue: segments.vip.reduce((sum, c) => sum + c.totalPurchases, 0),
        avgValue: segments.vip.length > 0 ? segments.vip.reduce((sum, c) => sum + c.totalPurchases, 0) / segments.vip.length : 0,
      },
      active: {
        count: segments.active.length,
        totalValue: segments.active.reduce((sum, c) => sum + c.totalPurchases, 0),
      },
      atRisk: {
        count: segments.atRisk.length,
        potentialLoss: segments.atRisk.reduce((sum, c) => sum + c.totalPurchases, 0),
      },
      inactive: {
        count: segments.inactive.length,
      },
    };
    
    res.json({ segments, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomerSegments };