import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const QuickAddBar = () => {
  const [trackA, setTrackA] = useState('');
  const [trackB, setTrackB] = useState('');
  const [connectionType, setConnectionType] = useState<'transition' | 'mashup'>('transition');
  
  const { addConnection } = useStore();

  const handleSubmit = async () => {
    if (!trackA.trim() || !trackB.trim()) return;
    
    await addConnection(trackA, trackB, connectionType);
    
    // Clear form
    setTrackA('');
    setTrackB('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-b border-white/10 bg-gray-900/50">
      <div className="flex flex-col sm:flex-row gap-2 items-center max-w-4xl mx-auto">
        <input
          type="text"
          placeholder="Track A - Artist"
          value={trackA}
          onChange={(e) => setTrackA(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 text-sm transition-all"
        />

        <select
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value as 'transition' | 'mashup')}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm transition-all cursor-pointer"
          title={connectionType === 'transition' ? 'Transition' : 'Mashup'}
        >
          <option value="transition">→ Transition</option>
          <option value="mashup">↔ Mashup</option>
        </select>

        <input
          type="text"
          placeholder="Track B - Artist"
          value={trackB}
          onChange={(e) => setTrackB(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 text-sm transition-all"
        />

        <button
          onClick={handleSubmit}
          disabled={!trackA.trim() || !trackB.trim()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all text-sm font-medium hover:scale-105 active:scale-95"
        >
          + Add
        </button>
      </div>
    </div>
  );
};