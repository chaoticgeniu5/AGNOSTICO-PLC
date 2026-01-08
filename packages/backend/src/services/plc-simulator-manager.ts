import { EventBus } from './event-bus';
import { prisma } from '../index';

interface SimulatorInstance {
  plcId: string;
  interval: NodeJS.Timeout;
  tags: Map<string, any>;
}

export class PLCSimulatorManager {
  private static instance: PLCSimulatorManager;
  private eventBus: EventBus;
  private simulators: Map<string, SimulatorInstance> = new Map();

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): PLCSimulatorManager {
    if (!PLCSimulatorManager.instance) {
      PLCSimulatorManager.instance = new PLCSimulatorManager();
    }
    return PLCSimulatorManager.instance;
  }

  async startEnabledSimulators() {
    const inputPlcs = await prisma.pLC.findMany({
      where: {
        type: 'INPUT',
        enabled: true,
      },
      include: { tags: true },
    });

    for (const plc of inputPlcs) {
      await this.startSimulator(plc);
    }
  }

  async startSimulator(plc: any) {
    if (this.simulators.has(plc.id)) {
      console.log(`[Simulator] ${plc.name} already running`);
      return;
    }

    console.log(`[Simulator] Starting ${plc.name} (${plc.brand} - ${plc.protocol})`);

    const tags = new Map();

    // Initialize tag states
    for (const tag of plc.tags) {
      tags.set(tag.id, {
        ...tag,
        phase: 0, // For sine/wave generation
      });
    }

    // Simulation loop - 1Hz default
    const interval = setInterval(async () => {
      for (const [tagId, tagState] of tags.entries()) {
        const newValue = this.generateValue(tagState);

        // Update database
        await prisma.tag.update({
          where: { id: tagId },
          data: {
            value: newValue,
            quality: 'GOOD',
          },
        });

        // Emit update event
        this.eventBus.emitTagUpdate({
          plcId: plc.id,
          tagId,
          tagName: tagState.name,
          value: newValue,
          quality: 'GOOD',
          timestamp: new Date(),
        });

        // Update phase for next iteration
        tagState.phase += (tagState.frequency || 1.0) * 0.1;
      }
    }, 1000);

    this.simulators.set(plc.id, {
      plcId: plc.id,
      interval,
      tags,
    });

    this.eventBus.emitPlcStatus({
      plcId: plc.id,
      plcName: plc.name,
      status: 'running',
      message: `Simulator started for ${plc.brand} ${plc.protocol}`,
    });

    this.eventBus.emitLog({
      level: 'INFO',
      source: 'PLCSimulator',
      message: `Started simulator: ${plc.name} (${plc.brand} - ${plc.protocol})`,
    });
  }

  async stopSimulator(plcId: string) {
    const simulator = this.simulators.get(plcId);

    if (!simulator) {
      return;
    }

    clearInterval(simulator.interval);
    this.simulators.delete(plcId);

    const plc = await prisma.pLC.findUnique({ where: { id: plcId } });

    if (plc) {
      this.eventBus.emitPlcStatus({
        plcId,
        plcName: plc.name,
        status: 'stopped',
      });

      this.eventBus.emitLog({
        level: 'INFO',
        source: 'PLCSimulator',
        message: `Stopped simulator: ${plc.name}`,
      });
    }
  }

  async stopAll() {
    for (const plcId of this.simulators.keys()) {
      await this.stopSimulator(plcId);
    }
  }

  private generateValue(tag: any): number {
    const amplitude = tag.amplitude || 100;
    const offset = tag.offset || 0;
    const phase = tag.phase || 0;

    switch (tag.signalType) {
      case 'SINE':
        return amplitude * Math.sin(phase) + offset;

      case 'RAMP':
        return (phase % (2 * Math.PI)) / (2 * Math.PI) * amplitude + offset;

      case 'RANDOM':
        return Math.random() * amplitude + offset;

      case 'DIGITAL':
        return Math.sin(phase) > 0 ? 1 : 0;

      default:
        return amplitude * Math.sin(phase) + offset;
    }
  }

  getStatus() {
    return {
      active: this.simulators.size,
      simulators: Array.from(this.simulators.keys()),
    };
  }
}
