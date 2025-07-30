import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import type { OptimizedEdge } from '../utils/edgeRouting';

interface OptimizedEdgeProps extends EdgeProps {
  data?: {
    sourceAttachment?: { x: number; y: number; side: string };
    targetAttachment?: { x: number; y: number; side: string };
    pathLength?: number;
  };
}

export const OptimizedEdgeComponent: React.FC<OptimizedEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  ...props
}) => {
  // Use optimized attachment points if available
  const actualSourceX = data?.sourceAttachment?.x ?? sourceX;
  const actualSourceY = data?.sourceAttachment?.y ?? sourceY;
  const actualTargetX = data?.targetAttachment?.x ?? targetX;
  const actualTargetY = data?.targetAttachment?.y ?? targetY;

  // Generate smooth path between optimized points
  const [edgePath] = getSmoothStepPath({
    sourceX: actualSourceX,
    sourceY: actualSourceY,
    sourcePosition,
    targetX: actualTargetX,
    targetY: actualTargetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
        }}
        markerEnd={markerEnd}
        {...props}
      />
      
      {/* Debug visualization for attachment points */}
      {process.env.NODE_ENV === 'development' && data?.sourceAttachment && (
        <>
          <circle
            cx={data.sourceAttachment.x}
            cy={data.sourceAttachment.y}
            r={2}
            fill="#ff6b6b"
            opacity={0.7}
          />
          <circle
            cx={data.targetAttachment?.x}
            cy={data.targetAttachment?.y}
            r={2}
            fill="#51cf66"
            opacity={0.7}
          />
        </>
      )}
    </>
  );
};