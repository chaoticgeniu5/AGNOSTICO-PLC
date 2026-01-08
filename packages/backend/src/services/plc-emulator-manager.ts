import { EventBus } from './event-bus';
import { prisma } from '../index';
import {
  OPCUAServer,
  Variant,
  DataType,
  StatusCodes
} from 'node-opcua';

interface EmulatorInstance {
  plcId: string;
  type: 'OPCUA' | 'MODBUS';
  server: any;
  tags: Map<string, any>;
}

export class PLCEmulatorManager {
  private static instance: PLCEmulatorManager;
  private eventBus: EventBus;
  private emulators: Map<string, EmulatorInstance> = new Map();
  private nextModbusPort = 5502;
  private nextOpcuaPort = 4840;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupListeners();
  }

  static getInstance(): PLCEmulatorManager {
    if (!PLCEmulatorManager.instance) {
      PLCEmulatorManager.instance = new PLCEmulatorManager();
    }
    return PLCEmulatorManager.instance;
  }

  private setupListeners() {
    this.eventBus.on('output:write', async (data: any) => {
      await this.writeToEmulator(data);
    });
  }

  async startEnabledEmulators() {
    const outputPlcs = await prisma.pLC.findMany({
      where: {
        type: 'OUTPUT',
        enabled: true,
      },
      include: { mappings: true },
    });

    for (const plc of outputPlcs) {
      await this.startEmulator(plc);
    }
  }

  async startEmulator(plc: any) {
    if (this.emulators.has(plc.id)) {
      console.log(`[Emulator] ${plc.name} already running`);
      return;
    }

    console.log(`[Emulator] Starting ${plc.name} (${plc.brand} - ${plc.protocol})`);

    try {
      if (plc.protocol === 'OPCUA') {
        await this.startOPCUAEmulator(plc);
      } else if (plc.protocol === 'MODBUS_TCP') {
        await this.startModbusEmulator(plc);
      } else {
        throw new Error(`Unsupported protocol: ${plc.protocol}`);
      }

      this.eventBus.emitPlcStatus({
        plcId: plc.id,
        plcName: plc.name,
        status: 'running',
        message: `Emulator started on port ${plc.port}`,
      });

      this.eventBus.emitLog({
        level: 'INFO',
        source: 'PLCEmulator',
        message: `Started ${plc.protocol} emulator: ${plc.name} on port ${plc.port}`,
      });

    } catch (error: any) {
      this.eventBus.emitLog({
        level: 'ERROR',
        source: 'PLCEmulator',
        message: `Failed to start emulator ${plc.name}: ${error.message}`,
      });
      throw error;
    }
  }

  private async startOPCUAEmulator(plc: any) {
    const port = plc.port || this.nextOpcuaPort++;

    const server = new OPCUAServer({
      port,
      resourcePath: '/UA/' + plc.name.replace(/\s/g, ''),
      buildInfo: {
        productName: `${plc.brand} PLC Emulator`,
        buildNumber: '1.0.0',
        buildDate: new Date(),
      },
    });

    await server.initialize();

    const addressSpace = server.engine.addressSpace;
    if (!addressSpace) {
      throw new Error('Failed to initialize OPC UA address space');
    }
    const namespace = addressSpace.getOwnNamespace();

    // Create folder for PLC tags
    const plcFolder = namespace.addFolder('ObjectsFolder', {
      browseName: plc.name,
    });

    const tags = new Map();

    // Create variables for mapped tags
    for (const mapping of plc.mappings) {
      const variable = namespace.addVariable({
        componentOf: plcFolder,
        browseName: mapping.outputTagName,
        dataType: 'Double',
        value: {
          get: () => {
            const tag = tags.get(mapping.outputTagName);
            return new Variant({
              dataType: DataType.Double,
              value: tag?.value || 0,
            });
          },
          set: (variant: Variant) => {
            tags.set(mapping.outputTagName, {
              value: variant.value,
              timestamp: new Date(),
            });
            return StatusCodes.Good;
          },
        },
      });

      tags.set(mapping.outputTagName, { value: 0, variable });
    }

    await server.start();

    const endpoint = `opc.tcp://localhost:${port}`;

    // Update PLC with endpoint
    await prisma.pLC.update({
      where: { id: plc.id },
      data: {
        port,
        endpoint,
      },
    });

    this.emulators.set(plc.id, {
      plcId: plc.id,
      type: 'OPCUA',
      server,
      tags,
    });

    console.log(`[OPC UA] Server started at ${endpoint}`);
  }

  private async startModbusEmulator(plc: any) {
    // Modbus TCP implementation would go here
    // For MVP, we'll use a simple in-memory simulation
    const port = plc.port || this.nextModbusPort++;

    const tags = new Map();

    // Initialize holding registers
    for (const mapping of plc.mappings) {
      tags.set(mapping.outputAddress, {
        value: 0,
        timestamp: new Date(),
      });
    }

    // Update PLC with endpoint
    await prisma.pLC.update({
      where: { id: plc.id },
      data: {
        port,
        endpoint: `modbus://localhost:${port}`,
      },
    });

    this.emulators.set(plc.id, {
      plcId: plc.id,
      type: 'MODBUS',
      server: null, // Placeholder for actual Modbus server
      tags,
    });

    console.log(`[Modbus TCP] Emulator initialized on port ${port}`);
  }

  private async writeToEmulator(data: any) {
    const emulator = this.emulators.get(data.outputPlcId);

    if (!emulator) {
      return;
    }

    const tag = emulator.tags.get(data.tagName || data.address);

    if (tag) {
      tag.value = data.value;
      tag.timestamp = new Date();
      tag.quality = data.quality;

      // For OPC UA, the variable's get() will return the updated value
      // For Modbus, we'd write to the holding register here
    }
  }

  async stopEmulator(plcId: string) {
    const emulator = this.emulators.get(plcId);

    if (!emulator) {
      return;
    }

    if (emulator.type === 'OPCUA' && emulator.server) {
      await emulator.server.shutdown();
    }

    this.emulators.delete(plcId);

    const plc = await prisma.pLC.findUnique({ where: { id: plcId } });

    if (plc) {
      this.eventBus.emitPlcStatus({
        plcId,
        plcName: plc.name,
        status: 'stopped',
      });

      this.eventBus.emitLog({
        level: 'INFO',
        source: 'PLCEmulator',
        message: `Stopped emulator: ${plc.name}`,
      });
    }
  }

  async stopAll() {
    for (const plcId of this.emulators.keys()) {
      await this.stopEmulator(plcId);
    }
  }

  getStatus() {
    return {
      active: this.emulators.size,
      emulators: Array.from(this.emulators.entries()).map(([id, em]) => ({
        plcId: id,
        type: em.type,
        tagCount: em.tags.size,
      })),
    };
  }
}
