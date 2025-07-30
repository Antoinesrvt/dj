import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface TrackNodeData {
  title: string;
  artist: string;
  connectionCount: number;
}

export const TrackNode = ({ data }: { data: TrackNodeData }) => {
  const connectionCount = data.connectionCount || 0;
  const isHub = connectionCount >= 5;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div
        className={`
          px-4 py-2 rounded-lg border backdrop-blur-sm transition-all duration-300
          ${
            isHub
              ? 'border-amber-500/50 bg-amber-500/10 shadow-amber-500/20 shadow-lg'
              : 'border-white/20 bg-white/5'
          }
          hover:border-white/40 hover:bg-white/10 hover:scale-105
        `}
      >
        <div className="text-sm font-medium text-white truncate max-w-32">
          {data.title}
        </div>
        <div className="text-xs text-white/60 truncate max-w-32">
          {data.artist}
        </div>
        {isHub && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {connectionCount}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};