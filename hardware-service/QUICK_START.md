# Quick Start Guide

## Windows Setup (5 minutes)

### 1. Install Node.js
- Download from https://nodejs.org/ (v14+)
- Verify: `node --version`

### 2. Install Build Tools (for native modules)
```bash
npm install -g windows-build-tools
```
Or install Visual Studio Build Tools manually.

### 3. Configure Hardware Ports
1. Open Device Manager
2. Find your dispenser/encoder under "Ports (COM & LPT)"
3. Note the COM port numbers (e.g., COM3, COM4)

### 4. Setup Environment
```bash
cd kiosk-frontend/hardware-service
copy .env.example .env
```

Edit `.env` with your COM ports:
```env
CARD_DISPENSER_PORT=COM3  # Your dispenser COM port
CARD_ENCODER_PORT=COM4    # Your encoder COM port
```

### 5. Install & Start
```bash
npm install
npm start
```

Or use the batch file:
```bash
start.bat
```

### 6. Verify
Open browser: http://localhost:9000/health

Should return: `{"status":"ok","service":"hardware-service"}`

## Troubleshooting

### "Cannot find module" errors
- Run: `npm install`
- Ensure Python is installed
- Install Windows Build Tools

### "Failed to open port COM3"
- Check Device Manager for correct COM port
- Ensure hardware is connected
- Try different COM port numbers

### DLL errors
- Verify DLLs exist in `hardware/` folder
- Check Node.js architecture (32-bit vs 64-bit)
- Install Visual C++ Redistributable

## Next Steps

Once the service is running:
1. Start your React frontend: `cd .. && npm start`
2. Test lost card feature
3. Card should automatically dispense on success!

