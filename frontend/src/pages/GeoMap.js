import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import api from '../utils/api';
import { toast } from 'sonner';

const geoUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

const GeoMap = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);

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

  return (
    <div className="p-8" data-testid="geo-map-page">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-2">Geographic Analytics</h1>
        <p className="text-zinc-400 text-base">Global sales distribution and regional performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {regions.slice(0, 5).map((region, index) => (
          <div
            key={index}
            className="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-indigo-500/30 transition-all cursor-pointer"
            data-testid={`region-card-${index}`}
            onMouseEnter={() => setHoveredRegion(region.name)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">{region.name}</h3>
            <p className="text-2xl font-heading font-bold tracking-tight mb-1">
              ${region.revenue?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-zinc-500">
              {region.sales} sales • {region.customers} customers
            </p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-lg p-6 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
          }}
          style={{ width: '100%', height: '600px' }}
          data-testid="map-container"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#27272A"
                  stroke="#3F3F46"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#3F3F46', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          
          {regions.map((region, index) => (
            region.coordinates && (
              <Marker
                key={index}
                coordinates={[region.coordinates.lng, region.coordinates.lat]}
                data-testid={`map-marker-${index}`}
              >
                <circle
                  r={Math.max(8, Math.min(20, region.revenue / 100000))}
                  fill="#6366f1"
                  fillOpacity={hoveredRegion === region.name ? 1 : 0.7}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                {hoveredRegion === region.name && (
                  <g>
                    <rect
                      x={-70}
                      y={-50}
                      width={140}
                      height={60}
                      fill="#18181B"
                      stroke="#6366f1"
                      strokeWidth={1}
                      rx={4}
                    />
                    <text
                      x={0}
                      y={-32}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {region.name}
                    </text>
                    <text
                      x={0}
                      y={-18}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize={11}
                    >
                      ${region.revenue.toLocaleString()}
                    </text>
                    <text
                      x={0}
                      y={-4}
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize={10}
                    >
                      {region.sales} sales | {region.customers} customers
                    </text>
                  </g>
                )}
              </Marker>
            )
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};

export default GeoMap;
