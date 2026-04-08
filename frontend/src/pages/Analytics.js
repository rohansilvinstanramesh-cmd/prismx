import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, agentsRes] = await Promise.all([
        api.get('/analytics/sales'),
        api.get('/analytics/agents'),
      ]);
      setAnalytics(analyticsRes.data);
      setAgentPerformance(agentsRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const productData = analytics?.salesByProduct?.map((item) => ({
    name: item._id,
    value: item.revenue,
  })) || [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="p-8" data-testid="analytics-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-zinc-400 text-base">Detailed performance insights and metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="agent-performance-chart">
          <h3 className="text-xl font-heading font-semibold mb-4">Agent Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformance}>
              <XAxis dataKey="agentName" stroke="#52525b" style={{ fontSize: 12 }} />
              <YAxis stroke="#52525b" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="product-distribution-chart">
          <h3 className="text-xl font-heading font-semibold mb-4">Product Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="agent-performance-table">
        <h3 className="text-xl font-heading font-semibold mb-4">Top Performing Agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {agentPerformance.map((agent, index) => (
                <tr key={index} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{agent.agentName}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{agent.totalSales}</td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-400">
                    ${agent.revenue?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;