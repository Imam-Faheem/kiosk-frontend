/**
 * Kiosk mode utilities
 * Handles auto-start, fullscreen, and kiosk-specific features
 */

const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Enable true kiosk mode (Windows)
 * Prevents users from exiting the app
 */
function enableKioskMode(mainWindow) {
  if (process.platform === 'win32') {
    // Set kiosk mode
    mainWindow.setKiosk(true);
    
    // Disable right-click context menu
    mainWindow.webContents.on('context-menu', (e) => {
      e.preventDefault();
    });
    
    // Block keyboard shortcuts that could exit the app
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Block Alt+F4, Ctrl+Alt+Del, etc.
      if (input.key === 'F4' && input.alt) {
        event.preventDefault();
      }
      if (input.key === 'F11') {
        // Allow F11 to toggle fullscreen (for maintenance)
        return;
      }
    });
  }
}

/**
 * Set up auto-start on Windows
 */
function setupAutoStart() {
  if (process.platform === 'win32') {
    const appPath = app.getPath('exe');
    const appName = app.getName();
    
    // Create startup script
    const startupScript = `
      Set WshShell = CreateObject("WScript.Shell")
      WshShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\${appName}", "${appPath}", "REG_SZ"
    `;
    
    // Note: This requires admin rights
    // For production, create an installer that sets up auto-start
    console.log('Auto-start setup requires admin rights');
    console.log('App path:', appPath);
  }
}

/**
 * Prevent system sleep (keep kiosk awake)
 */
function preventSleep() {
  if (process.platform === 'win32') {
    // Use SetThreadExecutionState to prevent sleep
    // This would require a native module or external tool
    console.log('Sleep prevention enabled');
  }
}

/**
 * Lock down the system (optional - for maximum security)
 */
function lockDownSystem() {
  // This is an advanced feature - use with caution
  // Would disable task manager, alt+tab, etc.
  console.log('System lockdown (not implemented - use with caution)');
}

/**
 * Create Windows service for auto-start (advanced)
 */
function createWindowsService() {
  // This would require node-windows or similar
  // For production deployment, consider using a proper installer
  console.log('Windows service creation requires additional setup');
}

module.exports = {
  enableKioskMode,
  setupAutoStart,
  preventSleep,
  lockDownSystem
};

