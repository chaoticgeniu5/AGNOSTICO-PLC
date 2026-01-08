import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  tagUpdates: Map<string, any>;
  logs: any[];
  plcStatuses: Map<string, any>;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  tagUpdates: new Map(),
  logs: [],
  plcStatuses: new Map(),

  connect: () => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected');
      set({ connected: true });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      set({ connected: false });
    });

    socket.on('tag:update', (data) => {
      set((state) => {
        const updates = new Map(state.tagUpdates);
        updates.set(data.tagId, data);
        return { tagUpdates: updates };
      });
    });

    socket.on('system:log', (data) => {
      set((state) => ({
        logs: [data, ...state.logs].slice(0, 500),
      }));
    });

    socket.on('plc:status', (data) => {
      set((state) => {
        const statuses = new Map(state.plcStatuses);
        statuses.set(data.plcId, data);
        return { plcStatuses: statuses };
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },
}));
