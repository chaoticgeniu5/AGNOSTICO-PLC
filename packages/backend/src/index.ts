import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { authRoutes } from './routes/auth';
import { plcRoutes } from './routes/plc';
import { tagRoutes } from './routes/tag';
import { mappingRoutes } from './routes/mapping';
import { logRoutes } from './routes/logs';
import { setupSocketIO } from './socket/socket-handler';
import { PLCSimulatorManager } from './services/plc-simulator-manager';
import { PLCEmulatorManager } from './services/plc-emulator-manager';
import { NormalizationEngine } from './services/normalization-engine';

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

export const prisma = new PrismaClient();

const fastify = Fastify({
  logger: true,
});

// JWT Plugin
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'insecure-jwt-secret-change-this',
});

// CORS
fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Serve static frontend files (for Electron and production)
const isElectron = process.env.IS_ELECTRON === 'true';
const resourcesPath = process.env.RESOURCES_PATH || '';
const frontendPath = isElectron
  ? path.join(resourcesPath, 'frontend')
  : path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendPath)) {
  console.log(`📁 Serving frontend from: ${frontendPath}`);
  fastify.register(fastifyStatic, {
    root: frontendPath,
    prefix: '/',
  });

  // Serve index.html for all non-API routes (SPA routing)
  fastify.setNotFoundHandler((request, reply) => {
    if (!request.url.startsWith('/api') && !request.url.startsWith('/socket.io')) {
      reply.sendFile('index.html');
    } else {
      reply.status(404).send({ error: 'Not found' });
    }
  });
} else {
  console.log(`⚠️  Frontend not found at: ${frontendPath} (development mode)`);
}

// Authentication decorator
fastify.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(plcRoutes, { prefix: '/api/plcs' });
fastify.register(tagRoutes, { prefix: '/api/tags' });
fastify.register(mappingRoutes, { prefix: '/api/mappings' });
fastify.register(logRoutes, { prefix: '/api/logs' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Socket.IO Setup
const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

// Initialize services
const normalizationEngine = NormalizationEngine.getInstance();
const simulatorManager = PLCSimulatorManager.getInstance();
const emulatorManager = PLCEmulatorManager.getInstance();

// Initialize database with SQL migrations
const initDatabase = async () => {
  try {
    console.log('📊 Initializing database...');

    // Connect to database
    await prisma.$connect();
    console.log('✓ Database connected');

    // Check if tables exist by trying a simple query
    let tablesExist = false;
    try {
      await prisma.user.findFirst();
      tablesExist = true;
      console.log('✓ Database tables verified');
    } catch (error: any) {
      console.log('⚠️  Database tables not found, creating schema...');
    }

    // If tables don't exist, create them using raw SQL
    if (!tablesExist) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'operator',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PLC" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "brand" TEXT NOT NULL,
          "protocol" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "enabled" INTEGER NOT NULL DEFAULT 1,
          "port" INTEGER,
          "endpoint" TEXT,
          "config" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Tag" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "plcId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "dataType" TEXT NOT NULL DEFAULT 'FLOAT',
          "value" REAL NOT NULL DEFAULT 0,
          "unit" TEXT,
          "quality" TEXT NOT NULL DEFAULT 'GOOD',
          "signalType" TEXT DEFAULT 'SINE',
          "frequency" REAL DEFAULT 1.0,
          "amplitude" REAL DEFAULT 100.0,
          "offset" REAL DEFAULT 0.0,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("plcId") REFERENCES "PLC"("id") ON DELETE CASCADE
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Tag_plcId_name_key" ON "Tag"("plcId", "name");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TagMapping" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "inputTagId" TEXT NOT NULL,
          "outputPlcId" TEXT NOT NULL,
          "outputTagName" TEXT NOT NULL,
          "outputAddress" TEXT NOT NULL,
          "scaleFactor" REAL NOT NULL DEFAULT 1.0,
          "offset" REAL NOT NULL DEFAULT 0.0,
          "enabled" INTEGER NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("inputTagId") REFERENCES "Tag"("id") ON DELETE CASCADE,
          FOREIGN KEY ("outputPlcId") REFERENCES "PLC"("id") ON DELETE CASCADE
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "TagMapping_inputTagId_outputPlcId_outputTagName_key"
        ON "TagMapping"("inputTagId", "outputPlcId", "outputTagName");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SystemLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "level" TEXT NOT NULL,
          "source" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "metadata" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✓ Database schema created successfully');
    }

    // Create default admin user if none exists
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
        },
      });
      console.log('✓ Default admin user created (username: admin, password: admin)');
    }

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// Start server
const start = async () => {
  try {
    console.log('🚀 Starting Industrial Gateway Platform...');
    console.log(`📂 Working directory: ${process.cwd()}`);
    console.log(`📂 __dirname: ${__dirname}`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`🔌 Target PORT: ${PORT}`);
    console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL}`);

    // Initialize database first
    console.log('');
    await initDatabase();

    console.log('');
    console.log(`🌐 Starting Fastify server on ${HOST}:${PORT}...`);
    await fastify.listen({ port: PORT, host: HOST });

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏭 INDUSTRIAL GATEWAY PLATFORM v1.0.0                  ║
║                                                           ║
║   ✓ Server running on ${HOST}:${PORT}                   ║
║   ✓ Socket.IO initialized                                ║
║   ✓ Database connected                                   ║
║   ✓ Normalization engine ready                           ║
║   ✓ PLC Simulator manager ready                          ║
║   ✓ PLC Emulator manager ready                           ║
║                                                           ║
║   Dashboard: http://localhost:5173                       ║
║   API: http://localhost:${PORT}/api                      ║
║   OPC UA: opc.tcp://localhost:4840                       ║
║   Modbus TCP: localhost:502                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Auto-start enabled PLCs
    console.log('🔄 Auto-starting enabled PLCs...');
    await simulatorManager.startEnabledSimulators();
    await emulatorManager.startEnabledEmulators();
    console.log('✅ Backend fully initialized and ready!');

  } catch (err: any) {
    console.error('❌ FATAL ERROR during startup:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await simulatorManager.stopAll();
  await emulatorManager.stopAll();
  await prisma.$disconnect();
  process.exit(0);
});

start();

export { io };
