import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Target as TargetIcon, TrendUp, Trophy } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    agentId: '',
    agentName: '',
    targetRevenue: '',
    targetSales: '',
    period: 'Q1',
    quarter: 'Q1 2026',
    year: 2026,
  });

  useEffect(() => {
    fetchTargets();
    if (user.role === 'admin') {
      fetchAgents();
    }
  }, [user]);

  const fetchTargets = async () => {
    try {
      const { data } = await api.get('/targets');
      setTargets(data);
    } catch (error) {
      toast.error('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/analytics/agents');
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/targets', formData);
      toast.success('Target created successfully');
      setIsDialogOpen(false);
      fetchTargets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create target');
    }
  };

  const calculateProgress = (achieved, target) => {
    return Math.min(100, Math.round((achieved / target) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="targets-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight mb-2 flex items-center gap-3">
            <TargetIcon size={40} weight="bold" className="text-indigo-500" />
            Targets & Achievements
          </h1>
          <p className="text-zinc-400 text-base">Track performance goals and milestones</p>
        </div>
        {user.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-indigo-500 to-purple-600" data-testid="add-target-button">
                Set New Target
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading">Create New Target</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Agent</label>
                  <select
                    value={formData.agentId}
                    onChange={(e) => {
                      const agent = agents.find(a => a._id === e.target.value);
                      setFormData({ ...formData, agentId: e.target.value, agentName: agent?.agentName || '' });
                    }}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                    required
                  >
                    <option value="">Select Agent</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>{agent.agentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Target Revenue ($)</label>
                  <input
                    type="number"
                    value={formData.targetRevenue}
                    onChange={(e) => setFormData({ ...formData, targetRevenue: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Target Sales Count</label>
                  <input
                    type="number"
                    value={formData.targetSales}
                    onChange={(e) => setFormData({ ...formData, targetSales: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Quarter</label>
                  <input
                    type="text"
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md text-white"
                    placeholder="Q1 2026"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  Create Target
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {targets.map((target) => {
          const revenueProgress = calculateProgress(target.achievedRevenue, target.targetRevenue);
          const salesProgress = calculateProgress(target.achievedSales, target.targetSales);
          const overallProgress = Math.round((revenueProgress + salesProgress) / 2);

          return (
            <div
              key={target._id}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-indigo-500/30 transition-all"
              data-testid="target-card"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-heading font-semibold">{target.agentName}</h3>
                  <p className="text-sm text-zinc-400">{target.quarter}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    target.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : target.status === 'active'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {target.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-zinc-400">Revenue Progress</span>
                    <span className="text-sm font-mono text-emerald-400">
                      ${target.achievedRevenue?.toLocaleString() || 0} / ${target.targetRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-500"
                      style={{ width: `${revenueProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 text-right">{revenueProgress}%</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-zinc-400">Sales Progress</span>
                    <span className="text-sm font-mono text-blue-400">
                      {target.achievedSales || 0} / {target.targetSales}
                    </span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                      style={{ width: `${salesProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 text-right">{salesProgress}%</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Overall Achievement</span>
                    <div className="flex items-center gap-2">
                      {overallProgress >= 75 && <Trophy size={20} weight="fill" className="text-yellow-400" />}
                      <span className="text-2xl font-heading font-bold">{overallProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {targets.length === 0 && (
        <div className="text-center py-16">
          <TargetIcon size={64} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500">No targets set yet</p>
        </div>
      )}
    </div>
  );
};

export default Targets;