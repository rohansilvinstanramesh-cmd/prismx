const Target = require('../models/Target');
const Sale = require('../models/Sale');

const getTargets = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }
    
    const targets = await Target.find(query).sort({ createdAt: -1 });
    
    for (let target of targets) {
      const sales = await Sale.find({
        agentId: target.agentId,
        status: 'completed',
        quarter: target.quarter,
      });
      
      target.achievedSales = sales.length;
      target.achievedRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
      
      const revenueProgress = (target.achievedRevenue / target.targetRevenue) * 100;
      const salesProgress = (target.achievedSales / target.targetSales) * 100;
      
      if (target.status === 'active') {
        if (revenueProgress >= 100 && salesProgress >= 100) {
          target.status = 'completed';
        }
      }
      
      await target.save();
    }
    
    res.json(targets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTarget = async (req, res) => {
  try {
    const { agentId, agentName, targetRevenue, targetSales, period, quarter, year } = req.body;
    
    const target = await Target.create({
      agentId,
      agentName,
      targetRevenue,
      targetSales,
      period,
      quarter,
      year,
    });
    
    res.status(201).json(target);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTarget = async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    
    Object.assign(target, req.body);
    await target.save();
    
    res.json(target);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTarget = async (req, res) => {
  try {
    const target = await Target.findByIdAndDelete(req.params.id);
    
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    
    res.json({ message: 'Target deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTargets, createTarget, updateTarget, deleteTarget };