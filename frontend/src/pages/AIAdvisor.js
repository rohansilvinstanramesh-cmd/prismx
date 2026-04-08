import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Brain, Sparkle, TrendUp } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';

const AIAdvisor = () => {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [context, setContext] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const contextData = context || `
        Current business metrics:
        - Total Revenue: $${stats?.totalRevenue?.toLocaleString() || 0}
        - Total Sales: ${stats?.totalSales || 0}
        - Active Customers: ${stats?.activeCustomers || 0}
        - Monthly Revenue: $${stats?.monthlyRevenue?.toLocaleString() || 0}
        
        Provide strategic recommendations to improve sales and customer engagement.
      `;

      const { data } = await api.post('/ai/recommendations', {
        context: contextData,
      });

      setRecommendation(data.recommendation);
      toast.success('AI recommendation generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8" data-testid="ai-advisor-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2 flex items-center gap-3">
          <Brain size={40} weight="fill" className="text-indigo-500" />
          AI Decision Advisor
        </h1>
        <p className="text-zinc-400 text-base">Get AI-powered insights and recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <TrendUp size={24} weight="bold" className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-heading font-semibold">Revenue</h3>
          </div>
          <p className="text-3xl font-heading font-bold tracking-tight">
            ${stats?.totalRevenue?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-zinc-400 mt-1">Total Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkle size={24} weight="fill" className="text-purple-400" />
            </div>
            <h3 className="text-lg font-heading font-semibold">Sales</h3>
          </div>
          <p className="text-3xl font-heading font-bold tracking-tight">
            {stats?.totalSales?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-zinc-400 mt-1">Total Transactions</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Brain size={24} weight="fill" className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-heading font-semibold">Customers</h3>
          </div>
          <p className="text-3xl font-heading font-bold tracking-tight">
            {stats?.activeCustomers?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-zinc-400 mt-1">Active Customers</p>
        </div>
      </div>

      <div
        className="relative bg-zinc-900 border border-indigo-500/30 rounded-lg p-8 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1714548529197-537c1f0b6aa7?w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2 uppercase tracking-wider">
              Custom Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe specific business challenges or areas you want insights on..."
              className="w-full px-4 py-3 bg-zinc-800/80 backdrop-blur-sm border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              data-testid="context-input"
            />
          </div>

          <Button
            onClick={getRecommendation}
            disabled={loading}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:brightness-110 px-8 py-6 text-lg font-semibold"
            data-testid="generate-recommendation-button"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkle size={24} weight="fill" className="mr-3" />
                Generate AI Recommendations
              </>
            )}
          </Button>

          {recommendation && (
            <div className="mt-8 p-6 bg-zinc-800/80 backdrop-blur-sm border-l-4 border-indigo-500 rounded-lg" data-testid="recommendation-result">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={24} weight="fill" className="text-indigo-400" />
                <h3 className="text-xl font-heading font-semibold">AI Recommendations</h3>
              </div>
              <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {recommendation}
              </p>
              <p className="text-xs text-zinc-500 mt-4 uppercase tracking-wider">
                Powered by OpenAI GPT
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;