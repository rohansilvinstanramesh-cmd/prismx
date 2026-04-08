const mongoose = require('mongoose');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Region = require('../models/Region');
const connectDB = require('../config/db');
require('dotenv').config();

const products = ['Enterprise Suite', 'Cloud Storage', 'Analytics Pro', 'Security Plus', 'API Access', 'Premium Support'];
const companies = ['Tech Corp', 'Data Inc', 'Cloud Solutions', 'Startup Labs', 'Global Systems', 'Digital Ventures'];
const regions = [
  { name: 'North America', country: 'USA', coordinates: { lat: 37.0902, lng: -95.7129 } },
  { name: 'Europe', country: 'Germany', coordinates: { lat: 51.1657, lng: 10.4515 } },
  { name: 'Asia Pacific', country: 'Singapore', coordinates: { lat: 1.3521, lng: 103.8198 } },
  { name: 'South America', country: 'Brazil', coordinates: { lat: -14.2350, lng: -51.9253 } },
  { name: 'Middle East', country: 'UAE', coordinates: { lat: 23.4241, lng: 53.8478 } },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Sale.deleteMany({});
    await Customer.deleteMany({});
    await Agent.deleteMany({});
    await Region.deleteMany({});

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@prismx.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=200',
    });

    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const agent = await User.create({
        name: `Sales Agent ${i}`,
        email: `agent${i}@prismx.com`,
        password: 'agent123',
        role: 'sales_agent',
        avatar: i % 2 === 0 
          ? 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?w=200'
          : 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=200',
      });
      agents.push(agent);
    }

    console.log('Creating regions...');
    const createdRegions = await Region.insertMany(regions);

    console.log('Creating customers...');
    const customers = [];
    for (let i = 1; i <= 30; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const customer = await Customer.create({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        region: region.name,
        status: ['active', 'inactive', 'prospect'][Math.floor(Math.random() * 3)],
        totalPurchases: 0,
      });
      customers.push(customer);
    }

    console.log('Creating sales...');
    const sales = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 100; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const saleDate = new Date(currentDate);
      saleDate.setDate(saleDate.getDate() - randomDaysAgo);
      
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const amount = Math.floor(Math.random() * 50000) + 5000;

      const sale = await Sale.create({
        customerName: customer.name,
        product,
        amount,
        region: region.name,
        agentId: agent._id,
        agentName: agent.name,
        status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 10) < 8 ? 0 : Math.floor(Math.random() * 3)],
        date: saleDate,
        quarter: `Q${Math.ceil((saleDate.getMonth() + 1) / 3)} ${saleDate.getFullYear()}`,
        customerId: customer._id,
      });
      sales.push(sale);

      if (sale.status === 'completed') {
        customer.totalPurchases += amount;
        customer.lastPurchase = saleDate;
        await customer.save();
      }
    }

    console.log('Updating region statistics...');
    for (const region of createdRegions) {
      const regionSales = await Sale.find({ region: region.name, status: 'completed' });
      region.sales = regionSales.length;
      region.revenue = regionSales.reduce((sum, sale) => sum + sale.amount, 0);
      region.customers = await Customer.countDocuments({ region: region.name });
      await region.save();
    }

    console.log('Creating agent profiles...');
    for (const agent of agents) {
      const agentSales = await Sale.find({ agentId: agent._id, status: 'completed' });
      const revenue = agentSales.reduce((sum, sale) => sum + sale.amount, 0);
      
      await Agent.create({
        userId: agent._id,
        name: agent.name,
        email: agent.email,
        region: regions[Math.floor(Math.random() * regions.length)].name,
        totalSales: agentSales.length,
        revenue,
        performance: Math.min(100, Math.round((agentSales.length / 20) * 100)),
        avatar: agent.avatar,
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@prismx.com / admin123');
    console.log('Agent: agent1@prismx.com / agent123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();