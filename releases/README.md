# 📦 AGNOSTICO PLC Gateway - Pre-built Releases

## Download Compiled Binaries

Instead of building from source, you can download ready-to-run binaries from the **[GitHub Releases](https://github.com/YOUR_USERNAME/AGNOSTICO/releases)** page.

### Available Platforms

- **Windows x64**: `agnostico-gateway-windows-x64.zip`
- **Linux x64**: `agnostico-gateway-linux-x64.tar.gz`
- **macOS ARM64**: `agnostico-gateway-macos-arm64.tar.gz`

### How to Download

1. Go to the [Releases page](https://github.com/YOUR_USERNAME/AGNOSTICO/releases)
2. Find the latest version
3. Download the appropriate package for your operating system
4. Extract and run

### Quick Start

#### Windows
```bash
# Extract the ZIP file
# Open Command Prompt or PowerShell in the extracted folder
agnostico-gateway.exe
```

#### Linux
```bash
# Extract the tarball
tar -xzf agnostico-gateway-linux-x64.tar.gz
cd agnostico-gateway

# Make executable
chmod +x agnostico-gateway

# Run
./agnostico-gateway
```

#### macOS
```bash
# Extract the tarball
tar -xzf agnostico-gateway-macos-arm64.tar.gz
cd agnostico-gateway

# Make executable
chmod +x agnostico-gateway

# Run
./agnostico-gateway
```

### What's Included

Each release package contains:
- Standalone executable (no dependencies required)
- Embedded SQLite database
- Web UI bundled and ready to serve
- Default configuration files
- Quick start documentation

### Default Access

After running the executable:
- **Web UI**: http://localhost:3000
- **OPC UA Server**: opc.tcp://localhost:4840
- **Modbus TCP Server**: modbus://localhost:5502

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ Remember to change the default password in production!**

---

### Building from Source

If you prefer to build from source instead, check the main [README.md](../README.md) for instructions.
