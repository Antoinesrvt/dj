export interface Track {
  id: string;
  title: string;
  artist: string;
}

export interface Connection {
  id: string;
  type: 'transition' | 'mashup';
  trackA: string;
  trackB: string;
  createdAt: Date;
}

export interface AppState {
  tracks: Map<string, Track>;
  connections: Connection[];
  
  // Actions
  addConnection: (trackAInput: string, trackBInput: string, type: 'transition' | 'mashup') => Promise<void>;
  findOrCreateTrack: (input: string) => Track;
  deleteConnection: (id: string) => void;
  clearAll: () => void;
  loadData: () => Promise<void>;
}