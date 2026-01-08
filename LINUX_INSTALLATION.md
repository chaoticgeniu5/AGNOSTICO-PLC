# 🐧 Industrial Gateway Platform - Linux Installation

Complete installation and deployment guide for Debian/Ubuntu and Red Hat/CentOS Linux systems.

---

## 📋 System Requirements

### Minimum Requirements

- **OS**: Debian 10+, Ubuntu 20.04+, RHEL 8+, CentOS 8+, Rocky Linux 8+, AlmaLinux 8+
- **RAM**: 2GB minimum, 4GB recommended
- **CPU**: 2 cores minimum
- **Disk**: 5GB available space
- **Network**: Access to ports 3000, 4840, 502

### Prerequisites

- Root or sudo access
- Internet connection (for initial setup)
- curl, wget, or similar download tool

---

## 🚀 Quick Installation

### Debian / Ubuntu

```bash
# Download installer
wget https://github.com/industrial-gateway/releases/latest/install-debian.sh

# Make executable
chmod +x install-debian.sh

# Run installer
sudo ./install-debian.sh
```

### Red Hat / CentOS / Rocky / AlmaLinux

```bash
# Download installer
wget https://github.com/industrial-gateway/releases/latest/install-redhat.sh

# Make executable
chmod +x install-redhat.sh

# Run installer
sudo ./install-redhat.sh
```

---

## 📦 What Gets Installed

The installer performs the following actions:

1. **System Dependencies**
   - Node.js 20.x
   - Build tools (gcc, make, python3)
   - Git

2. **Application Files**
   - Installed to: `/opt/industrial-gateway`
   - Database: `/var/lib/industrial-gateway/production.db`
   - Configuration: `/etc/industrial-gateway.env`

3. **System User**
   - User: `industrial`
   - Home: `/opt/industrial-gateway`
   - Shell: `/bin/false` or `/sbin/nologin`

4. **CLI Tool**
   - Symlink: `/usr/local/bin/igp`
   - Global command: `igp`

5. **Systemd Service**
   - Service file: `/etc/systemd/system/industrial-gateway.service`
   - Auto-start: Enabled
   - Log integration: journald

6. **Firewall Rules** (Red Hat only)
   - Ports 3000, 4840, 502 opened
   - SELinux contexts configured

---

## ⚙️ Post-Installation

### Verify Installation

```bash
# Check service status
systemctl status industrial-gateway

# Should show: "active (running)"
```

### View Logs

```bash
# Follow live logs
journalctl -u industrial-gateway -f

# View last 100 lines
journalctl -u industrial-gateway -n 100
```

### Test CLI

```bash
# Check CLI is working
igp --version

# View help
igp --help

# Check system status
igp status
```

### Access Terminal UI

```bash
# Launch interactive dashboard
igp tui
```

---

## 🔧 Service Management

### Start / Stop / Restart

```bash
# Start service
sudo systemctl start industrial-gateway

# Stop service
sudo systemctl stop industrial-gateway

# Restart service
sudo systemctl restart industrial-gateway

# Reload configuration
sudo systemctl reload industrial-gateway
```

### Enable / Disable Auto-start

```bash
# Enable auto-start on boot
sudo systemctl enable industrial-gateway

# Disable auto-start
sudo systemctl disable industrial-gateway
```

### Check Status

```bash
# Service status
systemctl status industrial-gateway

# Is service running?
systemctl is-active industrial-gateway

# Is auto-start enabled?
systemctl is-enabled industrial-gateway
```

---

## 🔐 Security Configuration

### Change Default Password

```bash
# Login via CLI
igp login

# Or via API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Update JWT Secret

```bash
# Edit configuration
sudo nano /etc/industrial-gateway.env

# Change this line:
JWT_SECRET="your-new-secure-random-string-here"

# Restart service
sudo systemctl restart industrial-gateway
```

### Firewall Configuration

**Debian/Ubuntu (ufw):**

```bash
# Allow required ports
sudo ufw allow 3000/tcp
sudo ufw allow 4840/tcp
sudo ufw allow 502/tcp

# Enable firewall
sudo ufw enable
```

**Red Hat/CentOS (firewalld):**

```bash
# Already configured by installer, but manual commands:
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=4840/tcp
sudo firewall-cmd --permanent --add-port=502/tcp
sudo firewall-cmd --reload
```

### SELinux Configuration (Red Hat only)

```bash
# Check SELinux status
getenforce

# If errors occur, check audit log
sudo ausearch -m avc -ts recent

# Allow specific context (if needed)
sudo semanage fcontext -a -t bin_t /opt/industrial-gateway/packages/backend/dist/index.js
sudo restorecon -v /opt/industrial-gateway/packages/backend/dist/index.js
```

---

## 📊 Using the CLI

### Complete Command Reference

```bash
# System commands
igp status              # Show system status
igp health              # Health check
igp start               # Start gateway (development)
igp stop                # Stop gateway
igp restart             # Restart gateway
igp tui                 # Launch Terminal UI

# PLC management
igp plc list                    # List all PLCs
igp plc list --type INPUT       # Filter by type
igp plc create                  # Create new PLC (interactive)
igp plc start <id>              # Start a PLC
igp plc stop <id>               # Stop a PLC
igp plc info <id>               # Show PLC details
igp plc delete <id>             # Delete a PLC

# Tag management
igp tag list <plcId>            # List tags for PLC
igp tag watch <tagId>           # Watch tag in real-time
igp tag create --plc <id> --name <name> --address <addr>

# Mapping management
igp mapping list                # List all mappings
igp mapping create              # Create mapping
igp mapping delete <id>         # Delete mapping

# Logs
igp logs                        # Show recent logs
igp logs -f                     # Follow logs
igp logs -n 100                 # Show last 100 lines
igp logs --level ERROR          # Filter by level

# Authentication
igp login                       # Login
igp logout                      # Logout
```

---

## 🖥️ Terminal UI (TUI)

### Launch Terminal UI

```bash
igp tui
```

### TUI Features

- **Real-time dashboard** (updates every 10 seconds)
- **System statistics** (PLCs, mappings, tags)
- **Live PLC table** with status
- **Real-time tag charts** (up to 3 tags)
- **Streaming system logs**
- **WebSocket connection** for live updates

### TUI Keyboard Shortcuts

- `q` or `ESC` or `Ctrl+C` → Quit
- `r` → Refresh data manually

---

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
journalctl -u industrial-gateway -n 50

# Common issues:
# 1. Port already in use
sudo netstat -tulpn | grep :3000

# 2. Permission issues
sudo chown -R industrial:industrial /opt/industrial-gateway
sudo chown -R industrial:industrial /var/lib/industrial-gateway

# 3. Database locked
sudo systemctl stop industrial-gateway
sudo rm /var/lib/industrial-gateway/production.db-journal
sudo systemctl start industrial-gateway
```

### CLI Command Not Found

```bash
# Check symlink
ls -la /usr/local/bin/igp

# Recreate symlink
sudo ln -sf /opt/industrial-gateway/packages/cli/dist/index.js /usr/local/bin/igp
sudo chmod +x /usr/local/bin/igp
```

### Connection Refused (API)

```bash
# Check if service is running
systemctl status industrial-gateway

# Check if port is listening
sudo netstat -tulpn | grep :3000

# Check firewall
sudo ufw status    # Debian/Ubuntu
sudo firewall-cmd --list-all    # Red Hat/CentOS
```

### TUI Not Displaying Correctly

```bash
# Ensure terminal supports UTF-8
echo $LANG    # Should show UTF-8

# Set if needed
export LANG=en_US.UTF-8

# Try different terminal emulator
# Recommended: gnome-terminal, konsole, xterm
```

### Database Errors

```bash
# Backup database
sudo cp /var/lib/industrial-gateway/production.db /var/lib/industrial-gateway/production.db.backup

# Reset database
sudo systemctl stop industrial-gateway
sudo rm /var/lib/industrial-gateway/production.db
cd /opt/industrial-gateway/packages/backend
sudo -u industrial npx prisma db push
sudo -u industrial npx tsx src/database/seed.ts
sudo systemctl start industrial-gateway
```

---

## 🔄 Updates and Upgrades

### Update to New Version

```bash
# Stop service
sudo systemctl stop industrial-gateway

# Backup database
sudo cp /var/lib/industrial-gateway/production.db /root/gateway-backup.db

# Download new version
cd /opt/industrial-gateway
sudo git pull    # If using git
# OR
sudo wget <new-release-url> && sudo tar -xzf <new-release>

# Update dependencies
sudo npm install --production
cd packages/backend && sudo npm install --production && cd ../..
cd packages/cli && sudo npm install --production && sudo npm run build && cd ../..

# Run migrations
cd /opt/industrial-gateway/packages/backend
sudo -u industrial npx prisma migrate deploy

# Restart service
sudo systemctl start industrial-gateway
```

---

## 🗑️ Uninstall

```bash
# Stop and disable service
sudo systemctl stop industrial-gateway
sudo systemctl disable industrial-gateway

# Remove service file
sudo rm /etc/systemd/system/industrial-gateway.service
sudo systemctl daemon-reload

# Remove application
sudo rm -rf /opt/industrial-gateway

# Remove data (CAUTION: This deletes all PLCs, tags, etc.)
sudo rm -rf /var/lib/industrial-gateway

# Remove configuration
sudo rm /etc/industrial-gateway.env

# Remove CLI symlink
sudo rm /usr/local/bin/igp

# Remove user (optional)
sudo userdel industrial
```

---

## 📞 Support

### Log Collection for Support

```bash
# Collect logs
journalctl -u industrial-gateway -n 500 > gateway-logs.txt

# System info
uname -a > system-info.txt
cat /etc/os-release >> system-info.txt

# Service status
systemctl status industrial-gateway >> system-info.txt

# Send to support with issue description
```

### Additional Resources

- **Documentation**: `/opt/industrial-gateway/README.md`
- **GitHub**: https://github.com/industrial-gateway/platform
- **Email**: support@industrial-gateway.io

---

**Production-ready Linux deployment for Industrial Automation professionals.**
