#!/bin/bash
set -e

# Industrial Gateway Platform - Red Hat/CentOS Installer
# Compatible with: RHEL 8+, CentOS 8+, Rocky Linux 8+, AlmaLinux 8+

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🏭 INDUSTRIAL GATEWAY PLATFORM                          ║"
echo "║   Red Hat/CentOS Installer                                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  Please run as root (sudo ./install-redhat.sh)"
  exit 1
fi

echo "📦 Installing system dependencies..."

# Install EPEL repository (for additional packages)
if ! rpm -q epel-release &> /dev/null; then
  dnf install -y epel-release
fi

# Install Node.js 20
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
fi

# Install build tools
dnf groupinstall -y "Development Tools"
dnf install -y python3 git

echo "✓ Node.js $(node --version) installed"
echo "✓ npm $(npm --version) installed"

# Create installation directory
INSTALL_DIR="/opt/industrial-gateway"
echo ""
echo "📁 Installing to: $INSTALL_DIR"

mkdir -p $INSTALL_DIR
cp -r . $INSTALL_DIR/
cd $INSTALL_DIR

# Install dependencies
echo ""
echo "📦 Installing application dependencies..."
npm install --production

cd packages/backend
npm install --production
npx prisma generate
cd ../..

cd packages/cli
npm install --production
npm run build
cd ../..

# Create symlink for CLI
echo ""
echo "🔗 Creating CLI symlink..."
ln -sf $INSTALL_DIR/packages/cli/dist/index.js /usr/local/bin/igp
chmod +x /usr/local/bin/igp

# Create user
echo ""
echo "👤 Creating system user..."
if ! id -u industrial &>/dev/null; then
  useradd -r -s /sbin/nologin -d $INSTALL_DIR industrial
fi

# Set permissions
chown -R industrial:industrial $INSTALL_DIR

# Create data directory
mkdir -p /var/lib/industrial-gateway
chown industrial:industrial /var/lib/industrial-gateway

# Copy environment file
cp $INSTALL_DIR/packages/backend/.env.example /etc/industrial-gateway.env
sed -i 's|file:./dev.db|file:/var/lib/industrial-gateway/production.db|' /etc/industrial-gateway.env

echo ""
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/change-this-in-production-use-secure-random-string/$JWT_SECRET/" /etc/industrial-gateway.env

# Initialize database
echo ""
echo "💾 Initializing database..."
export DATABASE_URL="file:/var/lib/industrial-gateway/production.db"
cd $INSTALL_DIR/packages/backend
npx prisma db push
npx tsx src/database/seed.ts
chown industrial:industrial /var/lib/industrial-gateway/production.db
cd ../..

# Configure SELinux (if enabled)
if command -v getenforce &> /dev/null && [ "$(getenforce)" != "Disabled" ]; then
  echo ""
  echo "🔒 Configuring SELinux..."
  semanage fcontext -a -t bin_t "$INSTALL_DIR/packages/backend/dist/index.js" || true
  restorecon -v "$INSTALL_DIR/packages/backend/dist/index.js" || true
fi

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
if systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-port=3000/tcp || true
  firewall-cmd --permanent --add-port=4840/tcp || true
  firewall-cmd --permanent --add-port=502/tcp || true
  firewall-cmd --reload || true
  echo "✓ Firewall rules added (ports 3000, 4840, 502)"
fi

# Install systemd service
echo ""
echo "⚙️  Installing systemd service..."
cat > /etc/systemd/system/industrial-gateway.service <<EOF
[Unit]
Description=Industrial Gateway Platform
After=network.target

[Service]
Type=simple
User=industrial
Group=industrial
WorkingDirectory=$INSTALL_DIR/packages/backend
EnvironmentFile=/etc/industrial-gateway.env
ExecStart=/usr/bin/node $INSTALL_DIR/packages/backend/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=industrial-gateway

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable industrial-gateway
systemctl start industrial-gateway

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ INSTALLATION COMPLETE                                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Quick Start:"
echo ""
echo "   Check status:    systemctl status industrial-gateway"
echo "   View logs:       journalctl -u industrial-gateway -f"
echo "   CLI tool:        igp --help"
echo "   Terminal UI:     igp tui"
echo ""
echo "🌐 Access:"
echo ""
echo "   API:             http://localhost:3000"
echo "   OPC UA:          opc.tcp://localhost:4840"
echo "   Modbus TCP:      localhost:502"
echo ""
echo "🔐 Default Credentials:"
echo ""
echo "   Username:        admin"
echo "   Password:        admin123"
echo ""
echo "📚 Documentation: /opt/industrial-gateway/README.md"
echo ""
