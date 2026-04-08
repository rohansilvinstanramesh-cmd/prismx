const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

const getAllSales = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }
    
    const sales = await Sale.find(query).sort({ date: -1 }).populate('agentId', 'name email');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('agentId', 'name email');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    if (req.user.role === 'sales_agent' && sale.agentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSale = async (req, res) => {
  try {
    const { customerName, product, amount, region, status, customerId } = req.body;

    const sale = await Sale.create({
      customerName,
      product,
      amount,
      region,
      agentId: req.user._id,
      agentName: req.user.name,
      status,
      customerId,
      date: new Date(),
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
    });

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalPurchases: amount },
        lastPurchase: new Date(),
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    if (req.user.role === 'sales_agent' && sale.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    sale.customerName = req.body.customerName || sale.customerName;
    sale.product = req.body.product || sale.product;
    sale.amount = req.body.amount || sale.amount;
    sale.region = req.body.region || sale.region;
    sale.status = req.body.status || sale.status;

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    if (req.user.role === 'sales_agent' && sale.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Sale.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sale removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
};