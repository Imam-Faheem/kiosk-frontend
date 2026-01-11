# Electron Utilities

This directory is for Electron-specific utility functions and helpers.

## Potential Files

- `windowManager.js` - Window management utilities
- `menuBuilder.js` - Application menu builder
- `ipcHandlers.js` - IPC message handlers
- `security.js` - Security-related utilities

## Usage

Import utilities in `electron/main.js`:

```javascript
const { createWindow } = require('./utils/windowManager');
```

