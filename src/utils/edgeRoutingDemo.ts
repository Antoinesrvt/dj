/**
 * Demo and testing utilities for edge routing optimization
 */

import type { Node, Edge } from '@xyflow/react';
import { 
  optimizeAllEdges, 
  findOptimalAttachmentPoints, 
  EdgeRoutingManager 
} from './edgeRouting';

/**
 * Generate test data for edge routing performance testing
 */
export const generateTestGraph = (nodeCount: number, edgeCount: number) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Generate nodes in a grid pattern
  const gridSize = Math.ceil(Math.sqrt(nodeCount));
  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    nodes.push({
      id: `node-${i}`,
      type: 'track',
      position: {
        x: col * 150 + Math.random() * 50,
        y: row * 100 + Math.random() * 50,
      },
      width: 120,
      height: 60,
      data: {
        title: `Track ${i}`,
        artist: `Artist ${i}`,
        connectionCount: 0,
      },
    });
  }
  
  // Generate random edges
  for (let i = 0; i < edgeCount; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex = Math.floor(Math.random() * nodeCount);
    
    // Ensure no self-loops
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodeCount);
    }
    
    edges.push({
      id: `edge-${i}`,
      source: `node-${sourceIndex}`,
      target: `node-${targetIndex}`,
      type: 'optimized',
      style: {
        stroke: Math.random() > 0.5 ? '#10b981' : '#8b5cf6',
        strokeWidth: 2,
      },
    });
  }
  
  return { nodes, edges };
};

/**
 * Performance benchmark for edge routing
 */
export const benchmarkEdgeRouting = (nodeCount: number, edgeCount: number) => {
  const { nodes, edges } = generateTestGraph(nodeCount, edgeCount);
  
  console.log(`Benchmarking edge routing with ${nodeCount} nodes and ${edgeCount} edges`);
  
  const startTime = performance.now();
  const optimizedEdges = optimizeAllEdges(nodes, edges);
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  const edgesPerSecond = edgeCount / (duration / 1000);
  
  console.log(`Edge routing completed in ${duration.toFixed(2)}ms`);
  console.log(`Performance: ${edgesPerSecond.toFixed(0)} edges/second`);
  
  // Calculate average path length improvement
  const originalPaths = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)!;
    const targetNode = nodes.find(n => n.id === edge.target)!;
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  });
  
  const optimizedPaths = optimizedEdges.map(edge => edge.pathLength);
  
  const avgOriginal = originalPaths.reduce((a, b) => a + b, 0) / originalPaths.length;
  const avgOptimized = optimizedPaths.reduce((a, b) => a + b, 0) / optimizedPaths.length;
  const improvement = ((avgOriginal - avgOptimized) / avgOriginal) * 100;
  
  console.log(`Average path length improvement: ${improvement.toFixed(1)}%`);
  
  return {
    duration,
    edgesPerSecond,
    improvement,
    optimizedEdges,
  };
};

/**
 * Visual debugging helper
 */
export const debugEdgeRouting = (nodes: Node[], edges: Edge[]) => {
  const optimized = optimizeAllEdges(nodes, edges);
  
  console.group('Edge Routing Debug');
  
  optimized.forEach((edge, index) => {
    console.log(`Edge ${index + 1}:`, {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      pathLength: edge.pathLength.toFixed(2),
      sourceAttachment: {
        side: edge.sourceAttachment.side,
        x: edge.sourceAttachment.x.toFixed(1),
        y: edge.sourceAttachment.y.toFixed(1),
      },
      targetAttachment: {
        side: edge.targetAttachment.side,
        x: edge.targetAttachment.x.toFixed(1),
        y: edge.targetAttachment.y.toFixed(1),
      },
    });
  });
  
  console.groupEnd();
  
  return optimized;
};