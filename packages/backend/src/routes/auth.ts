import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });

  // Get current user
  fastify.get('/me', {
    onRequest: [(fastify as any).authenticate],
  }, async (request) => {
    const user = (request as any).user;
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  });

  // Register (admin only)
  fastify.post('/register', {
    onRequest: [(fastify as any).authenticate],
  }, async (request, reply) => {
    try {
      const currentUser = (request as any).user;

      if (currentUser.role !== 'admin') {
        return reply.status(403).send({ error: 'Admin access required' });
      }

      const { username, password, role = 'operator' } = loginSchema.extend({
        role: z.enum(['admin', 'operator']).optional(),
      }).parse(request.body);

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
        },
      });

      return {
        id: user.id,
        username: user.username,
        role: user.role,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ error: 'Username already exists' });
      }
      return reply.status(400).send({ error: 'Invalid request' });
    }
  });
}
