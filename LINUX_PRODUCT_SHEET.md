# 🐧 Industrial Gateway Platform - Linux Edition

**Professional CLI/TUI Solution for Industrial Automation**

---

## 🎯 Product Overview

The Industrial Gateway Platform Linux Edition delivers enterprise-grade PLC connectivity and data normalization through a powerful command-line interface (CLI) and interactive terminal user interface (TUI).

**Perfect for:**
- Headless server deployments
- Remote SSH management
- Automated operations (CI/CD, scripts)
- Edge computing devices
- Industrial gateways without GUI
- DevOps-driven automation workflows

---

## ✨ Key Features

### 🖥️ Professional CLI

**Command-Line Power**
- Complete system control from terminal
- Intuitive commands (igp plc list, igp tag watch, etc.)
- Scriptable for automation
- JSON output support (planned)
- Tab completion (planned)
- Color-coded output

**Remote Management**
- SSH-friendly
- Works over slow connections
- No GUI required
- Perfect for datacenter deployments

### 📊 Interactive TUI

**Terminal Dashboard**
- Real-time stats and metrics
- Live PLC status table
- Animated tag value charts
- Streaming system logs
- WebSocket-powered updates
- Keyboard-driven navigation

**Industrial Aesthetics**
- Clean, professional layout
- Color-coded information
- Responsive to terminal size
- Works in any terminal emulator

### 🚀 Enterprise Deployment

**Production-Ready**
- Systemd integration
- Auto-start on boot
- Journal logging
- Service management (start/stop/restart)
- Graceful shutdown
- Health monitoring

**Security Hardened**
- Dedicated system user
- Minimal permissions (PrivateTmp, ProtectSystem)
- SELinux compatible (Red Hat)
- Firewall configuration included
- JWT authentication
- Secure secrets generation

### 🔧 Platform Support

**Debian Family**
- Debian 10, 11, 12
- Ubuntu 20.04, 22.04, 24.04
- Automated installer
- APT integration

**Red Hat Family**
- RHEL 8, 9
- CentOS Stream 8, 9
- Rocky Linux 8, 9
- AlmaLinux 8, 9
- Fedora 37+
- DNF integration
- SELinux configuration
- Firewalld rules

---

## 📦 What's Included

### CLI Commands

**System Management**
```bash
igp status          # System overview
igp health          # Health check
igp start/stop      # Service control
igp tui             # Launch Terminal UI
```

**PLC Operations**
```bash
igp plc list                # List all PLCs
igp plc create              # Create new PLC (interactive)
igp plc start <id>          # Start PLC
igp plc info <id>           # View details
```

**Tag Management**
```bash
igp tag list <plcId>        # List tags
igp tag watch <tagId>       # Real-time values
igp tag create              # Add new tag
```

**Mapping Control**
```bash
igp mapping list            # View mappings
igp mapping create          # Create mapping
igp mapping delete <id>     # Remove mapping
```

**Logs & Monitoring**
```bash
igp logs                    # View logs
igp logs -f                 # Follow logs
igp logs --level ERROR      # Filter by level
```

**Authentication**
```bash
igp login                   # Login
igp logout                  # Logout
```

### TUI Features

**Dashboard Panels**
- System statistics (4 cards)
- PLC list table (scrollable)
- Real-time tag chart (3 tags)
- System log stream (color-coded)
- Connection status indicator

**Keyboard Controls**
- `q` / `ESC` / `Ctrl+C` → Quit
- `r` → Refresh manually

---

## 🏗️ Installation

### Quick Install (Debian/Ubuntu)

```bash
wget https://releases.industrial-gateway.io/install-debian.sh
chmod +x install-debian.sh
sudo ./install-debian.sh
```

### Quick Install (Red Hat/CentOS)

```bash
wget https://releases.industrial-gateway.io/install-redhat.sh
chmod +x install-redhat.sh
sudo ./install-redhat.sh
```

**Installation Time:** 3-5 minutes

**Post-Install:**
- Service auto-starts
- CLI available globally: `igp`
- Default credentials: admin/admin123

---

## 💻 System Requirements

**Minimum Specs:**
- CPU: 2 cores
- RAM: 2 GB
- Disk: 5 GB
- Network: Ports 3000, 4840, 502

**Recommended Specs:**
- CPU: 4 cores
- RAM: 4 GB
- Disk: 10 GB
- SSD storage

---

## 🎯 Use Cases

### 1. Remote Data Center

```bash
# SSH into server
ssh admin@gateway.factory.com

# Check status
igp status

# View live TUI
igp tui
```

### 2. Automated Deployment

```bash
#!/bin/bash
# Deploy PLCs via script

igp login << EOF
admin
admin123
EOF

igp plc create --name "Line 1" --brand SIEMENS --type INPUT
igp plc create --name "Gateway" --brand GENERIC --type OUTPUT --protocol OPCUA

# Start all
igp plc list | tail -n +2 | awk '{print $1}' | xargs -I {} igp plc start {}
```

### 3. CI/CD Integration

```yaml
# .gitlab-ci.yml
deploy_gateway:
  script:
    - ssh gateway "igp plc list"
    - ssh gateway "igp health || exit 1"
```

### 4. Monitoring Integration

```bash
# Nagios check
if igp health > /dev/null 2>&1; then
    echo "OK"
    exit 0
else
    echo "CRITICAL"
    exit 2
fi
```

---

## 📊 Performance

**Metrics:**
- CLI command response: < 100ms
- TUI refresh rate: 10s (configurable)
- Tag updates: Real-time (WebSocket)
- Log latency: < 50ms

**Scale:**
- PLCs: 50-100 per instance
- Tags: 10,000+ concurrent
- Mappings: Unlimited
- Logs: Journal (systemd) - rotates automatically

---

## 🔐 Security Features

✅ Dedicated system user (non-login)
✅ Minimal file permissions
✅ Systemd security hardening
✅ SELinux contexts (Red Hat)
✅ Firewall rules included
✅ JWT authentication
✅ Secure secret generation
✅ No passwords in logs

---

## 📚 Documentation

**Included Guides:**
- `LINUX_INSTALLATION.md` - Complete installation guide
- `CLI_TUI_GUIDE.md` - Full command reference
- `README.md` - Product overview
- `DEMO_SCRIPT.md` - Sales demo guide

**Online:**
- API Documentation
- Video tutorials
- Community forums
- GitHub repository

---

## 🛠️ Support & Licensing

### Community Support
- GitHub Issues
- Community Forums
- Documentation Wiki

### Commercial Support
- 24/7 Enterprise Support
- Custom development
- On-site training
- Priority updates
- SLA guarantees

### Licensing
- **Evaluation**: Free for testing (30 days)
- **Commercial**: License per server
- **Enterprise**: Unlimited servers + support

**Contact:** sales@industrial-gateway.io

---

## 🚦 Getting Started (3 Steps)

### 1. Install

```bash
sudo ./install-debian.sh
```

### 2. Verify

```bash
igp status
```

### 3. Explore

```bash
igp tui
```

**That's it!** You're ready to connect PLCs.

---

## 🎁 What Makes This Special

**vs Traditional SCADA:**
- ✅ No GUI overhead
- ✅ Remote SSH access
- ✅ Scriptable automation
- ✅ Modern CLI design

**vs Web-Only Solutions:**
- ✅ Works without browser
- ✅ Low bandwidth usage
- ✅ Terminal multiplexer compatible (tmux/screen)
- ✅ Perfect for headless servers

**vs Custom Scripts:**
- ✅ Professional polish
- ✅ Built-in TUI
- ✅ Service management
- ✅ Production-ready security

---

## 📈 Roadmap

**Q1 2026:**
- Tab completion
- JSON output mode
- Plugin system

**Q2 2026:**
- Cluster management
- Multi-gateway TUI
- Advanced scripting

**Q3 2026:**
- Built-in REPL
- Web UI companion
- Mobile monitoring

---

## 💼 Pricing

**Community Edition:**
- Free forever
- Single server
- Community support
- Open source

**Professional:**
- $299/server/year
- Email support
- Priority updates
- Commercial use

**Enterprise:**
- Custom pricing
- Unlimited servers
- 24/7 support
- On-premise deployment
- Custom features

---

## 🏆 Why Choose Linux Edition?

✅ **DevOps-Friendly** - Automate everything
✅ **SSH-Native** - Manage from anywhere
✅ **Low Resource** - Run on minimal hardware
✅ **Scriptable** - Integrate with existing tools
✅ **Production-Ready** - Systemd, logging, security
✅ **Modern Design** - Beautiful CLI/TUI
✅ **Open Platform** - No vendor lock-in

---

**Industrial Gateway Platform - Linux Edition**

*Command-line power for industrial automation professionals.*

**Try it today:** https://releases.industrial-gateway.io

**Contact sales:** sales@industrial-gateway.io
