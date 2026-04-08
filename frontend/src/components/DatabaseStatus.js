import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Database, CheckCircle, XCircle, HardDrives, FileText } from '@phosphor-icons/react';
import { toast } from 'sonner';

const DatabaseStatus = () => {
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const { data } = await api.get('/database/stats');
      setDbStats(data);
    } catch (error) {
      toast.error('Failed to load database stats');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const { data } = await api.get('/database/test');
      toast.success(data.message);
    } catch (error) {
      toast.error('Database connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isConnected = dbStats?.status === 'connected';

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-6" data-testid="database-status">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database size={28} weight="fill" className="text-indigo-400" />
          <div>
            <h3 className="text-xl font-heading font-semibold">MongoDB Status</h3>
            <p className="text-sm text-zinc-400">Database connectivity and statistics</p>
          </div>
        </div>
        <button
          onClick={testConnection}
          disabled={testingConnection}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          data-testid="test-connection-button"
        >
          {testingConnection ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Testing...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Test Connection
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Connection Status */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            {isConnected ? (
              <CheckCircle size={24} weight="fill" className="text-emerald-400" />
            ) : (
              <XCircle size={24} weight="fill" className="text-red-400" />
            )}
            <h4 className="font-semibold">Connection Status</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Status:</span>
              <span className={`font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {dbStats?.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Database:</span>
              <span className="text-white font-mono">{dbStats?.database?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Host:</span>
              <span className="text-white font-mono">{dbStats?.database?.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Port:</span>
              <span className="text-white font-mono">{dbStats?.database?.port}</span>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <HardDrives size={24} weight="fill" className="text-blue-400" />
            <h4 className="font-semibold">Database Stats</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Collections:</span>
              <span className="text-white font-mono">{dbStats?.stats?.collections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Data Size:</span>
              <span className="text-white font-mono">{dbStats?.stats?.dataSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Storage Size:</span>
              <span className="text-white font-mono">{dbStats?.stats?.storageSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Indexes:</span>
              <span className="text-white font-mono">{dbStats?.stats?.indexes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Counts */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} weight="fill" className="text-purple-400" />
          <h4 className="font-semibold">Document Counts</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dbStats?.documents || {}).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-1">{value.toLocaleString()}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Server Uptime */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Server Uptime:</span>
          <span className="text-white font-mono">
            {Math.floor((dbStats?.uptime || 0) / 3600)}h {Math.floor(((dbStats?.uptime || 0) % 3600) / 60)}m
          </span>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;
