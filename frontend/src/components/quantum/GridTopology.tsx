'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GridNode, GridEdge } from '@/types/grid';

const STATUS_COLORS: Record<string, string> = {
  online: '#4CAF50',
  warning: '#FF9800',
  critical: '#F44336',
  offline: '#9E9E9E',
};

const EDGE_COLORS: Record<string, string> = {
  active: '#4CAF50',
  overloaded: '#FF9800',
  failed: '#F44336',
  rerouted: '#2196F3',
};

interface NodePosition {
  x: number;
  y: number;
}

function computePositions(nodes: GridNode[], width: number, height: number): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const cx = width / 2;
  const cy = height / 2;
  const radiusX = width * 0.38;
  const radiusY = height * 0.38;

  // Place first node in center
  if (nodes.length > 0) {
    positions.set(nodes[0].id, { x: cx, y: cy });
  }

  // Rest in a circle around center
  const remaining = nodes.slice(1);
  remaining.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / remaining.length - Math.PI / 2;
    positions.set(node.id, {
      x: cx + radiusX * Math.cos(angle),
      y: cy + radiusY * Math.sin(angle),
    });
  });

  return positions;
}

interface GridTopologyProps {
  nodes: GridNode[];
  edges: GridEdge[];
}

export default function GridTopology({ nodes, edges }: GridTopologyProps) {
  const [nodeStates, setNodeStates] = useState<Map<string, GridNode['status']>>(
    () => new Map(nodes.map((n) => [n.id, n.status]))
  );
  const [edgeStates, setEdgeStates] = useState<Map<string, GridEdge['status']>>(
    () => new Map(edges.map((e) => [`${e.source}-${e.target}`, e.status]))
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [healing, setHealing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 800;
  const height = 500;
  const positions = computePositions(nodes, width, height);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (healing) return;

    setSelectedNode(nodeId);

    // Simulate failure
    setNodeStates((prev) => {
      const next = new Map(prev);
      next.set(nodeId, 'critical');
      return next;
    });

    // Mark connected edges as failed
    setEdgeStates((prev) => {
      const next = new Map(prev);
      edges.forEach((e) => {
        if (e.source === nodeId || e.target === nodeId) {
          next.set(`${e.source}-${e.target}`, 'failed');
        }
      });
      return next;
    });

    setHealing(true);

    // After 2s, heal
    setTimeout(() => {
      setNodeStates((prev) => {
        const next = new Map(prev);
        next.set(nodeId, 'online');
        return next;
      });

      setEdgeStates((prev) => {
        const next = new Map(prev);
        edges.forEach((e) => {
          if (e.source === nodeId || e.target === nodeId) {
            next.set(`${e.source}-${e.target}`, 'rerouted');
          }
        });
        return next;
      });

      // Reset to original after another 2s
      setTimeout(() => {
        setNodeStates(new Map(nodes.map((n) => [n.id, n.status])));
        setEdgeStates(new Map(edges.map((e) => [`${e.source}-${e.target}`, e.status])));
        setSelectedNode(null);
        setHealing(false);
      }, 2500);
    }, 2000);
  }, [healing, edges, nodes]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      style={{ minHeight: 350 }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map((edge) => {
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        if (!from || !to) return null;

        const key = `${edge.source}-${edge.target}`;
        const status = edgeStates.get(key) || edge.status;
        const color = EDGE_COLORS[status];

        return (
          <g key={key}>
            {/* Background line */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={color}
              strokeWidth={status === 'failed' ? 3 : 2}
              strokeOpacity={0.3}
            />
            {/* Animated flow line */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={color}
              strokeWidth={status === 'failed' ? 3 : 2}
              strokeDasharray={status === 'failed' ? '8 4' : '12 6'}
              strokeOpacity={0.9}
              filter="url(#glow)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur={status === 'failed' ? '0.8s' : '2s'}
                repeatCount="indefinite"
              />
            </line>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;

        const status = nodeStates.get(node.id) || node.status;
        const color = STATUS_COLORS[status];
        const isSelected = selectedNode === node.id;
        const isPulsing = status === 'critical' || status === 'warning';
        const nodeRadius = Math.max(14, Math.min(22, node.capacity_mw / 25));

        return (
          <g
            key={node.id}
            className="cursor-pointer"
            onClick={() => handleNodeClick(node.id)}
          >
            {/* Pulse ring for critical/warning */}
            {isPulsing && (
              <circle
                cx={pos.x} cy={pos.y}
                r={nodeRadius + 8}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.5}
              >
                <animate
                  attributeName="r"
                  from={nodeRadius + 4}
                  to={nodeRadius + 16}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={pos.x} cy={pos.y}
                r={nodeRadius + 6}
                fill="none"
                stroke="#fff"
                strokeWidth={2}
                strokeDasharray="4 3"
                opacity={0.8}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="28"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Node circle */}
            <circle
              cx={pos.x} cy={pos.y}
              r={nodeRadius}
              fill={color}
              fillOpacity={0.85}
              stroke={isSelected ? '#fff' : color}
              strokeWidth={isSelected ? 3 : 1.5}
              filter="url(#glow)"
            />

            {/* Inner indicator */}
            <circle
              cx={pos.x} cy={pos.y}
              r={nodeRadius * 0.4}
              fill="#fff"
              fillOpacity={0.3}
            />

            {/* Label */}
            <text
              x={pos.x}
              y={pos.y + nodeRadius + 14}
              textAnchor="middle"
              className="fill-current text-foreground"
              fontSize={10}
              fontWeight={600}
              opacity={0.85}
            >
              {node.label}
            </text>

            {/* Load % inside */}
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize={9}
              fontWeight={700}
            >
              {node.load_percentage}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
