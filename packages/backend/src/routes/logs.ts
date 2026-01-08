import { FastifyInstance } from 'fastify';
import { prisma } from '../index';

export async function logRoutes(fastify: FastifyInstance) {
  // Get recent logs
  fastify.get('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const { limit = '100', level, source } = request.query as any;

    const logs = await prisma.systemLog.findMany({
      where: {
        ...(level && { level }),
        ...(source && { source: { contains: source } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return logs;
  });

  // Clear old logs
  fastify.delete('/', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const user = (request as any).user;

    if (user.role !== 'admin') {
      return { error: 'Admin access required' };
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.systemLog.deleteMany({
      where: {
        createdAt: { lt: oneDayAgo },
      },
    });

    return { deleted: result.count };
  });
}
