import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import { MapPin, TrendUp, Users, CurrencyDollar } from '@phosphor-icons/react';

const GeoMap = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data } = await api.get('/analytics/geo');
      setRegions(data);
    } catch (error) {
      toast.error('Failed to load geo data');
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

  const maxRevenue = Math.max(...regions.map(r => r.revenue || 0));

  const getRegionColor = (revenue) => {
    const intensity = revenue / maxRevenue;
    if (intensity > 0.7) return 'from-indigo-500 to-purple-600';
    if (intensity > 0.4) return 'from-blue-500 to-indigo-500';
    return 'from-cyan-500 to-blue-500';
  };

  const getRegionSize = (revenue) => {
    const intensity = revenue / maxRevenue;
    if (intensity > 0.7) return 'scale-110';
    if (intensity > 0.4) return 'scale-105';
    return 'scale-100';
  };

  return (
    <div className="p-8" data-testid="geo-map-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2 flex items-center gap-3">
          <MapPin size={40} weight="fill" className="text-indigo-500" />
          Geographic Analytics
        </h1>
        <p className="text-zinc-400 text-base">Global sales distribution and regional performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {regions.map((region, index) => {
          const isSelected = selectedRegion === region.name;
          return (
            <div
              key={index}
              onClick={() => setSelectedRegion(isSelected ? null : region.name)}
              className={`relative overflow-hidden rounded-lg p-5 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/50'
                  : 'bg-zinc-900 border border-white/10 hover:border-indigo-500/50'
              }`}
              data-testid={`region-card-${index}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <MapPin size={24} weight="fill" className={isSelected ? 'text-white' : 'text-indigo-400'} />
                  {isSelected && (
                    <span className="animate-pulse h-2 w-2 bg-white rounded-full"></span>
                  )}
                </div>
                
                <h3 className={`text-sm uppercase tracking-wider mb-2 font-semibold ${
                  isSelected ? 'text-white/90' : 'text-zinc-400'
                }`}>
                  {region.name}
                </h3>
                
                <p className={`text-2xl font-heading font-bold tracking-tight mb-2 ${
                  isSelected ? 'text-white' : 'text-white'
                }`}>
                  ${region.revenue?.toLocaleString() || 0}
                </p>
                
                <div className="flex items-center gap-3 text-xs">
                  <span className={isSelected ? 'text-white/80' : 'text-zinc-500'}>
                    {region.sales} sales
                  </span>
                  <span className={isSelected ? 'text-white/60' : 'text-zinc-600'}>•</span>
                  <span className={isSelected ? 'text-white/80' : 'text-zinc-500'}>
                    {region.customers} customers
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 bg-black/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${isSelected ? 'bg-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} transition-all duration-500`}
                    style={{ width: `${(region.revenue / maxRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive World Map */}
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-8 overflow-hidden mb-8">
        <div className="relative" style={{ height: '600px' }}>
          {/* World map background with grid */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* World map illustration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20">
              {/* Simplified world map continents */}
              <path d="M 150,150 L 200,120 L 280,130 L 320,100 L 350,120 L 370,150 L 340,180 L 300,170 L 250,190 L 180,180 Z" fill="#52525b" />
              <path d="M 400,200 L 480,180 L 520,200 L 500,250 L 450,240 L 420,220 Z" fill="#52525b" />
              <path d="M 600,150 L 700,140 L 750,160 L 780,140 L 820,150 L 800,200 L 750,220 L 680,210 L 630,190 Z" fill="#52525b" />
              <path d="M 200,300 L 280,280 L 320,300 L 300,350 L 240,340 Z" fill="#52525b" />
              <path d="M 700,280 L 780,270 L 820,290 L 800,330 L 740,320 Z" fill="#52525b" />
            </svg>
          </div>

          {/* Region markers */}
          <div className="absolute inset-0">
            {regions.map((region, index) => {
              const positions = {
                'North America': { left: '20%', top: '25%' },
                'Europe': { left: '48%', top: '20%' },
                'Asia Pacific': { left: '75%', top: '30%' },
                'South America': { left: '28%', top: '60%' },
                'Middle East': { left: '58%', top: '38%' },
              };

              const position = positions[region.name] || { left: '50%', top: '50%' };
              const isSelected = selectedRegion === region.name;
              const size = (region.revenue / maxRevenue) * 60 + 40;

              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: position.left, top: position.top }}
                  data-testid={`map-marker-${index}`}
                >
                  {/* Pulse effect */}
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${getRegionColor(region.revenue)} opacity-20 animate-ping`}
                    style={{ width: `${size}px`, height: `${size}px` }}
                  ></div>

                  {/* Main marker */}
                  <div
                    onClick={() => setSelectedRegion(isSelected ? null : region.name)}
                    className={`relative cursor-pointer transition-all duration-300 rounded-full bg-gradient-to-br ${getRegionColor(region.revenue)} p-1 ${
                      isSelected ? 'scale-125 shadow-2xl' : 'hover:scale-110'
                    }`}
                    style={{ width: `${size}px`, height: `${size}px` }}
                  >
                    <div className="w-full h-full rounded-full bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <MapPin size={size / 3} weight="fill" className="text-white mb-1" />
                      <span className="text-white font-bold text-xs">{region.sales}</span>
                    </div>
                  </div>

                  {/* Tooltip */}
                  {isSelected && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-32 w-64 z-50 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-indigo-500/50 rounded-lg p-4 shadow-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={20} weight="fill" className="text-indigo-400" />
                          <h3 className="font-heading font-bold text-lg text-white">{region.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                              <CurrencyDollar size={16} className="text-emerald-400" />
                              Revenue
                            </span>
                            <span className="text-emerald-400 font-mono font-bold">
                              ${region.revenue?.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                              <TrendUp size={16} className="text-blue-400" />
                              Sales
                            </span>
                            <span className="text-blue-400 font-mono font-bold">
                              {region.sales}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                              <Users size={16} className="text-purple-400" />
                              Customers
                            </span>
                            <span className="text-purple-400 font-mono font-bold">
                              {region.customers}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-xs text-zinc-500 mb-1">Performance</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                                style={{ width: `${(region.revenue / maxRevenue) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-white font-medium">
                              {Math.round((region.revenue / maxRevenue) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-zinc-900 border-b border-r border-indigo-500/50 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 right-6 bg-zinc-800/80 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <h4 className="text-xs uppercase tracking-wider text-zinc-400 mb-3 font-semibold">Revenue Scale</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                <span className="text-xs text-zinc-300">High (&gt;70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500"></div>
                <span className="text-xs text-zinc-300">Medium (40-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500"></div>
                <span className="text-xs text-zinc-300">Low (&lt;40%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details */}
      {selectedRegion && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-lg p-6">
          <h3 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
            <MapPin size={28} weight="fill" className="text-indigo-400" />
            {selectedRegion} - Detailed Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regions
              .filter(r => r.name === selectedRegion)
              .map(region => (
                <React.Fragment key={region.name}>
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <div className="text-sm text-zinc-400 mb-1">Average Deal Size</div>
                    <div className="text-2xl font-heading font-bold">
                      ${Math.round(region.revenue / region.sales).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <div className="text-sm text-zinc-400 mb-1">Revenue per Customer</div>
                    <div className="text-2xl font-heading font-bold">
                      ${Math.round(region.revenue / region.customers).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-4">
                    <div className="text-sm text-zinc-400 mb-1">Market Share</div>
                    <div className="text-2xl font-heading font-bold">
                      {Math.round((region.revenue / regions.reduce((sum, r) => sum + r.revenue, 0)) * 100)}%
                    </div>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoMap;
