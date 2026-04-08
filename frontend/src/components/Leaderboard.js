import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Trophy, Medal, Crown, TrendUp } from '@phosphor-icons/react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get(`/leaderboard?period=${period}`);
      setLeaderboard(data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} weight="fill" className="text-yellow-400" />;
    if (rank === 2) return <Medal size={24} weight="fill" className="text-gray-400" />;
    if (rank === 3) return <Medal size={24} weight="fill" className="text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="leaderboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Trophy size={28} weight="fill" className="text-yellow-400" />
          Agent Leaderboard
        </h2>
        <div className="flex gap-2">
          {['month', 'quarter', 'year', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                period === p
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
              data-testid={`period-${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((agent) => (
          <div
            key={agent.agentId}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
              agent.rank <= 3
                ? 'bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/30'
                : 'bg-zinc-800/50 hover:bg-zinc-800'
            }`}
            data-testid="leaderboard-item"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 font-bold">
              {getRankIcon(agent.rank) || (
                <span className="text-lg text-zinc-400">#{agent.rank}</span>
              )}
            </div>

            <img
              src={agent.avatar || 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?w=100'}
              alt={agent.agentName}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold text-white">{agent.agentName}</h3>
              <p className="text-sm text-zinc-400">{agent.email}</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-mono font-bold text-emerald-400">
                ${agent.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-400">{agent.totalSales} sales</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-24 bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full"
                  style={{ width: `${agent.performance}%` }}
                />
              </div>
              <span className="text-sm text-zinc-400 w-12">{agent.performance}%</span>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={64} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500">No data available for this period</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;