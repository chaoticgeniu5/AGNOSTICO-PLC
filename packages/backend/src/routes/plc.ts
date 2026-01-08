import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { PLCSimulatorManager } from '../services/plc-simulator-manager';
import { PLCEmulatorManager } from '../services/plc-emulator-manager';

const createPLCSchema = z.object({
  name: z.string().min(1),
  brand: z.enum(['SIEMENS', 'ALLEN_BRADLEY', 'SCHNEIDER', 'OMRON', 'GENERIC']),
  protocol: z.enum(['S7COMM', 'ETHERNET_IP', 'MODBUS_TCP', 'MODBUS_RTU', 'FINS', 'OPCUA']),
  type: z.enum(['INPUT', 'OUTPUT']),
  port: z.number().optional(),
  config: z.any().optional(),
});

export async function plcRoutes(fastify: FastifyInstance) {
  const simulatorManager = PLCSimulatorManager.getInstance();
  const emulatorManager = PLCEmulatorManager.getInstance();

  // Get all PLCs
  fastify.get('/', {
    onRequest: [(fastify as any).authenticate],
  }, async () => {
    const plcs = await prisma.pLC.findMany({
      include: {
        tags: true,
        _count: {
          select: { tags: true, mappings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return plcs;
  });

  // Get single PLC
  fastify.get('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const plc = await prisma.pLC.findUnique({
      where: { id },
      include: {
        tags: true,
        mappings: {
          include: {
            inputTag: true,
          },
        },
      },
    });

    if (!plc) {
      return reply.status(404).send({ error: 'PLC not found' });
    }

    return plc;
  });

  // Create PLC
  fastify.post('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const data = createPLCSchema.parse(request.body);

      const plc = await prisma.pLC.create({
        data: {
          ...data,
          config: data.config ? JSON.stringify(data.config) : null,
        },
        include: { tags: true },
      });

      fastify.log.info(`PLC created: ${plc.name} (${plc.id})`);
      return plc;
    } catch (error: any) {
      fastify.log.error('Error creating PLC:', error);
      return reply.status(400).send({
        error: 'Invalid request',
        details: error.message || 'Unknown error'
      });
    }
  });

  // Update PLC
  fastify.put('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createPLCSchema.partial().parse(request.body);

      const plc = await prisma.pLC.update({
        where: { id },
        data: {
          ...data,
          config: data.config ? JSON.stringify(data.config) : undefined,
        },
        include: { tags: true },
      });

      return plc;
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Delete PLC
  fastify.delete('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Stop if running
    await simulatorManager.stopSimulator(id);
    await emulatorManager.stopEmulator(id);

    await prisma.pLC.delete({ where: { id } });

    return { success: true };
  });

  // Start PLC
  fastify.post('/:id/start', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const plc = await prisma.pLC.findUnique({ where: { id }, include: { tags: true } });

    if (!plc) {
      return reply.status(404).send({ error: 'PLC not found' });
    }

    try {
      if (plc.type === 'INPUT') {
        await simulatorManager.startSimulator(plc);
      } else {
        await emulatorManager.startEmulator(plc);
      }

      await prisma.pLC.update({
        where: { id },
        data: { enabled: true },
      });

      return { success: true, message: `PLC ${plc.name} started` };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Stop PLC
  fastify.post('/:id/stop', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const plc = await prisma.pLC.findUnique({ where: { id } });

    if (!plc) {
      return reply.status(404).send({ error: 'PLC not found' });
    }

    try {
      if (plc.type === 'INPUT') {
        await simulatorManager.stopSimulator(id);
      } else {
        await emulatorManager.stopEmulator(id);
      }

      await prisma.pLC.update({
        where: { id },
        data: { enabled: false },
      });

      return { success: true, message: `PLC ${plc.name} stopped` };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
