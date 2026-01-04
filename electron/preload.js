const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script - exposes safe APIs to the renderer process
 * This runs in an isolated context before the web page loads
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Bookings API
  saveBookings: (bookings) => ipcRenderer.invoke('save-bookings', bookings),
  loadBookings: () => ipcRenderer.invoke('load-bookings'),
  
  // Rooms API
  saveRooms: (rooms) => ipcRenderer.invoke('save-rooms', rooms),
  loadRooms: () => ipcRenderer.invoke('load-rooms'),
  
  // Hardware APIs (for future integration)
  readCard: () => ipcRenderer.invoke('read-card'),
  dispenseCard: (cardData) => ipcRenderer.invoke('dispense-card', cardData),
  printReceipt: (receiptData) => ipcRenderer.invoke('print-receipt', receiptData),
  
  // System info
  platform: process.platform,
  version: process.versions.electron,
});

console.log('[Preload] Electron APIs exposed to renderer process');