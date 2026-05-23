'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { MAP_CENTER, MAP_ZOOM } from '@/lib/constants';
import type { GridNode } from '@/types/grid';

const NODE_COLORS: Record<GridNode['type'], string> = {
  substation: '#1976D2',
  transformer: '#FB8C00',
  renewable: '#2E7D32',
  storage: '#7B1FA2',
  meter: '#757575',
};

const STATUS_BORDER: Record<GridNode['status'], string> = {
  online: '#4CAF50',
  warning: '#FF9800',
  critical: '#F44336',
  offline: '#9E9E9E',
};

interface SmartCityMapProps {
  nodes: GridNode[];
  selectedType: string;
}

export default function SmartCityMap({ nodes, selectedType }: SmartCityMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const filteredNodes = selectedType === 'all'
    ? nodes
    : nodes.filter((n) => n.type === selectedType);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      style={{ height: '500px', width: '100%' }}
      className="rounded-xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url={tileUrl}
      />
      {filteredNodes.map((node) => {
        const radius = Math.max(6, Math.min(20, node.capacity_mw / 25));
        const fillColor = NODE_COLORS[node.type];
        const borderColor = STATUS_BORDER[node.status];

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={radius}
            pathOptions={{
              fillColor,
              color: borderColor,
              weight: 2.5,
              fillOpacity: 0.75,
              opacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <span className="font-semibold">{node.label}</span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-sm min-w-[160px]">
                <p className="font-bold text-base">{node.name}</p>
                <p><span className="text-muted-foreground">Type:</span> <span className="capitalize font-medium">{node.type}</span></p>
                <p><span className="text-muted-foreground">Status:</span>{' '}
                  <span className={`font-semibold capitalize ${
                    node.status === 'online' ? 'text-green-600' :
                    node.status === 'warning' ? 'text-yellow-500' :
                    node.status === 'critical' ? 'text-rose-500' : 'text-gray-500'
                  }`}>{node.status}</span>
                </p>
                <p><span className="text-muted-foreground">Load:</span> <span className="font-semibold">{node.load_percentage}%</span></p>
                <p><span className="text-muted-foreground">Capacity:</span> {node.capacity_mw} MW</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      node.load_percentage > 85 ? 'bg-rose-500' :
                      node.load_percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${node.load_percentage}%` }}
                  />
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
