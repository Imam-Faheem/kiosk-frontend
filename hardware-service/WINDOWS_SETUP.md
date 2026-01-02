# Windows Kiosk Hardware Setup Guide

## Overview

This guide covers setting up the hardware service on a Windows kiosk machine with the K720 card dispenser and encoder.

## Hardware Requirements

- **K720 Card Dispenser**: Handles card movement (dispensing/ejecting)
- **M100A or M600 Encoder**: Handles RFID card encoding
- **Connection**: USB or Serial (COM ports)

## Prerequisites

1. **Node.js** (v14.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (for building native modules)
   - Required for `ffi-napi`, `ref-napi`, `ref-struct-napi`
   - Download from: https://www.python.org/downloads/
   - Add Python to PATH during installation

3. **Windows Build Tools**
   ```bash
   npm install -g windows-build-tools
   ```
   Or install Visual Studio Build Tools manually

4. **Hardware DLLs**
   - Ensure `K720_Dll.dll` is in `hardware-service/hardware/` directory
   - Ensure `M100A_DLL.dll` or `M600_DLL.dll` is in `hardware-service/hardware/` directory

## Installation Steps

### 1. Navigate to Hardware Service Directory

```bash
cd kiosk-frontend/hardware-service
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - HTTP server
- `cors` - CORS middleware
- `ffi-napi` - Foreign Function Interface for loading DLLs
- `ref-napi` - Reference types for FFI
- `ref-struct-napi` - Structure support for FFI

**Note**: If you encounter build errors:
- Ensure Python is installed and in PATH
- Ensure Windows Build Tools are installed
- Try: `npm install --build-from-source`

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` with your hardware configuration:

```env
# Service Port
HARDWARE_SERVICE_PORT=9000

# SDK Path (relative to hardware-service directory)
CARD_DISPENSER_SDK_PATH=./hardware

# Dispenser Configuration (Windows COM ports)
CARD_DISPENSER_PORT=COM3
CARD_DISPENSER_BAUD=9600
CARD_DISPENSER_MAC_ADDR=0x01

# Encoder Configuration
CARD_ENCODER_PORT=COM4
CARD_ENCODER_BAUD=9600
CARD_ENCODER_TYPE=M100A

# TTLock Card Encoding
TTLOCK_CARD_SECTOR=1
TTLOCK_CARD_BLOCK=0
TTLOCK_CARD_KEY_A=FFFFFFFFFFFF
```

### 4. Verify Hardware Connection

1. **Check COM Ports**:
   - Open Device Manager
   - Look under "Ports (COM & LPT)"
   - Note the COM port numbers for dispenser and encoder

2. **Update `.env`** with correct COM ports

3. **Test Connection**:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   ✓ Hardware Service running on http://localhost:9000
   ```

### 5. Verify Hardware DLLs

Ensure these files exist in `hardware-service/hardware/`:
- `K720_Dll.dll` (dispenser)
- `M100A_DLL.dll` or `M600_DLL.dll` (encoder)

## Running the Service

### Development Mode

```bash
npm start
```

### Production Mode (Windows Service)

1. **Install as Windows Service** using `node-windows` or `pm2`:

   **Option A: Using pm2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name hardware-service
   pm2 save
   pm2 startup
   ```

   **Option B: Using node-windows**
   ```bash
   npm install -g node-windows
   npm link node-windows
   # Follow node-windows setup instructions
   ```

2. **Auto-start on Boot**:
   - Configure the service to start automatically
   - Ensure service starts before React app

## Troubleshooting

### DLL Loading Errors

**Error**: `Cannot find module` or `DLL load failed`

**Solutions**:
1. Verify DLL files exist in `hardware-service/hardware/`
2. Check DLL architecture matches Node.js (32-bit vs 64-bit)
3. Ensure DLL dependencies are installed (Visual C++ Redistributable)
4. Try running as Administrator

### COM Port Errors

**Error**: `Failed to open dispenser port COM3`

**Solutions**:
1. Verify COM port in Device Manager
2. Check if port is already in use
3. Ensure correct baud rate (default: 9600)
4. Try different COM port numbers
5. Check USB/Serial cable connection

### Build Errors

**Error**: `gyp ERR! find Python` or build failures

**Solutions**:
1. Install Python 3.x and add to PATH
2. Install Windows Build Tools: `npm install -g windows-build-tools`
3. Or install Visual Studio Build Tools manually
4. Try: `npm install --build-from-source`

### Service Not Starting

**Error**: Port 9000 already in use

**Solutions**:
1. Change port in `.env`: `HARDWARE_SERVICE_PORT=9001`
2. Update frontend config: `REACT_APP_HARDWARE_SERVICE_URL=http://localhost:9001`
3. Kill process using port: `netstat -ano | findstr :9000`

## Testing

### Health Check

```bash
curl http://localhost:9000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "hardware-service"
}
```

### Issue Card Test

```bash
curl -X POST http://localhost:9000/api/card/issue \
  -H "Content-Type: application/json" \
  -d "{\"lockData\": \"your_hex_string_here\"}"
```

## Integration with Frontend

The React frontend automatically calls this service when:
1. Lost card API returns `success: true`
2. Response contains `ekey.encrypt_payload`
3. Hardware service is running on `http://localhost:9000`

## Security Notes

- The hardware service runs locally on the kiosk machine
- It should NOT be exposed to the internet
- Use firewall rules to restrict access to localhost only
- Consider adding authentication for production use

## Support

For hardware-specific issues:
- Check K720 SDK documentation
- Verify hardware connections
- Test with manufacturer's test software
- Check Windows Event Viewer for system errors

