import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { TrendUp, Calendar, ChartLine } from '@phosphor-icons/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Forecast = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    fetchForecast();
  }, [months]);

  const fetchForecast = async () => {
    try {
      const { data } = await api.get(`/forecast?months=${months}`);
      setForecast(data);
    } catch (error) {
      toast.error('Failed to load forecast');
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

  const chartData = forecast?.forecast?.map((item) => ({
    name: `${item.monthName} ${item.year}`,
    predicted: item.predictedRevenue,
    confidence: item.confidence,
  })) || [];

  return (
    <div className="p-8" data-testid="forecast-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2 flex items-center gap-3">
          <ChartLine size={40} weight="bold" className="text-indigo-500" />
          Sales Forecasting
        </h1>
        <p className="text-zinc-400 text-base">AI-powered sales predictions and trend analysis</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[3, 6, 12].map((m) => (
          <button
            key={m}
            onClick={() => setMonths(m)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              months === m
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            data-testid={`forecast-${m}-months`}
          >
            {m} Months
          </button>
        ))}
      </div>

      {forecast?.insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={20} className="text-indigo-400" />
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Total Predicted</h3>
            </div>
            <p className="text-3xl font-heading font-bold tracking-tight">
              ${forecast.insights.totalPredicted.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-purple-400" />
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Avg Monthly</h3>
            </div>
            <p className="text-3xl font-heading font-bold tracking-tight">
              ${Math.round(forecast.insights.avgMonthly).toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <ChartLine size={20} className="text-emerald-400" />
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Trend</h3>
            </div>
            <p className="text-3xl font-heading font-bold tracking-tight capitalize">
              {forecast.insights.trend}
            </p>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={20} className="text-blue-400" />
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Growth Rate</h3>
            </div>
            <p className="text-3xl font-heading font-bold tracking-tight">
              {forecast.insights.growthRate}%
            </p>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8" data-testid="forecast-chart">
        <h3 className="text-xl font-heading font-semibold mb-4">Revenue Forecast</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#6366f1"
              strokeWidth={3}
              name="Predicted Revenue"
              dot={{ r: 6, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="forecast-table">
        <h3 className="text-xl font-heading font-semibold mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Predicted Revenue</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Predicted Sales</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {forecast?.forecast?.map((item, index) => (
                <tr key={index} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    {item.monthName} {item.year}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-emerald-400">
                    ${item.predictedRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{item.predictedSales}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm text-zinc-400 font-medium">{item.confidence}%</span>
                    </div>
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

export default Forecast;