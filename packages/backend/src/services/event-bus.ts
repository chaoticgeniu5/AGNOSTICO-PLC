import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Typed event emitters
  emitTagUpdate(data: {
    plcId: string;
    tagId: string;
    tagName: string;
    value: number;
    quality: string;
    timestamp: Date;
  }) {
    this.emit('tag:update', data);
  }

  emitLog(data: {
    level: 'INFO' | 'WARN' | 'ERROR';
    source: string;
    message: string;
    metadata?: any;
  }) {
    this.emit('system:log', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  emitPlcStatus(data: {
    plcId: string;
    plcName: string;
    status: 'running' | 'stopped' | 'error';
    message?: string;
  }) {
    this.emit('plc:status', data);
  }
}
