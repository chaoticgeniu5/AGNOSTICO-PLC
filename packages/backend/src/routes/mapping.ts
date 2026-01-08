import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';

const createMappingSchema = z.object({
  inputTagId: z.string().uuid(),
  outputPlcId: z.string().uuid(),
  outputTagName: z.string().min(1),
  outputAddress: z.string().min(1),
  scaleFactor: z.number().default(1.0),
  offset: z.number().default(0.0),
  enabled: z.boolean().default(true),
});

export async function mappingRoutes(fastify: FastifyInstance) {
  // Get all mappings
  fastify.get('/', {
    onRequest: [(fastify as any).authenticate],
  }, async () => {
    const mappings = await prisma.tagMapping.findMany({
      include: {
        inputTag: {
          include: { plc: true },
        },
        outputPlc: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return mappings;
  });

  // Get mappings for output PLC
  fastify.get('/output/:plcId', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const { plcId } = request.params as { plcId: string };
    const mappings = await prisma.tagMapping.findMany({
      where: { outputPlcId: plcId },
      include: {
        inputTag: {
          include: { plc: true },
        },
        outputPlc: true,
      },
    });
    return mappings;
  });

  // Create mapping
  fastify.post('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const data = createMappingSchema.parse(request.body);

      const mapping = await prisma.tagMapping.create({
        data,
        include: {
          inputTag: {
            include: { plc: true },
          },
          outputPlc: true,
        },
      });

      return mapping;
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Mapping already exists' });
      }
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Update mapping
  fastify.put('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createMappingSchema.partial().parse(request.body);

      const mapping = await prisma.tagMapping.update({
        where: { id },
        data,
        include: {
          inputTag: {
            include: { plc: true },
          },
          outputPlc: true,
        },
      });

      return mapping;
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Delete mapping
  fastify.delete('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const { id } = request.params as { id: string };
    await prisma.tagMapping.delete({ where: { id } });
    return { success: true };
  });

  // Bulk create mappings
  fastify.post('/bulk', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const schema = z.array(createMappingSchema);
      const mappings = schema.parse(request.body);

      const created = await prisma.tagMapping.createMany({
        data: mappings,
      });

      return { count: created.count };
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });
}
