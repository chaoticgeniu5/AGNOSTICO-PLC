# 🏭 AGNOSTICO PLC GATEWAY

**Because Your PLCs Speak Different Languages and Refuse to Talk to Each Other**

---

## The Problem (That You Already Know Too Well)

So you've got a factory floor that looks like a PLC museum:
- That vintage Siemens from 2005 that nobody dares to touch
- Allen-Bradley controllers from three different eras
- A Schneider Modicon that speaks French (literally, Modbus TCP)
- An Omron that... well, it does things differently

And now your boss wants "a unified dashboard" and "real-time analytics" because they attended a conference about Industry 4.0.

Your options were:
1. **Replace everything** (Budget: $500K, Timeline: Never)
2. **Custom integrations** (Budget: Your sanity, Timeline: "It's complicated")
3. **Cry in the server room** (Budget: Free, Timeline: Ongoing)

**Welcome to option 4.**

---

## What This Thing Actually Does

**AGNOSTICO PLC GATEWAY** is the universal translator your industrial equipment desperately needs. It's like having a multilingual engineer who never sleeps, never complains, and doesn't charge overtime.

```
┌─────────────────────────────────────────────────────────┐
│         YOUR MESS (Input PLCs)                          │
│  [Siemens] [Allen-Bradley] [Schneider] [Omron]         │
│     S7       EtherNet/IP     Modbus       FINS          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ╔═══════════════════════════╗
         ║   AGNOSTICO GATEWAY       ║  <- This guy right here
         ║  (The Adult in the Room)  ║
         ╚═══════════════════════════╝
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         WHAT YOUR DASHBOARD WANTS                       │
│       [OPC UA Server] [Modbus TCP Server]               │
│        "Perfect" Normalized Data                        │
└─────────────────────────────────────────────────────────┘
```

### Core Features (The Good Stuff)

🔌 **Multi-Protocol Input**
- Connects to Siemens (S7Comm), Allen-Bradley (EtherNet/IP), Schneider (Modbus TCP), Omron (FINS)
- Because vendor lock-in is so 2010

🎭 **Protocol Emulation**
- Presents data as OPC UA or Modbus TCP servers
- Your dashboard thinks it's talking to real PLCs (it doesn't need to know the truth)

🔄 **Real-Time Normalization**
- Tag renaming (because `DB1.DBX0.0` means nothing to humans)
- Value scaling (°C to °F, raw counts to engineering units)
- Quality propagation (if the PLC is lying, we'll tell you)

🖥️ **Modern Web UI**
- Dark theme (because you work night shifts)
- Real-time charts (for that dopamine hit when data flows)
- Monospace fonts (we respect the terminal aesthetic)

---

## Project Structure (For the Brave)

This is a TypeScript monorepo because we believe in organized chaos:

```
AGNOSTICO/
│
├── packages/
│   ├── backend/          # Node.js + Fastify + TypeScript
│   │   ├── src/
│   │   │   ├── api/      # REST API routes
│   │   │   ├── services/ # Protocol implementations
│   │   │   ├── engines/  # Input/Output PLC engines
│   │   │   └── db/       # Prisma ORM + SQLite
│   │   └── prisma/       # Database schema & migrations
│   │
│   ├── frontend/         # React + Vite + TailwindCSS
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Route pages
│   │   │   ├── hooks/       # React hooks
│   │   │   └── services/    # API client + Socket.IO
│   │   └── dist/            # Production build
│   │
│   ├── cli/              # Terminal UI (if you hate browsers)
│   └── desktop/          # Electron app (if you hate terminals)
│
├── docker-compose.yml    # One command to rule them all
├── Dockerfile.backend    # Backend container
├── Dockerfile.frontend   # Frontend + Nginx container
│
└── releases/             # 👈 COMPILED BINARIES GO HERE
    └── [Download pre-built releases from GitHub]
```

### Technology Stack (Because You Asked)

**Backend:**
- `Node.js 20+` - Because JavaScript on servers is a solved problem now
- `TypeScript` - To prevent future-you from hating present-you
- `Fastify` - Fast like your PLCs should be
- `Prisma` - ORM that doesn't make you write raw SQL
- `node-opcua` - Industrial protocols in JS (what a time to be alive)
- `modbus-serial` - Modbus but make it async/await

**Frontend:**
- `React 18` - Still winning the framework wars
- `Vite` - Webpack but it actually starts quickly
- `TailwindCSS` - CSS but you don't want to die
- `Recharts` - Charts that look good and work
- `Socket.IO` - WebSockets for the real-time drug

**Deployment:**
- `Docker` - Because "works on my machine" isn't acceptable
- `Docker Compose` - One command to start everything
- `Nginx` - Serving static files since before you were born

---

## Quick Start (10 Minutes or Your Money Back)

### Option 1: Docker (Recommended for Sane People)

```bash
# Clone this repo
git clone https://github.com/chaoticgeniu5/AGNOSTICO-PLC.git
cd AGNOSTICO-PLC

# Start the entire stack
docker-compose up -d

# Access the UI
open http://localhost
```

**Default credentials:**
- Admin: `admin` / `admin123` (yes, change this in production)

The system auto-seeds with demo PLCs and flowing data. You'll see results immediately or your money back (it's free, so...).

### Option 2: Download Pre-Built Releases

Because sometimes you just want binaries and don't care about the source:

1. Go to **[Releases](https://github.com/chaoticgeniu5/AGNOSTICO-PLC/releases)**
2. Download the latest version for your platform:
   - `agnostico-gateway-windows-x64.zip` (Windows)
   - `agnostico-gateway-linux-x64.tar.gz` (Linux)
   - `agnostico-gateway-macos-arm64.tar.gz` (macOS)
3. Extract and run:

```bash
# Linux/macOS
./agnostico-gateway

# Windows
agnostico-gateway.exe
```

**What you get:**
- Standalone executable (no dependencies)
- Embedded SQLite database
- Web UI accessible at `http://localhost:3000`
- OPC UA server on port 4840
- Modbus TCP server on port 5502

### Option 3: Install on Linux Server

We have installation scripts for Debian/Ubuntu and RedHat/CentOS:

```bash
# Debian/Ubuntu
sudo ./install-debian.sh

# RedHat/CentOS/Fedora
sudo ./install-redhat.sh
```

This installs AGNOSTICO as a systemd service. Check the [LINUX_INSTALLATION.md](LINUX_INSTALLATION.md) for details.

---

## Usage (The Fun Part)

### 1. Add Input PLCs

Navigate to **INPUT PLCs** → **CREATE PLC**

Connect to your real PLCs or create simulated ones for testing. The system supports:
- **Siemens S7**: S7-300, S7-400, S7-1200, S7-1500
- **Allen-Bradley**: ControlLogix, CompactLogix
- **Schneider**: Modicon M580, M340
- **Omron**: NJ/NX series

### 2. Create Output Emulators

Navigate to **OUTPUT PLCs** → **CREATE EMULATOR**

Create virtual PLCs that your dashboards can connect to:
- **OPC UA Server**: Standard endpoint at `opc.tcp://localhost:4840`
- **Modbus TCP Server**: Register-mapped endpoint at `modbus://localhost:5502`

### 3. Map Your Tags

Navigate to **MAPPINGS** → **CREATE MAPPING**

Connect the dots:
- Input: `Siemens_PLC > Temperature_Reactor_01`
- Transform: Scale × 0.1 (raw to engineering units)
- Output: `Dashboard_Gateway > Reactor_Temp`

**Data flows automatically.** No restarts. No prayers.

### 4. Monitor Everything

Navigate to **LOGS** for real-time system events.

Watch your data flow like it's the Matrix, except it actually makes sense.

---

## Connecting External Clients

### OPC UA Client Example (Python)

```python
from opcua import Client

client = Client("opc.tcp://localhost:4840")
client.connect()

# Browse available tags
root = client.get_root_node()
temperature = client.get_node("ns=1;s=Reactor_Temp")
print(f"Current temp: {temperature.get_value()}°C")

client.disconnect()
```

### Modbus TCP Client Example (Python)

```python
from pymodbus.client import ModbusTcpClient

client = ModbusTcpClient('localhost', port=5502)
client.connect()

# Read holding registers (address 0, count 10)
result = client.read_holding_registers(0, 10)
print(f"Registers: {result.registers}")

client.close()
```

---

## Development Setup (For Contributors)

Want to hack on this? Brave soul.

```bash
# Install dependencies (requires Node.js 20+)
npm install

# Run backend
cd packages/backend
npm run dev

# Run frontend (separate terminal)
cd packages/frontend
npm run dev
```

**Ports:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- OPC UA: `opc.tcp://localhost:4840`
- Modbus TCP: `modbus://localhost:5502`

---

## Production Deployment

### Environment Variables

Create a `.env` file (don't use the demo one in production, seriously):

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-key-not-admin123
DATABASE_URL=file:/app/data/production.db
PORT=3000
```

### Docker Compose Production

```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Scaling Considerations

**Single instance can handle:**
- 50-100 simultaneous PLC connections
- 10,000+ real-time tags
- 20+ concurrent OPC UA/Modbus clients

**Need more?** Deploy multiple instances with external PostgreSQL and Redis.

---

## Troubleshooting (When Things Go South)

### "Connection refused" from PLC
- Check firewall rules (PLCs are paranoid)
- Verify IP address and protocol settings
- Ensure the PLC actually exists (yes, this has happened)

### "OPC UA endpoint not reachable"
- Check port 4840 is not blocked
- Restart the output emulator
- Check system logs for errors

### "Data not flowing in mappings"
- Verify input PLC is STARTED
- Verify output emulator is STARTED
- Check mapping configuration
- Sacrifice a rubber duck to the debugging gods

### Still broken?
- Check logs in **LOGS** section
- Restart Docker containers: `docker-compose restart`
- File an issue on GitHub with logs

---

## Roadmap (Promises We Might Keep)

**✅ Working Now:**
- Multi-protocol input (S7, EtherNet/IP, Modbus, FINS)
- OPC UA and Modbus output
- Real-time normalization and mapping
- Web-based management UI

**🚧 Coming Eventually:**
- Profinet support (because why not)
- BACnet integration (building automation wants in)
- MQTT publisher (cloud people are demanding it)
- Historian database integration (PostgreSQL, InfluxDB)
- Python scripting for custom transforms
- High availability clustering

**💭 Pipe Dreams:**
- AI-powered anomaly detection
- Time travel debugging
- Self-healing configurations
- Vendor-neutral world peace

---

## License

MIT License - Do whatever you want with it.

**But seriously:** This is production-quality software. Use it commercially, modify it, sell it. Just don't blame us when your factory runs too smoothly.

---

## Contributing

Found a bug? Want to add a protocol? PRs welcome.

Just follow these simple rules:
1. Write TypeScript, not JavaScript cosplaying as TypeScript
2. Add tests (yes, really)
3. Don't break existing stuff
4. Use meaningful commit messages (not "fix stuff")

---

## Acknowledgments

Built with:
- **Node OPC UA** by Etienne Rossignon (absolute legend)
- **Fastify** - Because Express is so 2015
- **React** - Still the king
- **Prisma** - ORM done right
- **Coffee** - The real MVP

---

## Support & Professional Services

**Having issues?**
- Check the [docs](./docs/)
- Search [existing issues](https://github.com/chaoticgeniu5/AGNOSTICO-PLC/issues)
- Create a new issue with logs

**Need help with implementation or customization?**

Sometimes you need someone who actually knows what they're doing to set this up for your specific infrastructure. That's fair—industrial systems are complicated, and every facility is a unique snowflake of technical debt.

I can help you with:
- **Custom deployment** for your specific environment
- **Protocol integration** for that obscure PLC you have
- **Custom transformations** and business logic
- **On-site installation** and training
- **Performance tuning** for high-volume scenarios
- **Integration** with your existing SCADA/MES/ERP systems

**Contact:**
- **Julio Gonzalez**
- Email: [admin@dba.mx](mailto:admin@dba.mx)

---

## Final Words

Industrial automation is hard enough without your equipment fighting each other. AGNOSTICO PLC GATEWAY is here to be the adult in the room—translating, normalizing, and making sure everyone plays nice.

Now go fix your factory. ⚙️

**Built with industrial-grade frustration and enterprise-level coffee.**

---

*"It just works."* - Every engineer's dream, now a reality.
