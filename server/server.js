const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const salesRoutes = require('./routes/salesRoutes');
const customersRoutes = require('./routes/customersRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const anomalyRoutes = require('./routes/anomalyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const targetRoutes = require('./routes/targetRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const segmentationRoutes = require('./routes/segmentationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CORS_ORIGINS || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrismX API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/segmentation', segmentationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/database', databaseRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PrismX Server running on port ${PORT}`);
});