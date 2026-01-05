# Electron Directory

This directory contains all Electron-specific files for the desktop application.

## Structure

```
electron/
├── main.js      # Main Electron process (entry point)
├── preload.js   # Preload script for secure context bridge
└── README.md    # This file
```

## Files

### main.js
The main Electron process file. This is the entry point for the Electron application. It:
- Creates and manages the browser window
- Handles app lifecycle events
- Manages security settings
- Loads the React app (dev server or built files)

### preload.js
The preload script that runs in the renderer process before the web page loads. It:
- Provides a secure bridge between the main process and renderer
- Exposes safe APIs to the React app via `contextBridge`
- Maintains security by isolating contexts

## Usage

The Electron app is started via npm scripts:
- `npm run electron-dev` - Development mode with hot-reload
- `npm run electron` - Run Electron (after building React app)
- `npm run dist` - Build and package the Electron app

## Security

All Electron files follow security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Remote module disabled
- Navigation protection enabled
- Window creation blocked

