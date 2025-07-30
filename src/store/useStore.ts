import { create } from 'zustand';
import Dexie from 'dexie';
import { nanoid } from 'nanoid';
import type { Track, Connection, AppState } from '../types';

// Dexie database setup
class DJGraphDB extends Dexie {
  tracks!: Dexie.Table<Track, string>;
  connections!: Dexie.Table<Connection, string>;
  
  constructor() {
    super('DJGraphDB');
    this.version(1).stores({
      tracks: 'id, title, artist',
      connections: 'id, trackA, trackB, type, createdAt'
    });
  }
}

const db = new DJGraphDB();

// Parse track input "Title - Artist" format
const parseTrackInput = (input: string): { id: string; title: string; artist: string } => {
  const parts = input.split(' - ');
  const title = parts[0]?.trim() || 'Unknown Track';
  const artist = parts[1]?.trim() || 'Unknown Artist';
  const id = `${title}-${artist}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return { id, title, artist };
};

export const useStore = create<AppState>((set, get) => ({
  tracks: new Map(),
  connections: [],
  
  findOrCreateTrack: (input: string) => {
    const trackData = parseTrackInput(input);
    const { tracks } = get();
    
    if (!tracks.has(trackData.id)) {
      const newTracks = new Map(tracks);
      newTracks.set(trackData.id, trackData);
      set({ tracks: newTracks });
      
      // Persist to Dexie
      db.tracks.put(trackData);
    }
    
    return tracks.get(trackData.id) || trackData;
  },
  
  addConnection: async (trackAInput: string, trackBInput: string, type: 'transition' | 'mashup') => {
    const { findOrCreateTrack } = get();
    const trackA = findOrCreateTrack(trackAInput);
    const trackB = findOrCreateTrack(trackBInput);
    
    const connection: Connection = {
      id: nanoid(),
      type,
      trackA: trackA.id,
      trackB: trackB.id,
      createdAt: new Date()
    };
    
    await db.connections.add(connection);
    
    set(state => ({
      connections: [...state.connections, connection]
    }));
  },
  
  deleteConnection: async (id: string) => {
    await db.connections.delete(id);
    set(state => ({
      connections: state.connections.filter(conn => conn.id !== id)
    }));
  },
  
  clearAll: async () => {
    await db.tracks.clear();
    await db.connections.clear();
    set({
      tracks: new Map(),
      connections: []
    });
  },
  
  loadData: async () => {
    const tracks = await db.tracks.toArray();
    const connections = await db.connections.toArray();
    
    set({
      tracks: new Map(tracks.map(track => [track.id, track])),
      connections: connections
    });
  }
}));