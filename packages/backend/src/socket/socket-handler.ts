import { Server as SocketIOServer } from 'socket.io';
import { EventBus } from '../services/event-bus';

export function setupSocketIO(io: SocketIOServer) {
  const eventBus = EventBus.getInstance();

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Subscribe to real-time tag updates
    const handleTagUpdate = (data: any) => {
      socket.emit('tag:update', data);
    };

    // Subscribe to system logs
    const handleLog = (data: any) => {
      socket.emit('system:log', data);
    };

    // Subscribe to PLC status changes
    const handlePlcStatus = (data: any) => {
      socket.emit('plc:status', data);
    };

    eventBus.on('tag:update', handleTagUpdate);
    eventBus.on('system:log', handleLog);
    eventBus.on('plc:status', handlePlcStatus);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      eventBus.off('tag:update', handleTagUpdate);
      eventBus.off('system:log', handleLog);
      eventBus.off('plc:status', handlePlcStatus);
    });

    // Send initial connection confirmation
    socket.emit('connected', {
      message: 'Connected to Industrial Gateway Platform',
      timestamp: new Date().toISOString(),
    });
  });
}
