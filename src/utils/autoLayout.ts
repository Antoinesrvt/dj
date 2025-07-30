import type { Node, Edge } from '@xyflow/react';
import { EdgeRoutingManager, optimizeAllEdges } from './edgeRouting';

export const autoLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  const centerX = 400;
  const centerY = 300;
  const baseRadius = 250;
  
  // Calculate connection counts for each node
  const connectionCounts = new Map<string, number>();
  edges.forEach(edge => {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
  });
  
  // Position nodes in circular layout with hubs toward center
  const layoutedNodes = nodes.map((node, index) => {
    const connections = connectionCounts.get(node.id) || 0;
    const angle = (index / nodes.length) * 2 * Math.PI;
    
    // Hubs (high connection count) are pulled toward center
    const radiusMultiplier = Math.max(0.4, 1 - (connections * 0.06));
    const radius = baseRadius * radiusMultiplier;
    
    // Add slight randomization to prevent overlap
    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 40;
    
    return {
      ...node,
      width: 120, // Set explicit dimensions for edge routing
      height: 60,
      position: {
        x: centerX + Math.cos(angle) * radius + jitterX,
        y: centerY + Math.sin(angle) * radius + jitterY
      }
    };
  });
  
  return layoutedNodes;
};

/**
 * Enhanced auto-layout with edge routing optimization
 */
export const autoLayoutWithEdgeRouting = (
  nodes: Node[], 
  edges: Edge[]
): { nodes: Node[]; optimizedEdges: any[] } => {
  // First, apply standard layout
  const layoutedNodes = autoLayout(nodes, edges);
  
  // Then optimize edge routing
  const optimizedEdges = optimizeAllEdges(layoutedNodes, edges);
  
  return {
    nodes: layoutedNodes,
    optimizedEdges
  };
};