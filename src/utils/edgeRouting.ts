import type { Node, Edge } from '@xyflow/react';

// Types for edge routing
export interface AttachmentPoint {
  x: number;
  y: number;
  side: 'top' | 'right' | 'bottom' | 'left';
  angle: number;
}

export interface OptimizedEdge extends Edge {
  sourceAttachment: AttachmentPoint;
  targetAttachment: AttachmentPoint;
  pathLength: number;
}

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Calculate node bounds including center point
 */
export const getNodeBounds = (node: Node): NodeBounds => {
  const width = node.width || 120; // Default track node width
  const height = node.height || 60; // Default track node height
  
  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
    centerX: node.position.x + width / 2,
    centerY: node.position.y + height / 2,
  };
};

/**
 * Calculate distance between two points
 */
const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Calculate angle between two points in radians
 */
const angle = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * Generate potential attachment points around a rectangular node
 */
export const generateAttachmentPoints = (bounds: NodeBounds, resolution: number = 8): AttachmentPoint[] => {
  const points: AttachmentPoint[] = [];
  const { x, y, width, height, centerX, centerY } = bounds;
  
  // Top edge points
  for (let i = 0; i <= resolution; i++) {
    const px = x + (width * i) / resolution;
    const py = y;
    points.push({
      x: px,
      y: py,
      side: 'top',
      angle: angle(centerX, centerY, px, py),
    });
  }
  
  // Right edge points
  for (let i = 0; i <= resolution; i++) {
    const px = x + width;
    const py = y + (height * i) / resolution;
    points.push({
      x: px,
      y: py,
      side: 'right',
      angle: angle(centerX, centerY, px, py),
    });
  }
  
  // Bottom edge points
  for (let i = resolution; i >= 0; i--) {
    const px = x + (width * i) / resolution;
    const py = y + height;
    points.push({
      x: px,
      y: py,
      side: 'bottom',
      angle: angle(centerX, centerY, px, py),
    });
  }
  
  // Left edge points
  for (let i = resolution; i >= 0; i--) {
    const px = x;
    const py = y + (height * i) / resolution;
    points.push({
      x: px,
      y: py,
      side: 'left',
      angle: angle(centerX, centerY, px, py),
    });
  }
  
  return points;
};

/**
 * Find optimal attachment points between two nodes
 */
export const findOptimalAttachmentPoints = (
  sourceNode: Node,
  targetNode: Node,
  existingEdges: OptimizedEdge[] = []
): { source: AttachmentPoint; target: AttachmentPoint; pathLength: number } => {
  const sourceBounds = getNodeBounds(sourceNode);
  const targetBounds = getNodeBounds(targetNode);
  
  const sourcePoints = generateAttachmentPoints(sourceBounds);
  const targetPoints = generateAttachmentPoints(targetBounds);
  
  let bestSource: AttachmentPoint | null = null;
  let bestTarget: AttachmentPoint | null = null;
  let shortestDistance = Infinity;
  
  // Test all combinations to find shortest path
  for (const sourcePoint of sourcePoints) {
    for (const targetPoint of targetPoints) {
      const pathLength = distance(
        sourcePoint.x,
        sourcePoint.y,
        targetPoint.x,
        targetPoint.y
      );
      
      // Apply penalty for edge conflicts
      const conflictPenalty = calculateConflictPenalty(
        sourcePoint,
        targetPoint,
        existingEdges,
        sourceNode.id!,
        targetNode.id!
      );
      
      const totalCost = pathLength + conflictPenalty;
      
      if (totalCost < shortestDistance) {
        shortestDistance = totalCost;
        bestSource = sourcePoint;
        bestTarget = targetPoint;
      }
    }
  }
  
  return {
    source: bestSource!,
    target: bestTarget!,
    pathLength: shortestDistance,
  };
};

/**
 * Calculate penalty for edge conflicts and overlaps
 */
const calculateConflictPenalty = (
  sourcePoint: AttachmentPoint,
  targetPoint: AttachmentPoint,
  existingEdges: OptimizedEdge[],
  sourceNodeId: string,
  targetNodeId: string
): number => {
  let penalty = 0;
  
  // Check for attachment point clustering
  const attachmentRadius = 10; // Minimum distance between attachment points
  
  for (const edge of existingEdges) {
    // Skip edges from the same nodes
    if (edge.source === sourceNodeId || edge.target === targetNodeId) {
      // Penalty for using nearby attachment points on the same node
      if (edge.source === sourceNodeId) {
        const dist = distance(
          sourcePoint.x,
          sourcePoint.y,
          edge.sourceAttachment.x,
          edge.sourceAttachment.y
        );
        if (dist < attachmentRadius) {
          penalty += (attachmentRadius - dist) * 5;
        }
      }
      
      if (edge.target === targetNodeId) {
        const dist = distance(
          targetPoint.x,
          targetPoint.y,
          edge.targetAttachment.x,
          edge.targetAttachment.y
        );
        if (dist < attachmentRadius) {
          penalty += (attachmentRadius - dist) * 5;
        }
      }
    }
    
    // Check for edge crossing
    if (doLinesIntersect(
      sourcePoint.x, sourcePoint.y, targetPoint.x, targetPoint.y,
      edge.sourceAttachment.x, edge.sourceAttachment.y,
      edge.targetAttachment.x, edge.targetAttachment.y
    )) {
      penalty += 50; // Heavy penalty for crossing edges
    }
  }
  
  return penalty;
};

/**
 * Check if two line segments intersect
 */
const doLinesIntersect = (
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean => {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false; // Lines are parallel
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

/**
 * Optimize all edges in the graph
 */
export const optimizeAllEdges = (
  nodes: Node[],
  edges: Edge[]
): OptimizedEdge[] => {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const optimizedEdges: OptimizedEdge[] = [];
  
  // Sort edges by importance (could be based on connection type, recency, etc.)
  const sortedEdges = [...edges].sort((a, b) => {
    // Prioritize transition edges over mashups for cleaner routing
    if (a.style?.stroke === '#10b981' && b.style?.stroke !== '#10b981') return -1;
    if (b.style?.stroke === '#10b981' && a.style?.stroke !== '#10b981') return 1;
    return 0;
  });
  
  for (const edge of sortedEdges) {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) continue;
    
    const optimal = findOptimalAttachmentPoints(
      sourceNode,
      targetNode,
      optimizedEdges
    );
    
    const optimizedEdge: OptimizedEdge = {
      ...edge,
      sourceAttachment: optimal.source,
      targetAttachment: optimal.target,
      pathLength: optimal.pathLength,
    };
    
    optimizedEdges.push(optimizedEdge);
  }
  
  return optimizedEdges;
};

/**
 * Generate smooth curve path for edge
 */
export const generateEdgePath = (
  sourceAttachment: AttachmentPoint,
  targetAttachment: AttachmentPoint,
  curvature: number = 0.3
): string => {
  const dx = targetAttachment.x - sourceAttachment.x;
  const dy = targetAttachment.y - sourceAttachment.y;
  
  // Calculate control points for smooth curve
  const distance = Math.sqrt(dx * dx + dy * dy);
  const controlDistance = distance * curvature;
  
  // Adjust control points based on attachment sides
  let sourceControlX = sourceAttachment.x;
  let sourceControlY = sourceAttachment.y;
  let targetControlX = targetAttachment.x;
  let targetControlY = targetAttachment.y;
  
  switch (sourceAttachment.side) {
    case 'top':
      sourceControlY -= controlDistance;
      break;
    case 'bottom':
      sourceControlY += controlDistance;
      break;
    case 'left':
      sourceControlX -= controlDistance;
      break;
    case 'right':
      sourceControlX += controlDistance;
      break;
  }
  
  switch (targetAttachment.side) {
    case 'top':
      targetControlY -= controlDistance;
      break;
    case 'bottom':
      targetControlY += controlDistance;
      break;
    case 'left':
      targetControlX -= controlDistance;
      break;
    case 'right':
      targetControlX += controlDistance;
      break;
  }
  
  return `M ${sourceAttachment.x},${sourceAttachment.y} C ${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetAttachment.x},${targetAttachment.y}`;
};

/**
 * Performance-optimized edge routing for large graphs
 */
export class EdgeRoutingManager {
  private nodePositionCache = new Map<string, NodeBounds>();
  private edgeCache = new Map<string, OptimizedEdge>();
  private lastUpdateTime = 0;
  private updateThrottle = 16; // ~60fps
  
  constructor(private onEdgesUpdate: (edges: OptimizedEdge[]) => void) {}
  
  updateNodePositions(nodes: Node[]): void {
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateThrottle) return;
    
    let hasChanges = false;
    
    for (const node of nodes) {
      const bounds = getNodeBounds(node);
      const cached = this.nodePositionCache.get(node.id!);
      
      if (!cached || 
          cached.x !== bounds.x || 
          cached.y !== bounds.y) {
        this.nodePositionCache.set(node.id!, bounds);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.invalidateEdgeCache();
      this.lastUpdateTime = now;
    }
  }
  
  optimizeEdges(nodes: Node[], edges: Edge[]): OptimizedEdge[] {
    const cacheKey = this.generateCacheKey(nodes, edges);
    const cached = this.edgeCache.get(cacheKey);
    
    if (cached) {
      return [cached];
    }
    
    const optimized = optimizeAllEdges(nodes, edges);
    
    // Cache individual edges
    for (const edge of optimized) {
      const edgeKey = `${edge.source}-${edge.target}`;
      this.edgeCache.set(edgeKey, edge);
    }
    
    return optimized;
  }
  
  private generateCacheKey(nodes: Node[], edges: Edge[]): string {
    const nodePositions = nodes.map(n => `${n.id}:${n.position.x},${n.position.y}`).join('|');
    const edgeIds = edges.map(e => `${e.source}-${e.target}`).join('|');
    return `${nodePositions}::${edgeIds}`;
  }
  
  private invalidateEdgeCache(): void {
    this.edgeCache.clear();
  }
  
  destroy(): void {
    this.nodePositionCache.clear();
    this.edgeCache.clear();
  }
}