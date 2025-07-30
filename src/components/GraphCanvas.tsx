import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ConnectionMode,
} from '@xyflow/react';
import { useStore } from '../store/useStore';
import { TrackNode } from './TrackNode';
import { autoLayout } from '../utils/autoLayout';

const nodeTypes = {
  track: TrackNode,
};

export const GraphCanvas = () => {
  const { tracks, connections } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update graph when data changes
  useEffect(() => {
    // Count connections per track
    const connectionCounts = new Map<string, number>();
    connections.forEach((conn) => {
      connectionCounts.set(conn.trackA, (connectionCounts.get(conn.trackA) || 0) + 1);
      connectionCounts.set(conn.trackB, (connectionCounts.get(conn.trackB) || 0) + 1);
    });

    // Create nodes
    const newNodes: Node[] = Array.from(tracks.values()).map((track) => ({
      id: track.id,
      type: 'track',
      position: { x: 0, y: 0 },
      data: {
        ...track,
        connectionCount: connectionCounts.get(track.id) || 0,
      },
    }));

    // Create edges
    const newEdges: Edge[] = connections.map((conn) => {
      const isRecent = new Date().getTime() - conn.createdAt.getTime() < 300000; // 5 minutes
      
      return {
        id: conn.id,
        source: conn.trackA,
        target: conn.trackB,
        type: conn.type === 'mashup' ? 'default' : 'smoothstep',
        animated: isRecent,
        style: {
          stroke: conn.type === 'mashup' ? '#8b5cf6' : '#10b981',
          strokeWidth: 2,
          strokeDasharray: conn.type === 'transition' ? '5 5' : undefined,
        },
        markerEnd: conn.type === 'transition' ? {
          type: 'arrowclosed',
          color: '#10b981',
        } : undefined,
      };
    });

    // Apply auto-layout
    const layoutedNodes = autoLayout(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(newEdges);
  }, [tracks, connections, setNodes, setEdges]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={20} />
        <Controls className="bg-gray-900 border border-white/10" />
        <MiniMap
          nodeColor="#1f2937"
          className="bg-gray-900 border border-white/10 hidden sm:block"
          maskColor="rgba(0, 0, 0, 0.8)"
        />
      </ReactFlow>

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-20">🎧</div>
            <p className="text-white/40 text-lg mb-2">No connections yet</p>
            <p className="text-white/20 text-sm">
              Add your first track connection above to see the magic
            </p>
          </div>
        </div>
      )}
    </div>
  );
};