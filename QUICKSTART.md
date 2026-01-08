# ⚡ Quick Start Guide

Get the Industrial Gateway Platform running in under 5 minutes.

## Using Docker (Recommended)

```bash
# 1. Start the platform
docker-compose up -d

# 2. Wait for services (30 seconds)
docker-compose logs -f backend

# 3. Open your browser
# http://localhost

# 4. Login
# Username: admin
# Password: admin123
```

**That's it!** You now have:

- ✅ 3 simulated PLCs running (Siemens, Allen-Bradley, Schneider)
- ✅ Real-time data flowing
- ✅ Pre-configured tags with live signals
- ✅ OPC UA server on port 4840
- ✅ Web control plane on port 80

---

## Development Mode (No Docker)

```bash
# 1. Install dependencies
npm install

# 2. Setup backend
cd packages/backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed

# 3. Start backend (Terminal 1)
npm run dev

# 4. Start frontend (Terminal 2)
cd ../frontend
npm install
npm run dev

# 5. Open http://localhost:5173
```

---

## First Steps

### 1. Explore the Dashboard

- View system status
- Check running PLCs
- Monitor real-time logs

### 2. View Input PLCs

```
Navigate to: INPUT PLCs
- See 3 pre-configured simulators
- Click a PLC to view live tags
- Watch real-time charts
- Start/Stop simulators
```

### 3. Create an Output Emulator

```
Navigate to: OUTPUT PLCs
1. Click "CREATE EMULATOR"
2. Name: "My Gateway"
3. Select: Generic OPC UA PLC
4. Click CREATE
5. Click START
6. Copy the endpoint (opc.tcp://localhost:4840)
```

### 4. Create a Mapping

```
Navigate to: MAPPINGS
1. Click "CREATE MAPPING"
2. Input PLC: Siemens S7-1500
3. Input Tag: Temperature_Zone1
4. Output PLC: My Gateway
5. Output Tag Name: GW_Temperature
6. Output Address: ns=1;s=Temperature
7. Click CREATE MAPPING
```

**Data is now flowing from Siemens simulator → Your OPC UA Gateway!**

### 5. Connect External Client

Use any OPC UA client:

```python
from opcua import Client

client = Client("opc.tcp://localhost:4840")
client.connect()

temp = client.get_node("ns=1;s=Temperature")
print(f"Current temperature: {temp.get_value()}°C")
```

---

## Verification Commands

### Check Backend Health

```bash
curl http://localhost:3000/health
```

### View Logs

```bash
# Docker
docker-compose logs -f

# Development
# Check terminal running npm run dev
```

### Test OPC UA Server

```bash
# Using opcua-commander (npm install -g opcua-commander)
opcua-commander -e opc.tcp://localhost:4840
```

---

## Stop the Platform

### Docker

```bash
docker-compose down
```

### Development

```bash
# Press Ctrl+C in both terminal windows
```

---

## Next Steps

- 📖 Read [README.md](README.md) for full feature overview
- 📚 Check [INSTALLATION.md](INSTALLATION.md) for detailed setup
- 🎯 Follow the 15-minute integrator demo in README

---

## Troubleshooting

**Port already in use?**

```bash
# Change ports in docker-compose.yml or .env
# Default ports: 80, 3000, 4840, 5502
```

**Can't connect to backend?**

```bash
# Verify backend is running
curl http://localhost:3000/health

# Check Docker logs
docker-compose logs backend
```

**UI not loading?**

1. Clear browser cache
2. Try incognito mode
3. Check browser console (F12)
4. Verify frontend container is running

---

**Need help?** Check logs, README.md, or open an issue on GitHub.
