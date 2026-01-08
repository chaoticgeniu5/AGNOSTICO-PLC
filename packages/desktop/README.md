# Industrial Gateway Platform - Desktop Application

Windows desktop application built with Electron that packages both backend and frontend into a standalone executable.

## Features

- ✅ **Standalone Application** - No browser required
- ✅ **Self-contained Backend** - Embedded Node.js server
- ✅ **System Tray Integration** - Minimize to tray
- ✅ **Auto-start Backend** - Backend starts automatically
- ✅ **Native Look & Feel** - Windows native application
- ✅ **Portable Mode** - No installation required option
- ✅ **Offline Capable** - Works without internet

## System Requirements

### Minimum
- Windows 10 64-bit or later
- 4GB RAM
- 500MB disk space
- No additional software required (Node.js embedded)

### Recommended
- Windows 11 64-bit
- 8GB RAM
- 1GB disk space

## Installation

### Option 1: Installer (Recommended)

1. Download `Industrial-Gateway-Platform-1.0.0-Setup.exe`
2. Run the installer
3. Follow installation wizard
4. Launch from Start Menu or Desktop shortcut

### Option 2: Portable

1. Download `Industrial-Gateway-Platform-1.0.0-Portable.exe`
2. Run directly - no installation needed
3. Data stored in app directory

## Usage

### First Launch

1. Application starts automatically
2. Backend server initializes (takes 3-5 seconds)
3. Main window opens with dashboard
4. Default login: `admin` / `admin123`

### System Tray

- Click tray icon to show/hide window
- Right-click for menu:
  - Show Industrial Gateway
  - Open in Browser
  - Backend Status
  - Restart Backend
  - Quit

### Data Location

**Installer Mode:**
- User data: `%APPDATA%/Industrial Gateway Platform`
- Database: `%APPDATA%/Industrial Gateway Platform/production.db`
- Logs: `%APPDATA%/Industrial Gateway Platform/logs`

**Portable Mode:**
- User data: `<app-directory>/data`
- Database: `<app-directory>/data/production.db`
- Logs: `<app-directory>/data/logs`

## Development

### Prerequisites

```bash
# Install dependencies
npm install
```

### Build Frontend First

```bash
cd ../frontend
npm run build
```

This creates `packages/frontend/dist` which will be embedded in the app.

### Run in Development Mode

```bash
# Terminal 1: Start backend
cd ../backend
npm run dev

# Terminal 2: Start frontend
cd ../frontend
npm run dev

# Terminal 3: Start Electron
cd ../desktop
npm run dev
```

### Build Production Executable

**Build for Windows:**

```bash
# Build TypeScript
npm run build

# Create installer + portable
npm run build:win
```

Output in `packages/desktop/release/`:
- `Industrial Gateway Platform-1.0.0-Setup.exe` - Installer (NSIS)
- `Industrial Gateway Platform-1.0.0-Portable.exe` - Portable version

**Portable Only:**

```bash
npm run build:win:portable
```

## Build Process Explained

### 1. TypeScript Compilation

```bash
tsc
```

Compiles `src/*.ts` → `dist/*.js`

### 2. Electron Builder

```bash
electron-builder --win
```

Packages:
- Electron runtime
- Desktop app code (`dist/`)
- Backend server (`../backend/dist/`)
- Backend dependencies (`../backend/node_modules/`)
- Frontend build (`../frontend/dist/`)
- Prisma schema (`../backend/prisma/`)

### 3. Output

- **NSIS Installer** - Full installation wizard
- **Portable** - Single executable, no install

## Architecture

```
Industrial Gateway Platform.exe
│
├── Electron Shell (main process)
│   ├── Creates BrowserWindow
│   ├── Spawns Node.js backend
│   └── Manages system tray
│
├── Backend Server (child process)
│   ├── Fastify API (port 3000)
│   ├── Socket.IO real-time
│   ├── PLC Simulators
│   ├── PLC Emulators
│   └── SQLite Database
│
└── Frontend (renderer process)
    ├── React UI
    ├── Loaded from http://localhost:3000
    └── WebSocket connection to backend
```

## Troubleshooting

### Application won't start

- Check Windows Event Viewer for errors
- Run from command line to see logs:
  ```cmd
  "C:\Program Files\Industrial Gateway Platform\Industrial Gateway Platform.exe"
  ```

### Backend fails to start

- Check port 3000 is not in use:
  ```cmd
  netstat -ano | findstr :3000
  ```
- Delete database and restart:
  ```cmd
  del "%APPDATA%\Industrial Gateway Platform\production.db"
  ```

### Window is blank

- Clear Electron cache:
  ```cmd
  rd /s /q "%APPDATA%\Industrial Gateway Platform\Cache"
  ```
- Restart application

### Build fails

- Ensure frontend is built:
  ```bash
  cd ../frontend && npm run build
  ```
- Ensure backend is built:
  ```bash
  cd ../backend && npm run build
  ```
- Clean and rebuild:
  ```bash
  rd /s /q dist release
  npm run build
  ```

## Code Signing (Optional)

For production releases, sign the executable:

```bash
# Set environment variables
set CSC_LINK=path\to\certificate.pfx
set CSC_KEY_PASSWORD=your-password

# Build with signing
npm run build:win
```

## Auto-Update (Future)

Configuration for auto-update is included but not yet implemented:

```json
"publish": {
  "provider": "github",
  "owner": "industrial-gateway",
  "repo": "platform"
}
```

## Distribution

### Recommended Distribution Methods

1. **Direct Download** - Host .exe on website
2. **GitHub Releases** - Attach to GitHub releases
3. **Internal Network** - Share via network drive
4. **Chocolatey** - Create Chocolatey package
5. **Microsoft Store** - Submit to Windows Store

### File Sizes

- Installer: ~150-200 MB
- Portable: ~200-250 MB
- Installed size: ~300-400 MB

## License

Commercial - See LICENSE.txt

## Support

- Email: support@industrial-gateway.io
- Documentation: See main README.md
- Issues: GitHub Issues

---

**Industrial Gateway Platform - Desktop Edition**

*Native Windows application for industrial automation professionals.*
