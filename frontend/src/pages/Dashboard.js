import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ArrowUp, ArrowDown, TrendUp, Users, ShoppingCart, CurrencyDollar } from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes, healthRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/sales'),
        api.get('/analytics/health'),
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setHealthScore(healthRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      change: healthScore?.revenueGrowth || 0,
      icon: CurrencyDollar,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Total Sales',
      value: stats?.totalSales?.toLocaleString() || 0,
      change: healthScore?.salesGrowth || 0,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Active Customers',
      value: stats?.activeCustomers?.toLocaleString() || 0,
      change: healthScore?.customerRetention || 0,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Business Health',
      value: `${healthScore?.healthScore || 0}%`,
      change: healthScore?.healthScore || 0,
      icon: TrendUp,
      color: 'from-orange-500 to-red-600',
    },
  ];

  const salesChartData = analytics?.salesByMonth?.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    sales: item.sales,
  })) || [];

  const regionChartData = analytics?.salesByRegion?.map((item) => ({
    name: item._id,
    revenue: item.revenue,
    sales: item.sales,
  })) || [];

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-zinc-400 text-base">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;
          return (
            <div
              key={index}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all"
              data-testid={`kpi-card-${index}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon size={24} weight="bold" className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isPositive ? <ArrowUp size={16} weight="bold" /> : <ArrowDown size={16} weight="bold" />}
                  <span>{Math.abs(card.change).toFixed(1)}%</span>
                </div>
              </div>
              <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-1">{card.title}</h3>
              <p className="text-3xl font-heading font-bold tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="sales-trend-chart">
          <h3 className="text-xl font-heading font-semibold mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: 12 }} />
              <YAxis stroke="#52525b" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="region-performance-chart">
          <h3 className="text-xl font-heading font-semibold mb-4">Regional Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionChartData}>
              <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: 12 }} />
              <YAxis stroke="#52525b" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="business-health-panel">
        <h3 className="text-xl font-heading font-semibold mb-4">Business Health Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-5xl font-heading font-bold tracking-tight mb-2 bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {healthScore?.healthScore || 0}
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider">Overall Score</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold mb-2">
              {healthScore?.salesGrowth >= 0 ? '+' : ''}{healthScore?.salesGrowth?.toFixed(1)}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider">Sales Growth</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold mb-2">
              {healthScore?.revenueGrowth >= 0 ? '+' : ''}{healthScore?.revenueGrowth?.toFixed(1)}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider">Revenue Growth</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold mb-2">
              {healthScore?.customerRetention?.toFixed(1)}%
            </div>
            <p className="text-sm text-zinc-400 uppercase tracking-wider">Customer Retention</p>
          </div>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-8">
          <Leaderboard />
        </div>
      )}
    </div>
  );
};

export default Dashboard;