import { EventBus } from './event-bus';
import { prisma } from '../index';

interface NormalizedData {
  assetId: string;
  plcBrand: string;
  plcProtocol: string;
  tag: string;
  value: number;
  unit: string | null;
  quality: string;
  timestamp: Date;
}

export class NormalizationEngine {
  private static instance: NormalizationEngine;
  private eventBus: EventBus;
  private dataBuffer: Map<string, NormalizedData> = new Map();

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupListeners();
  }

  static getInstance(): NormalizationEngine {
    if (!NormalizationEngine.instance) {
      NormalizationEngine.instance = new NormalizationEngine();
    }
    return NormalizationEngine.instance;
  }

  private setupListeners() {
    this.eventBus.on('tag:update', async (data) => {
      await this.processTagUpdate(data);
    });
  }

  private async processTagUpdate(data: any) {
    try {
      // Get tag details
      const tag = await prisma.tag.findUnique({
        where: { id: data.tagId },
        include: {
          plc: true,
          mappings: {
            where: { enabled: true },
            include: { outputPlc: true },
          },
        },
      });

      if (!tag) return;

      // Normalize data
      const normalized: NormalizedData = {
        assetId: tag.plcId,
        plcBrand: tag.plc.brand,
        plcProtocol: tag.plc.protocol,
        tag: tag.name,
        value: data.value,
        unit: tag.unit,
        quality: data.quality,
        timestamp: data.timestamp,
      };

      // Store in buffer
      const key = `${tag.plcId}:${tag.name}`;
      this.dataBuffer.set(key, normalized);

      // Distribute to mapped outputs
      for (const mapping of tag.mappings) {
        const transformedValue = this.transformValue(
          data.value,
          mapping.scaleFactor,
          mapping.offset
        );

        this.eventBus.emit('output:write', {
          outputPlcId: mapping.outputPlcId,
          tagName: mapping.outputTagName,
          address: mapping.outputAddress,
          value: transformedValue,
          quality: data.quality,
        });
      }

      // Log processing
      this.eventBus.emitLog({
        level: 'INFO',
        source: 'NormalizationEngine',
        message: `Processed tag ${tag.name} from ${tag.plc.name}`,
        metadata: { normalized },
      });

    } catch (error: any) {
      this.eventBus.emitLog({
        level: 'ERROR',
        source: 'NormalizationEngine',
        message: `Error processing tag update: ${error.message}`,
      });
    }
  }

  private transformValue(value: number, scale: number, offset: number): number {
    return value * scale + offset;
  }

  getCurrentData(): NormalizedData[] {
    return Array.from(this.dataBuffer.values());
  }

  getDataForPlc(plcId: string): NormalizedData[] {
    return Array.from(this.dataBuffer.values()).filter(
      (data) => data.assetId === plcId
    );
  }
}
