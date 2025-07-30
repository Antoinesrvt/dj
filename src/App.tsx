import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { QuickAddBar } from './components/QuickAddBar';
import { GraphCanvas } from './components/GraphCanvas';
import { RecentList } from './components/RecentList';
import '@xyflow/react/dist/style.css';

function App() {
  const { loadData, clearAll, connections } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/10 bg-gray-900/30">
        <div className="flex items-center gap-3">
          <div className="text-xl">🎧</div>
          <h1 className="text-lg font-semibold">DJ Graph</h1>
          {connections.length > 0 && (
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {connections.length} connections
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {connections.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-white/60 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
              title="Clear all data"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            title="Refresh"
          >
            ⟳
          </button>
        </div>
      </header>

      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* Graph Canvas */}
      <GraphCanvas />

      {/* Recent Connections */}
      <RecentList />
    </div>
  );
}

export default App;