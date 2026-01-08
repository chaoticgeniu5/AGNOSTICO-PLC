# 📦 Installation Guide

## Quick Start with Docker (Recommended)

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose
- 2GB available RAM
- Ports: 80, 3000, 4840, 5502

### Step-by-Step

1. **Navigate to project directory**

```bash
cd industrial-gateway-platform
```

2. **Start the system**

```bash
docker-compose up -d
```

3. **Wait for initialization (30-60 seconds)**

```bash
docker-compose logs -f
```

Watch for:
```
✓ Server running on 0.0.0.0:3000
✓ Socket.IO initialized
✓ Database connected
```

4. **Access the control plane**

Open browser: **http://localhost**

Login:
- Username: `admin`
- Password: `admin123`

---

## Development Setup (Without Docker)

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

1. **Install root dependencies**

```bash
npm install
```

2. **Setup backend**

```bash
cd packages/backend
npm install
cp .env.example .env
```

3. **Initialize database**

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. **Setup frontend**

```bash
cd ../frontend
npm install
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd packages/backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd packages/frontend
npm run dev
```

6. **Access application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- OPC UA: opc.tcp://localhost:4840

---

## Verification

### Check Services

**Backend API:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

**Frontend:**

Open http://localhost (or http://localhost:5173 for dev)

**OPC UA Server:**

Use any OPC UA client to connect to `opc.tcp://localhost:4840`

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already allocated`

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac

# Kill process or change port in .env
```

### Database Locked

**Error:** `SQLITE_BUSY: database is locked`

**Solution:**
```bash
# Stop all services
docker-compose down

# Remove database
rm packages/backend/dev.db

# Restart
docker-compose up -d
```

### Frontend Not Loading

**Error:** White screen or "Cannot connect to server"

**Solution:**
1. Check backend is running: `curl http://localhost:3000/health`
2. Clear browser cache
3. Check browser console for errors
4. Verify nginx proxy in Docker setup

---

## Next Steps

After successful installation:

1. ✅ Login to control plane
2. ✅ Review pre-seeded PLCs
3. ✅ Create your first mapping
4. ✅ Connect an external OPC UA client
5. ✅ Read the full [README.md](README.md)

---

## Production Deployment

See [README.md](README.md) section "Production Deployment" for:

- Environment variable configuration
- SSL/TLS setup
- Reverse proxy configuration
- Backup strategies
