const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Platform information
  platform: process.platform,
  versions: process.versions,
  
  // Hardware interaction APIs
  hardware: {
    // Read card from card reader
    readCard: () => ipcRenderer.invoke('hardware:readCard'),
    
    // Print document/receipt
    print: (data) => ipcRenderer.invoke('hardware:print', data),
    
    // Detect connected hardware devices
    detectDevices: () => ipcRenderer.invoke('hardware:detectDevices'),
    
    // Get system information
    getSystemInfo: () => ipcRenderer.invoke('hardware:getSystemInfo'),
  },
  
  // App information
  app: {
    isPackaged: process.env.NODE_ENV !== 'development',
    version: process.env.npm_package_version || '1.0.0',
  },
});

