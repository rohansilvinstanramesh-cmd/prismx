const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const path = require('path');
const fs = require('fs');

const exportSalesToCSV = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }
    
    const sales = await Sale.find(query).sort({ date: -1 });
    
    const csvPath = path.join('/tmp', `sales_export_${Date.now()}.csv`);
    
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'customerName', title: 'Customer' },
        { id: 'product', title: 'Product' },
        { id: 'amount', title: 'Amount' },
        { id: 'region', title: 'Region' },
        { id: 'status', title: 'Status' },
        { id: 'agentName', title: 'Agent' },
        { id: 'date', title: 'Date' },
        { id: 'quarter', title: 'Quarter' },
      ]
    });
    
    const records = sales.map(sale => ({
      customerName: sale.customerName,
      product: sale.product,
      amount: sale.amount,
      region: sale.region,
      status: sale.status,
      agentName: sale.agentName,
      date: new Date(sale.date).toLocaleDateString(),
      quarter: sale.quarter,
    }));
    
    await csvWriter.writeRecords(records);
    
    res.download(csvPath, 'sales_report.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      fs.unlinkSync(csvPath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportSalesToPDF = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'sales_agent') {
      query.agentId = req.user._id;
    }
    
    const sales = await Sale.find(query).sort({ date: -1 }).limit(50);
    
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
    
    doc.pipe(res);
    
    doc.fontSize(20).text('PrismX Sales Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    doc.fontSize(12).text(`Total Sales: ${sales.length}`);
    doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`);
    doc.moveDown(2);
    
    doc.fontSize(10);
    const tableTop = doc.y;
    const itemHeight = 25;
    
    doc.text('Customer', 50, tableTop);
    doc.text('Product', 150, tableTop);
    doc.text('Amount', 280, tableTop);
    doc.text('Region', 350, tableTop);
    doc.text('Date', 450, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    sales.slice(0, 30).forEach((sale, index) => {
      const y = tableTop + 20 + (index * itemHeight);
      
      if (y > 700) {
        doc.addPage();
        return;
      }
      
      doc.text(sale.customerName.substring(0, 15), 50, y);
      doc.text(sale.product.substring(0, 18), 150, y);
      doc.text(`$${sale.amount.toLocaleString()}`, 280, y);
      doc.text(sale.region.substring(0, 12), 350, y);
      doc.text(new Date(sale.date).toLocaleDateString(), 450, y);
    });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportCustomersToCSV = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ totalPurchases: -1 });
    
    const csvPath = path.join('/tmp', `customers_export_${Date.now()}.csv`);
    
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'company', title: 'Company' },
        { id: 'region', title: 'Region' },
        { id: 'status', title: 'Status' },
        { id: 'totalPurchases', title: 'Total Purchases' },
        { id: 'lastPurchase', title: 'Last Purchase' },
      ]
    });
    
    const records = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      company: customer.company || '',
      region: customer.region,
      status: customer.status,
      totalPurchases: customer.totalPurchases,
      lastPurchase: customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'N/A',
    }));
    
    await csvWriter.writeRecords(records);
    
    res.download(csvPath, 'customers_report.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      fs.unlinkSync(csvPath);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportSalesToCSV,
  exportSalesToPDF,
  exportCustomersToCSV,
};