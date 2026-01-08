import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';

const createTagSchema = z.object({
  plcId: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  dataType: z.string().default('FLOAT'),
  unit: z.string().optional(),
  signalType: z.enum(['SINE', 'RAMP', 'RANDOM', 'DIGITAL']).optional(),
  frequency: z.number().optional(),
  amplitude: z.number().optional(),
  offset: z.number().optional(),
});

export async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags for a PLC
  fastify.get('/plc/:plcId', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const { plcId } = request.params as { plcId: string };
    const tags = await prisma.tag.findMany({
      where: { plcId },
      include: {
        plc: true,
        mappings: true,
      },
      orderBy: { name: 'asc' },
    });
    return tags;
  });

  // Create tag
  fastify.post('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const data = createTagSchema.parse(request.body);

      const tag = await prisma.tag.create({
        data,
        include: { plc: true },
      });

      return tag;
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Tag name already exists for this PLC' });
      }
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Update tag
  fastify.put('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = createTagSchema.partial().parse(request.body);

      const tag = await prisma.tag.update({
        where: { id },
        data,
        include: { plc: true },
      });

      return tag;
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Delete tag
  fastify.delete('/:id', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const { id } = request.params as { id: string };
    await prisma.tag.delete({ where: { id } });
    return { success: true };
  });

  // Bulk create tags
  fastify.post('/bulk', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const schema = z.array(createTagSchema);
      const tags = schema.parse(request.body);

      const created = await prisma.tag.createMany({
        data: tags,
      });

      return { count: created.count };
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });
}
