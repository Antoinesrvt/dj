import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';

export const RecentList = () => {
  const { tracks, connections } = useStore();

  const recentConnections = useMemo(() => {
    return connections
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((conn) => {
        const trackAData = tracks.get(conn.trackA);
        const trackBData = tracks.get(conn.trackB);
        const timeAgo = Math.floor(
          (new Date().getTime() - conn.createdAt.getTime()) / 60000
        );
        
        return {
          ...conn,
          display: `${trackAData?.title || 'Unknown'} ${
            conn.type === 'transition' ? '→' : '↔'
          } ${trackBData?.title || 'Unknown'}`,
          timeAgo: timeAgo < 1 ? 'just now' : `${timeAgo} min ago`,
        };
      });
  }, [connections, tracks]);

  if (recentConnections.length === 0) {
    return null;
  }

  return (
    <div className="h-20 sm:h-24 border-t border-white/10 bg-gray-900/50 p-4 overflow-y-auto">
      <h3 className="text-xs font-medium text-white/60 mb-2">
        Recent Connections
      </h3>
      <div className="space-y-1">
        {recentConnections.map((conn) => (
          <div key={conn.id} className="text-sm text-white/80 truncate">
            {conn.display}{' '}
            <span className="text-white/40 text-xs">({conn.timeAgo})</span>
          </div>
        ))}
      </div>
    </div>
  );
};