import { app, BrowserWindow, Menu, Tray, nativeImage, shell, Event, dialog } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';

const store = new Store();

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let tray: Tray | null = null;

const BACKEND_PORT = 3000;
const isDev = process.env.NODE_ENV === 'development';

// Setup logging to file
const LOG_FILE = path.join(app.getPath('userData'), 'app.log');
const logToFile = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
};

// Clear old log on startup
try {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
} catch (e) {
  // Ignore
}

// Paths
const getResourcePath = (relativePath: string): string => {
  if (isDev) {
    return path.join(__dirname, '../../..', relativePath);
  }
  return path.join(process.resourcesPath, relativePath);
};

const BACKEND_PATH = isDev
  ? path.join(__dirname, '../../backend/dist/index.js')
  : path.join(process.resourcesPath, 'app/backend/dist/index.js');

const FRONTEND_PATH = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(process.resourcesPath, 'app/frontend/index.html')}`;

// Kill any process using the backend port
async function killProcessOnPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    logToFile(`[Desktop] Checking for processes on port ${port}...`);

    // Windows command to find process using the port
    const findCommand = `netstat -ano | findstr :${port}`;

    const { exec } = require('child_process');

    exec(findCommand, (error: any, stdout: string, stderr: string) => {
      if (error || !stdout) {
        logToFile(`[Desktop] No process found on port ${port}`);
        resolve();
        return;
      }

      // Parse the output to get PIDs
      const lines = stdout.split('\n');
      const pids = new Set<string>();

      for (const line of lines) {
        const match = line.trim().match(/LISTENING\s+(\d+)/);
        if (match) {
          pids.add(match[1]);
        }
      }

      if (pids.size === 0) {
        logToFile(`[Desktop] No listening process found on port ${port}`);
        resolve();
        return;
      }

      logToFile(`[Desktop] Found ${pids.size} process(es) on port ${port}: ${Array.from(pids).join(', ')}`);

      // Kill each process
      let killed = 0;
      pids.forEach((pid) => {
        exec(`taskkill /F /PID ${pid}`, (killError: any) => {
          if (!killError) {
            logToFile(`[Desktop] Killed process ${pid}`);
          } else {
            logToFile(`[Desktop] Failed to kill process ${pid}: ${killError.message}`);
          }
          killed++;
          if (killed === pids.size) {
            // Wait a bit for the port to be released
            setTimeout(() => {
              logToFile(`[Desktop] Port ${port} cleanup completed`);
              resolve();
            }, 1000);
          }
        });
      });
    });
  });
}

// Create splash screen
function createSplashScreen(): BrowserWindow {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Create HTML content for splash screen
  const splashHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #0a0e14 0%, #1a1e24 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #00d9ff;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(10, 14, 20, 0.95);
            border: 2px solid #00d9ff;
            box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
          }
          .subtitle {
            font-size: 12px;
            color: #6c7a89;
            margin-bottom: 30px;
          }
          .loader {
            width: 100%;
            height: 4px;
            background: #1a1e24;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 15px;
          }
          .loader-bar {
            height: 100%;
            background: linear-gradient(90deg, #00d9ff, #00ffaa);
            animation: loading 2s ease-in-out infinite;
            box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
          }
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
          .status {
            font-size: 11px;
            color: #6c7a89;
          }
          .spinner {
            display: inline-block;
            margin-left: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">INDUSTRIAL GATEWAY</div>
          <div class="subtitle">Platform v1.0.0</div>
          <div class="loader">
            <div class="loader-bar"></div>
          </div>
          <div class="status">
            <span id="status-text">Starting backend server</span>
            <span class="spinner">●●●</span>
          </div>
        </div>
      </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);

  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  return splashWindow;
}

// Check if backend is ready
async function waitForBackend(maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  logToFile(`[Desktop] Waiting for backend to be ready (will try ${maxAttempts} times)...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check if backend process is still alive
    if (!backendProcess || backendProcess.killed) {
      logToFile(`[Desktop ERROR] Backend process died! Cannot continue.`);
      return false;
    }

    try {
      // Try to fetch health endpoint
      const http = require('http');

      const isReady = await new Promise<boolean>((resolve) => {
        const req = http.get(`http://localhost:${BACKEND_PORT}/health`, (res: any) => {
          logToFile(`[Desktop] Health check returned status: ${res.statusCode}`);
          resolve(res.statusCode === 200);
        });

        req.on('error', (err: any) => {
          if (attempt % 5 === 0) { // Log every 5 attempts to avoid spam
            logToFile(`[Desktop] Health check error: ${err.code || err.message}`);
          }
          resolve(false);
        });

        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
      });

      if (isReady) {
        logToFile(`[Desktop] ✅ Backend is ready! (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      // Ignore and retry
    }

    if (attempt % 5 === 0) { // Log every 5 attempts
      logToFile(`[Desktop] Backend not ready yet (attempt ${attempt}/${maxAttempts}), waiting...`);
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  logToFile(`[Desktop ERROR] Backend failed to start after ${maxAttempts} attempts (${maxAttempts} seconds)`);
  return false;
}

// Start backend server
function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    logToFile('[Desktop] Starting backend server...');
    logToFile(`[Desktop] Backend path: ${BACKEND_PATH}`);
    logToFile(`[Desktop] Resources path: ${process.resourcesPath}`);
    logToFile(`[Desktop] User data path: ${app.getPath('userData')}`);

    // Check if backend file exists
    if (!fs.existsSync(BACKEND_PATH)) {
      const error = `Backend file not found at: ${BACKEND_PATH}`;
      logToFile(`[Desktop ERROR] ${error}`);
      reject(new Error(error));
      return;
    }

    const dbPath = path.join(app.getPath('userData'), 'production.db');
    const backendNodeModules = path.join(process.resourcesPath, 'app/backend/node_modules');
    const backendDir = path.join(process.resourcesPath, 'app/backend');

    // Set NODE_PATH to include backend node_modules
    const nodePath = [
      backendNodeModules,
      path.join(backendNodeModules, '.prisma'),
      path.join(backendNodeModules, '@prisma'),
    ].join(path.delimiter);

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      IS_ELECTRON: 'true',
      RESOURCES_PATH: path.join(process.resourcesPath, 'app'),
      PORT: BACKEND_PORT.toString(),
      DATABASE_URL: `file:${dbPath}`,
      JWT_SECRET: store.get('jwtSecret', 'change-this-secret-in-production') as string,
      // Node module resolution
      NODE_PATH: nodePath,
      // Prisma environment variables
      PRISMA_QUERY_ENGINE_LIBRARY: path.join(backendNodeModules, '.prisma/client/query_engine-windows.dll.node'),
      PRISMA_CLI_BINARY_TARGETS: 'windows',
    };

    logToFile(`[Desktop] Database URL: ${env.DATABASE_URL}`);
    logToFile(`[Desktop] NODE_PATH: ${nodePath}`);
    logToFile(`[Desktop] Backend node_modules path: ${backendNodeModules}`);
    logToFile(`[Desktop] Spawning Node.js process...`);
    logToFile(`[Desktop] Command: node ${BACKEND_PATH}`);

    // Change working directory to backend folder so require() works correctly
    backendProcess = spawn('node', [BACKEND_PATH], {
      env,
      cwd: backendDir,
      stdio: 'pipe',
      windowsHide: true,
    });

    let backendOutput = '';
    let backendErrors = '';

    backendProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      backendOutput += output;
      logToFile(`[Backend STDOUT] ${output.trim()}`);
    });

    backendProcess.stderr?.on('data', (data) => {
      const error = data.toString();
      backendErrors += error;
      logToFile(`[Backend STDERR] ${error.trim()}`);
    });

    backendProcess.on('error', (error) => {
      logToFile(`[Backend] Failed to spawn process: ${error.message}`);
      logToFile(`[Backend] Error code: ${(error as any).code}`);
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      logToFile(`[Backend] Process exited with code ${code} and signal ${signal}`);
      if (code !== 0 && code !== null) {
        logToFile(`[Backend] Last output: ${backendOutput.slice(-500)}`);
        logToFile(`[Backend] Last errors: ${backendErrors.slice(-500)}`);
      }
      backendProcess = null;
    });

    // Resolve immediately after starting the process
    // We'll use waitForBackend() to check if it's actually ready
    logToFile('[Desktop] Backend process started');
    resolve();
  });
}

// Stop backend server
function stopBackend(): void {
  if (backendProcess) {
    logToFile('[Desktop] Stopping backend server...');
    try {
      // Try graceful shutdown first
      backendProcess.kill('SIGTERM');

      // Force kill after 2 seconds if still running
      setTimeout(() => {
        if (backendProcess) {
          logToFile('[Desktop] Force killing backend process...');
          backendProcess.kill('SIGKILL');
          backendProcess = null;
        }
      }, 2000);
    } catch (error: any) {
      logToFile(`[Desktop] Error stopping backend: ${error.message}`);
      backendProcess = null;
    }
  }
}

// Create main window
async function createWindow(): Promise<void> {
  try {
    logToFile('[Desktop] Creating main window...');

    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      backgroundColor: '#0a0e14',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
      },
      show: false,
      autoHideMenuBar: true,
    });

    // Handle load errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logToFile(`[Desktop] Failed to load: ${errorCode} - ${errorDescription}`);
    });

    // Load frontend
    if (isDev) {
      logToFile(`[Desktop] Loading dev frontend: ${FRONTEND_PATH}`);
      await mainWindow.loadURL(FRONTEND_PATH);
      mainWindow.webContents.openDevTools();
    } else {
      const frontendURL = `http://localhost:${BACKEND_PORT}`;
      logToFile(`[Desktop] Loading production frontend: ${frontendURL}`);

      try {
        await mainWindow.loadURL(frontendURL);
        logToFile('[Desktop] Frontend loaded successfully');
      } catch (loadError: any) {
        logToFile(`[Desktop ERROR] Failed to load frontend: ${loadError.message}`);

        // Show error dialog
        dialog.showErrorBox(
          'Failed to Start',
          `Cannot connect to backend server.\n\nPlease check the log file at:\n${LOG_FILE}`
        );
        throw loadError;
      }
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      logToFile('[Desktop] Window ready to show');
      mainWindow?.show();
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Minimize to tray
    mainWindow.on('minimize', (event: Event) => {
      if (store.get('minimizeToTray', true)) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    // Create system tray
    createTray();
  } catch (error: any) {
    logToFile(`[Desktop ERROR] Failed to create window: ${error.message}`);
    throw error;
  }
}

// Create system tray
function createTray(): void {
  const iconPath = path.join(__dirname, '../build/icon.png');

  let trayIcon: Electron.NativeImage;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // Fallback to a simple icon if file doesn't exist
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Industrial Gateway',
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: 'Open in Browser',
      click: () => {
        shell.openExternal(`http://localhost:${BACKEND_PORT}`);
      },
    },
    { type: 'separator' },
    {
      label: 'Backend Status',
      enabled: false,
    },
    {
      label: backendProcess ? '● Running' : '○ Stopped',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Restart Backend',
      click: async () => {
        stopBackend();
        await startBackend();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Industrial Gateway Platform');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow?.show();
  });
}

// App ready
app.whenReady().then(async () => {
  logToFile('[Desktop] App ready, initializing...');
  logToFile(`[Desktop] User data path: ${app.getPath('userData')}`);
  logToFile(`[Desktop] App path: ${app.getAppPath()}`);
  logToFile(`[Desktop] Exe path: ${app.getPath('exe')}`);
  logToFile(`[Desktop] isDev: ${isDev}`);

  try {
    // Show splash screen
    createSplashScreen();
    logToFile('[Desktop] Splash screen created');

    // Kill any existing backend process on the port
    await killProcessOnPort(BACKEND_PORT);

    // Start backend process
    await startBackend();

    // Wait for backend to be ready
    const backendReady = await waitForBackend();

    if (!backendReady) {
      const errorMsg = backendProcess && !backendProcess.killed
        ? 'Backend process is running but not responding. There may be an error during initialization.'
        : 'Backend process failed to start or crashed during initialization.';

      throw new Error(`${errorMsg}\n\nPlease check the log file for details:\n${LOG_FILE}\n\nCommon issues:\n- Port 3000 may be in use by another application\n- Missing dependencies (Node.js, Prisma)\n- Database initialization errors`);
    }

    // Create main window
    await createWindow();

    // Close splash screen
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }

    logToFile('[Desktop] Application initialized successfully');
  } catch (error: any) {
    logToFile(`[Desktop ERROR] Failed to initialize: ${error.message}`);
    logToFile(`[Desktop ERROR] Stack: ${error.stack}`);

    // Close splash if still open
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }

    // Show error dialog with option to open log
    const response = dialog.showMessageBoxSync({
      type: 'error',
      title: 'Application Failed to Start',
      message: 'The Industrial Gateway Platform failed to initialize.',
      detail: `${error.message}\n\nLog file location:\n${LOG_FILE}`,
      buttons: ['Open Log Folder', 'Exit'],
      defaultId: 0,
      cancelId: 1,
    });

    // If user clicks "Open Log Folder"
    if (response === 0) {
      const logDir = path.dirname(LOG_FILE);
      shell.openPath(logDir);
    }

    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

// Reactivate on macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  logToFile('[Desktop] Application quitting, cleaning up...');
  stopBackend();
});

app.on('will-quit', () => {
  logToFile('[Desktop] Application will quit');
  stopBackend();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logToFile(`[Desktop] Uncaught exception: ${error.message}`);
  logToFile(`[Desktop] Stack: ${error.stack}`);
});

process.on('unhandledRejection', (reason: any) => {
  logToFile(`[Desktop] Unhandled rejection: ${reason?.message || reason}`);
  if (reason?.stack) {
    logToFile(`[Desktop] Stack: ${reason.stack}`);
  }
});
