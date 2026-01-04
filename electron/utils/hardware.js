const { ipcMain } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

// Data directory for storing bookings and other data
const DATA_DIR = path.join(app.getPath('userData'), 'hotel-data');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

/**
 * Initialize hardware-related IPC handlers
 * @param {BrowserWindow} mainWindow - The main application window
 */
function initializeHardware(mainWindow) {
  console.log('[Hardware] Initializing hardware handlers...');

  // Save bookings to local storage
  ipcMain.handle('save-bookings', async (event, bookings) => {
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'bookings.json');
      await fs.writeFile(filePath, JSON.stringify(bookings, null, 2));
      console.log('[Hardware] Bookings saved successfully');
      return { success: true };
    } catch (error) {
      console.error('[Hardware] Error saving bookings:', error);
      return { success: false, error: error.message };
    }
  });

  // Load bookings from local storage
  ipcMain.handle('load-bookings', async () => {
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'bookings.json');
      const data = await fs.readFile(filePath, 'utf8');
      console.log('[Hardware] Bookings loaded successfully');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('[Hardware] No bookings file found, returning empty array');
        return [];
      }
      console.error('[Hardware] Error loading bookings:', error);
      throw error;
    }
  });

  // Save rooms to local storage
  ipcMain.handle('save-rooms', async (event, rooms) => {
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'rooms.json');
      await fs.writeFile(filePath, JSON.stringify(rooms, null, 2));
      console.log('[Hardware] Rooms saved successfully');
      return { success: true };
    } catch (error) {
      console.error('[Hardware] Error saving rooms:', error);
      return { success: false, error: error.message };
    }
  });

  // Load rooms from local storage
  ipcMain.handle('load-rooms', async () => {
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'rooms.json');
      const data = await fs.readFile(filePath, 'utf8');
      console.log('[Hardware] Rooms loaded successfully');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('[Hardware] No rooms file found, returning empty array');
        return [];
      }
      console.error('[Hardware] Error loading rooms:', error);
      throw error;
    }
  });

  // Card reader simulation (for future hardware integration)
  ipcMain.handle('read-card', async () => {
    console.log('[Hardware] Card reader requested (simulated)');
    // Simulate card reading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated card data
    return {
      success: true,
      cardNumber: '1234-5678-9012-3456',
      cardType: 'RFID',
      timestamp: new Date().toISOString()
    };
  });

  // Card dispenser simulation (for future hardware integration)
  ipcMain.handle('dispense-card', async (event, cardData) => {
    console.log('[Hardware] Card dispenser requested:', cardData);
    // Simulate card dispensing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      cardNumber: cardData.cardNumber || `CARD-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  });

  // Printer simulation (for future hardware integration)
  ipcMain.handle('print-receipt', async (event, receiptData) => {
    console.log('[Hardware] Printer requested:', receiptData);
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  });

  console.log('[Hardware] Hardware handlers initialized successfully');
}

module.exports = {
  initializeHardware,
  DATA_DIR
};