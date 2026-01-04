const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Import utilities
const { initializeHardware } = require('./utils/hardware');
const { enableKioskMode } = require('./utils/kioskMode');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Get primary display dimensions for kiosk mode
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: !isDev, // Fullscreen in production, windowed in dev
    kiosk: !isDev, // True kiosk mode in production
    frame: isDev, // Show frame in dev for easier debugging
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload is now in electron/ folder
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      enableRemoteModule: false, // Security: disable remote module
      webSecurity: true,
    },
    icon: path.join(__dirname, '..', 'public', 'logo.jpg'), // App icon
    show: false, // Don't show until ready
    backgroundColor: '#F9F1E9', // Match your app background
    autoHideMenuBar: true, // Hide menu bar
  });

  // Load the app
  if (isDev) {
    // Development: load from React dev server
    mainWindow.loadURL('http://localhost:3002');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Enable kiosk mode features in production
    if (!isDev) {
      enableKioskMode(mainWindow);
    }
  });
  
  // Initialize hardware handlers
  initializeHardware(mainWindow);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (isDev) {
      // In development, allow localhost
      if (parsedUrl.origin !== 'http://localhost:3002') {
        event.preventDefault();
      }
    } else {
      // In production, prevent all navigation
      if (parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    }
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
// In kiosk mode, prevent quitting unless explicitly requested
app.on('window-all-closed', () => {
  // In production/kiosk mode, don't quit - restart the window
  if (!isDev && process.platform !== 'darwin') {
    // Recreate window instead of quitting
    setTimeout(() => {
      createWindow();
    }, 1000);
  } else if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Handle certificate errors (optional - for development with self-signed certs)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});
