# 🖥️ CLI & TUI User Guide

Complete guide for using the Industrial Gateway Platform command-line interface and terminal user interface.

---

## 📌 Table of Contents

- [CLI Commands](#cli-commands)
- [Terminal UI (TUI)](#terminal-ui-tui)
- [Automation & Scripting](#automation--scripting)
- [Advanced Usage](#advanced-usage)

---

## CLI Commands

### System Management

**Check System Status**

```bash
igp status
```

Output:
```
SYSTEM STATUS
─────────────────────────────────────────────────────────
│ Metric              │ Value                          │
─────────────────────────────────────────────────────────
│ Status              │ ● RUNNING                      │
│ Uptime              │ 2024-01-15T10:30:00.000Z       │
│ Input PLCs          │ 3                              │
│ Output PLCs         │ 1                              │
│ Active Mappings     │ 2                              │
│ Total Tags          │ 7                              │
─────────────────────────────────────────────────────────
```

**Health Check**

```bash
igp health
```

**View Help**

```bash
igp --help
igp plc --help
igp tag --help
```

---

### PLC Management

**List All PLCs**

```bash
igp plc list
```

**Filter by Type**

```bash
igp plc list --type INPUT
igp plc list --type OUTPUT
```

**Create New PLC (Interactive)**

```bash
igp plc create
```

Follow the prompts:
```
📝 Create New PLC

? PLC Name: Production Line 1
? Select Brand: Siemens (S7COMM)
? PLC Type: Input (Simulator)

✓ PLC created successfully

Details:
  ID: plc-abc123...
  Name: Production Line 1
  Type: INPUT

? Start this PLC now? Yes
✓ PLC started successfully
```

**Create PLC (Non-Interactive)**

```bash
igp plc create \
  --name "Production Line 1" \
  --brand SIEMENS \
  --protocol S7COMM \
  --type INPUT
```

**View PLC Details**

```bash
igp plc info plc-abc123...
```

Output includes:
- Basic information
- Connection details
- Tag list (first 10)
- Mapping information

**Start/Stop PLC**

```bash
igp plc start plc-abc123...
igp plc stop plc-abc123...
```

**Delete PLC**

```bash
igp plc delete plc-abc123...
```

---

### Tag Management

**List Tags for a PLC**

```bash
igp tag list plc-abc123...
```

**Create Tag**

```bash
igp tag create \
  --plc plc-abc123... \
  --name Temperature_Zone1 \
  --address DB1.DBD0 \
  --type FLOAT \
  --unit °C \
  --signal SINE
```

**Watch Tag in Real-Time**

```bash
igp tag watch tag-xyz789...
```

Output (updates continuously):
```
👁  Watching tag (Press Ctrl+C to stop)

Connected to server

10:30:45 Temperature_Zone1: 75.342 GOOD
10:30:46 Temperature_Zone1: 76.128 GOOD
10:30:47 Temperature_Zone1: 77.015 GOOD
...
```

---

### Mapping Management

**List All Mappings**

```bash
igp mapping list
```

**Create Mapping**

```bash
igp mapping create \
  --input tag-input-123 \
  --output plc-output-456 \
  --name Gateway_Temperature \
  --address "ns=1;s=Temperature" \
  --scale 1.0 \
  --offset 0.0
```

**Example: Convert °C to °F**

```bash
igp mapping create \
  --input tag-temp-celsius \
  --output plc-gateway \
  --name Temperature_F \
  --address "ns=1;s=Temp_F" \
  --scale 1.8 \
  --offset 32
```

**Delete Mapping**

```bash
igp mapping delete mapping-abc123...
```

---

### Logs

**View Recent Logs**

```bash
# Last 50 lines (default)
igp logs

# Last 100 lines
igp logs -n 100

# Filter by level
igp logs --level ERROR
igp logs --level WARN
```

**Follow Logs (Live Stream)**

```bash
igp logs -f
```

Press `Ctrl+C` to stop.

Output format:
```
📜 Following logs (Press Ctrl+C to stop)

Connected

10:30:45 [INFO ] PLCSimulator        : Started simulator: Siemens S7-1500
10:30:46 [INFO ] NormalizationEngine : Processed tag Temperature_Zone1
10:30:47 [WARN ] PLCEmulator         : Output PLC not started
...
```

---

### Authentication

**Login**

```bash
igp login
```

Prompts for username and password:
```
🔐 Login to Industrial Gateway Platform

? Username: admin
? Password: ********

✓ Login successful

User: admin
Role: admin
```

**Logout**

```bash
igp logout
```

---

## Terminal UI (TUI)

### Launch TUI

```bash
igp tui
```

### TUI Layout

```
╔═══════════════════════════════════════════════════════════╗
║     🏭 INDUSTRIAL GATEWAY PLATFORM - TERMINAL UI          ║
╚═══════════════════════════════════════════════════════════╝

┌─ INPUT PLCs ──┐ ┌─ OUTPUT PLCs ─┐ ┌─ ACTIVE MAPPINGS ┐ ┌─ TOTAL TAGS ─┐
│      3        │ │      1        │ │        2         │ │      7       │
└───────────────┘ └───────────────┘ └──────────────────┘ └──────────────┘

┌─ PLCs ────────────────────────────┐ ┌─ Tag Values (Real-time) ─────────┐
│ Name            Brand    Protocol │ │                                  │
│ Siemens S7      SIEMENS  S7COMM   │ │  100 ┤                 ┌─Legend─┐│
│ Allen-Bradley   ALLEN_B  ETHERNET │ │   90 ┤        ┌────    │ Temp   ││
│ Schneider       SCHNEID  MODBUS   │ │   80 ┤    ┌───┘        │ Press  ││
│                                    │ │   70 ┤────┘            │ Flow   ││
└────────────────────────────────────┘ └──────────────────────────────────┘

┌─ System Logs ──────────────────────────────────────────────────────────┐
│ [INFO] PLCSimulator: Started simulator Siemens S7-1500                │
│ [INFO] NormalizationEngine: Processed tag Temperature_Zone1            │
│ [INFO] PLCEmulator: OPC UA server started on port 4840                │
└────────────────────────────────────────────────────────────────────────┘

 Status: ● Connected | Press q to quit, r to refresh
```

### TUI Features

1. **Real-Time Stats**
   - Number of input PLCs
   - Number of output PLCs
   - Active mappings count
   - Total tags count

2. **PLC Table**
   - Scrollable list of all PLCs
   - Shows name, brand, protocol, status
   - Auto-refreshes every 10 seconds

3. **Live Tag Chart**
   - Real-time line chart of tag values
   - Displays up to 3 tags simultaneously
   - Color-coded by tag name
   - WebSocket-powered updates

4. **System Logs**
   - Streaming log output
   - Color-coded by level (INFO/WARN/ERROR)
   - Auto-scrolls with new entries

5. **Connection Status**
   - Shows WebSocket connection state
   - Green ● when connected
   - Red ○ when disconnected

### TUI Keyboard Controls

| Key | Action |
|-----|--------|
| `q` | Quit TUI |
| `ESC` | Quit TUI |
| `Ctrl+C` | Quit TUI |
| `r` | Refresh data manually |

---

## Automation & Scripting

### Bash Script Example

**Create and Start Multiple PLCs**

```bash
#!/bin/bash

# Create input PLCs
SIEMENS=$(igp plc create --name "Line 1 Siemens" --brand SIEMENS --type INPUT --protocol S7COMM | grep "ID:" | awk '{print $2}')
AB=$(igp plc create --name "Line 2 Allen-Bradley" --brand ALLEN_BRADLEY --type INPUT --protocol ETHERNET_IP | grep "ID:" | awk '{print $2}')

# Create output PLC
GATEWAY=$(igp plc create --name "SCADA Gateway" --brand GENERIC --type OUTPUT --protocol OPCUA | grep "ID:" | awk '{print $2}')

# Start all PLCs
igp plc start $SIEMENS
igp plc start $AB
igp plc start $GATEWAY

echo "All PLCs created and started"
```

### Python Integration

```python
#!/usr/bin/env python3
import subprocess
import json

def run_igp(command):
    """Run igp command and return output"""
    result = subprocess.run(
        f"igp {command}",
        shell=True,
        capture_output=True,
        text=True
    )
    return result.stdout

# Get system status
status = run_igp("status")
print(status)

# List PLCs
plcs = run_igp("plc list")
print(plcs)
```

### Systemd Timer for Auto-Restart

Create `/etc/systemd/system/igp-health-check.service`:

```ini
[Unit]
Description=Industrial Gateway Health Check
After=industrial-gateway.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/igp health
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/igp-health-check.timer`:

```ini
[Unit]
Description=Run Industrial Gateway Health Check every 5 minutes

[Timer]
OnBootSec=5min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl enable igp-health-check.timer
sudo systemctl start igp-health-check.timer
```

---

## Advanced Usage

### Remote API Access

Set custom API endpoint:

```bash
# For current session
export IGP_API_URL=http://192.168.1.100:3000/api

# Permanently
echo 'export IGP_API_URL=http://192.168.1.100:3000/api' >> ~/.bashrc
```

### Configuration File

CLI stores configuration in: `~/.industrial-gateway/`

- `config.json` - API endpoint and settings
- `token` - Authentication token

Manual edit:
```bash
nano ~/.industrial-gateway/config.json
```

### Batch Operations

**Start all INPUT PLCs:**

```bash
igp plc list --type INPUT | tail -n +4 | awk '{print $1}' | xargs -I {} igp plc start {}
```

**Export all PLCs to JSON:**

```bash
# Requires jq
igp plc list --json > plcs.json
```

---

## Tips & Best Practices

### 1. Use Aliases

Add to `~/.bashrc`:

```bash
alias igp-status='igp status'
alias igp-logs='igp logs -f'
alias igp-ui='igp tui'
```

### 2. Tab Completion (Future)

Will be available in future releases.

### 3. JSON Output Mode

Currently in development - will allow:
```bash
igp plc list --json | jq '.[] | select(.enabled == true)'
```

### 4. Monitoring Integration

Use with Nagios/Zabbix:

```bash
#!/bin/bash
# Check if gateway is healthy
if igp health > /dev/null 2>&1; then
    echo "OK - Gateway is healthy"
    exit 0
else
    echo "CRITICAL - Gateway is down"
    exit 2
fi
```

---

## Troubleshooting

**CLI Command Not Working?**

```bash
# Check PATH
echo $PATH | grep /usr/local/bin

# Verify symlink
ls -la /usr/local/bin/igp

# Check permissions
ls -la ~/.industrial-gateway/
```

**TUI Not Rendering Correctly?**

```bash
# Check terminal type
echo $TERM

# Set to xterm-256color if needed
export TERM=xterm-256color

# Try different terminal emulator
```

**Connection Issues?**

```bash
# Test API directly
curl http://localhost:3000/health

# Check service
systemctl status industrial-gateway

# View logs
journalctl -u industrial-gateway -f
```

---

**Master the CLI & TUI for maximum productivity in industrial automation workflows.**
