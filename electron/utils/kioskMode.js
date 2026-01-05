const { globalShortcut } = require('electron');

/**
 * Enable kiosk mode features to prevent users from exiting
 * @param {BrowserWindow} mainWindow - The main application window
 */
function enableKioskMode(mainWindow) {
  console.log('[Kiosk Mode] Enabling kiosk mode features...');

  // Disable keyboard shortcuts that could exit the app
  const shortcutsToDisable = [
    'Alt+F4',       // Windows close window
    'Alt+Tab',      // Windows task switcher
    'CommandOrControl+Q', // Quit application
    'CommandOrControl+W', // Close window
    'CommandOrControl+R', // Reload
    'CommandOrControl+Shift+R', // Hard reload
    'F11',          // Toggle fullscreen
    'F5',           // Refresh
    'CommandOrControl+F5', // Hard refresh
    'Escape',       // Exit fullscreen
    'CommandOrControl+M', // Minimize
    'CommandOrControl+H', // Hide (macOS)
  ];

  shortcutsToDisable.forEach(shortcut => {
    try {
      globalShortcut.register(shortcut, () => {
        console.log(`[Kiosk Mode] Blocked shortcut: ${shortcut}`);
        // Do nothing - effectively disabling the shortcut
      });
    } catch (error) {
      console.warn(`[Kiosk Mode] Could not register shortcut ${shortcut}:`, error.message);
    }
  });

  // Enable special admin shortcut to exit kiosk mode (Ctrl+Shift+Alt+X)
  try {
    globalShortcut.register('CommandOrControl+Shift+Alt+X', () => {
      console.log('[Kiosk Mode] Admin exit shortcut pressed');
      
      // Show confirmation dialog
      const { dialog } = require('electron');
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Cancel', 'Exit Kiosk Mode'],
        defaultId: 0,
        title: 'Exit Kiosk Mode',
        message: 'Are you sure you want to exit kiosk mode?',
        detail: 'This will close the application. Admin access required.'
      }).then(result => {
        if (result.response === 1) {
          console.log('[Kiosk Mode] Exiting kiosk mode...');
          mainWindow.close();
        }
      });
    });
  } catch (error) {
    console.error('[Kiosk Mode] Could not register admin exit shortcut:', error);
  }

  // Prevent right-click context menu
  mainWindow.webContents.on('context-menu', (event, params) => {
    event.preventDefault();
    console.log('[Kiosk Mode] Context menu blocked');
  });

  // Prevent DevTools from being opened
  mainWindow.webContents.on('devtools-opened', () => {
    console.log('[Kiosk Mode] DevTools blocked');
    mainWindow.webContents.closeDevTools();
  });

  // Disable zoom
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Block Ctrl/Cmd + Plus/Minus/0 (zoom shortcuts)
    if ((input.control || input.meta) && 
        (input.key === '+' || input.key === '-' || input.key === '=' || input.key === '0')) {
      event.preventDefault();
      console.log('[Kiosk Mode] Zoom shortcut blocked');
    }
  });

  // Set zoom level to 100% and lock it
  mainWindow.webContents.setZoomLevel(0);
  mainWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
    console.log('[Kiosk Mode] Zoom change blocked');
    mainWindow.webContents.setZoomLevel(0);
  });

  console.log('[Kiosk Mode] Kiosk mode features enabled successfully');
  console.log('[Kiosk Mode] Admin exit shortcut: Ctrl+Shift+Alt+X');
}

/**
 * Disable kiosk mode features (cleanup)
 */
function disableKioskMode() {
  console.log('[Kiosk Mode] Disabling kiosk mode features...');
  globalShortcut.unregisterAll();
  console.log('[Kiosk Mode] Kiosk mode features disabled');
}

module.exports = {
  enableKioskMode,
  disableKioskMode
};