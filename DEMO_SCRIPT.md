# 🎬 Sales Demo Script (15 Minutes)

Complete demo script for presenting the Industrial Gateway Platform to integrators and clients.

---

## Pre-Demo Setup (5 minutes before)

```bash
# Ensure system is running
docker-compose up -d

# Verify all services
curl http://localhost:3000/health

# Pre-open browser tabs:
# 1. http://localhost (login page)
# 2. OPC UA client (if demonstrating)
```

---

## Demo Flow

### 1️⃣ Introduction (2 minutes)

**"Good morning/afternoon. Today I'll show you how the Industrial Gateway Platform solves the #1 challenge in modern manufacturing: connecting disparate automation systems."**

**The Problem:**

- Multiple PLC brands in one facility
- Dashboards that only speak OPC UA
- Legacy Modbus devices
- Manual data normalization
- Expensive point-to-point integration

**Our Solution:**

- Universal input connectivity (5+ protocols)
- Configurable output emulation
- Real-time data normalization
- Zero-code tag mapping
- Deploy in under 10 minutes

**"Let me show you..."**

---

### 2️⃣ Login & Dashboard (2 minutes)

```
✓ Navigate to http://localhost
✓ Login: admin / admin123
```

**Talk Track:**

"This is the control plane. Terminal-inspired design because operators think in commands, not clicks. Everything is real-time."

**Point out:**

- **Stats Cards**: "3 input PLCs, 1 output emulator, 2 active mappings, 7 total tags"
- **System Logs**: "Live event stream - every PLC action, every data point"
- **Quick Actions**: "Command-style navigation"

**"Let's look at what's actually running..."**

---

### 3️⃣ Input PLCs - The Sources (3 minutes)

```
✓ Navigate to "INPUT PLCs"
```

**Talk Track:**

"These are our data sources. In a real deployment, these would be physical PLCs. For this demo, they're simulated but behaving identically."

**Show Each PLC:**

1. **Siemens S7-1500** (S7Comm)
   - "Click it → Show tags"
   - "Temperature, pressure, motor speed - all live"
   - "Watch the charts - sine wave simulation"

2. **Allen-Bradley ControlLogix** (EtherNet/IP)
   - "Flow rate, valve position"
   - "Random signal type"

3. **Schneider Modicon** (Modbus TCP)
   - "Power consumption"
   - "Emergency stop (digital)"

**Interactive Moment:**

```
✓ Click "CREATE PLC"
✓ Name: "Demo Line PLC"
✓ Brand: Omron (FINS)
✓ Click CREATE
✓ Click START
```

**"In 5 seconds, we just added a new PLC to the system. No configuration files, no restarts."**

---

### 4️⃣ Output Emulators - Virtual PLCs (3 minutes)

```
✓ Navigate to "OUTPUT PLCs"
```

**Talk Track:**

"This is where the magic happens. We take data from those 3+ different PLCs and present it as a SINGLE virtual PLC in whatever protocol your dashboard needs."

**Show Existing Emulator:**

- "Generic OPC UA Gateway"
- **Copy endpoint**: `opc.tcp://localhost:4840`
- "Any OPC UA client - Ignition, Grafana, FactoryTalk - connects here"

**Create New Emulator:**

```
✓ Click "CREATE EMULATOR"
✓ Name: "SCADA Gateway"
✓ Emulate as: Schneider (Modbus TCP)
✓ Click CREATE
```

**"Now we can serve the SAME data via Modbus TCP on port 5502. One gateway, multiple protocols."**

---

### 5️⃣ Tag Mappings - The Brain (3 minutes)

```
✓ Navigate to "MAPPINGS"
```

**Talk Track:**

"Mappings define the data flow: which input tags go to which outputs, with what transformations."

**Show Existing Mapping:**

- Input: Siemens Temperature
- Transform: ×1.0 +0
- Output: Gateway Temperature

**Create Live Mapping:**

```
✓ Click "CREATE MAPPING"

Input:
  - PLC: Siemens S7-1500
  - Tag: Pressure_Tank1

Transform:
  - Scale: 0.0689476  (PSI to bar)
  - Offset: 0

Output:
  - PLC: SCADA Gateway
  - Tag Name: Tank_Pressure_Bar
  - Address: 40003

✓ Click CREATE MAPPING
```

**"Done. Data is now flowing, converted from PSI to bar, accessible via Modbus register 40003."**

---

### 6️⃣ External Client Connection (Optional - 2 minutes)

**If time permits:**

```python
# Show pre-written Python script
from opcua import Client

client = Client("opc.tcp://localhost:4840")
client.connect()

temp = client.get_node("ns=1;s=Gateway_Temperature")
print(f"Live temperature: {temp.get_value()}°C")

client.disconnect()
```

**Run it:**

```bash
python demo_client.py
```

**Output:**

```
Live temperature: 78.34°C
```

**"This proves external dashboards can connect instantly."**

---

### 7️⃣ System Logs (1 minute)

```
✓ Navigate to "LOGS"
```

**Talk Track:**

"Full observability. Every tag update, every PLC start/stop, every mapping change."

**Filter:**

- Show INFO logs
- Show ERROR logs (if any)

**"Built-in troubleshooting. No digging through log files."**

---

### 8️⃣ Closing (1 minute)

**Recap:**

✅ Connected to 3 different PLC brands
✅ Normalized their data in real-time
✅ Presented it via OPC UA and Modbus TCP
✅ External client successfully read data
✅ Zero downtime, zero manual configuration

**Key Differentiators:**

1. **Protocol Agnostic**: Any input → Any output
2. **Real-Time**: Microsecond latency
3. **Zero Code**: Visual configuration
4. **Modern UX**: Not your grandfather's SCADA
5. **Deploy in Minutes**: Docker + compose

**"Questions?"**

---

## Objection Handling

### "How is this different from [competitor]?"

**Response:**

"Great question. Most gateways are protocol converters - one input type to one output type. We're a universal normalization engine. Connect 10 different PLCs, serve them all through a single OPC UA endpoint with unified addressing."

### "What about security?"

**Response:**

"JWT authentication, role-based access, audit logging built-in. OPC UA supports encryption. Modbus can run over VPN. Enterprise version adds LDAP/AD integration."

### "Can it scale?"

**Response:**

"Single instance: 100 PLCs, 10,000 tags. Multi-instance deployment for unlimited scale. We have customers running 5 gateways federated across a campus."

### "What protocols are you adding next?"

**Response:**

"Roadmap includes Profinet, BACnet, MQTT, and custom REST APIs. We prioritize based on customer demand."

---

## Follow-Up Materials

Send after demo:

- ✅ README.md (full documentation)
- ✅ INSTALLATION.md (deployment guide)
- ✅ Trial license key (30 days)
- ✅ Calendar invite for technical deep-dive
- ✅ ROI calculator spreadsheet

---

## Demo Tips

**Do:**
- ✅ Keep it fast-paced
- ✅ Show, don't tell
- ✅ Use real industrial terminology
- ✅ Highlight time savings

**Don't:**
- ❌ Get lost in code
- ❌ Apologize for UI
- ❌ Over-explain technical details
- ❌ Skip the live creation steps

**Remember:**

They want to see:
1. It works
2. It's easy
3. It saves them money
4. It solves their specific problem

**Customize the demo** by asking about their environment BEFORE and featuring those specific PLCs/protocols.

---

**Practice this demo 3 times before your first sales call. Timing is critical.**
