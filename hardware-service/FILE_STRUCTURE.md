# Hardware Service File Structure

All necessary files for the dispenser are now inside `kiosk-frontend/hardware-service/`

## Directory Structure

```
kiosk-frontend/
├── hardware-service/              # Hardware service (runs on kiosk machine)
│   ├── server.js                  # HTTP API server
│   ├── package.json               # Node.js dependencies
│   ├── .env.example               # Configuration template
│   ├── .gitignore                 # Git ignore rules
│   ├── start.bat                  # Windows startup script
│   ├── start.sh                   # Linux/Mac startup script
│   │
│   ├── hardware/                  # Hardware DLLs (Windows)
│   │   ├── K720_Dll.dll           # Dispenser DLL
│   │   ├── M100A_DLL.dll          # Encoder DLL (M100A)
│   │   ├── M600_DLL.dll           # Encoder DLL (M600)
│   │   ├── K720_Dll.h             # Header file (reference)
│   │   ├── K720_Dll.lib           # Library file (reference)
│   │   └── README.md              # Hardware documentation
│   │
│   ├── src/
│   │   ├── services/
│   │   │   ├── card.service.js           # Main card issuance logic
│   │   │   ├── k720-sdk-wrapper.js       # SDK wrapper (loads DLLs)
│   │   │   ├── card-dispenser.service.js # Dispenser operations
│   │   │   └── card-encoder.service.js   # Encoder operations
│   │   └── utils/
│   │       └── logger.js                  # Logging utility
│   │
│   └── Documentation/
│       ├── README.md              # Main documentation
│       ├── WINDOWS_SETUP.md       # Windows setup guide
│       ├── QUICK_START.md         # Quick start guide
│       └── CHECKLIST.md           # Setup checklist
│
└── src/
    └── services/
        └── hardware/
            └── hardwareService.js # Frontend client for hardware service
```

## Key Files

### Core Service Files
- **`server.js`** - Express HTTP server, exposes `/health` and `/api/card/issue` endpoints
- **`package.json`** - Defines dependencies: express, cors, ffi-napi, ref-napi, ref-struct-napi

### Hardware Control Files
- **`src/services/card.service.js`** - Orchestrates card issuance flow
- **`src/services/k720-sdk-wrapper.js`** - Loads and wraps native DLLs
- **`src/services/card-dispenser.service.js`** - Handles card movement (dispense/eject)
- **`src/services/card-encoder.service.js`** - Handles RFID encoding

### Hardware DLLs
- **`hardware/K720_Dll.dll`** - Windows DLL for dispenser (card movement)
- **`hardware/M100A_DLL.dll`** - Windows DLL for encoder (M100A model)
- **`hardware/M600_DLL.dll`** - Windows DLL for encoder (M600 model)

### Configuration
- **`.env.example`** - Template with all configuration options
- **`.env`** - Your actual configuration (create from .env.example)

### Startup Scripts
- **`start.bat`** - Windows batch file to start service
- **`start.sh`** - Linux/Mac shell script to start service

## Frontend Integration

The frontend client is located at:
- **`src/services/hardware/hardwareService.js`** - Calls hardware service API

Integration point:
- **`src/services/lostCardService.js`** - Calls hardware service after successful API response

## How It Works

1. **Hardware Service** (`hardware-service/`) runs on kiosk machine
   - Loads DLLs via `ffi-napi`
   - Opens COM ports (Windows) or USB devices (Linux)
   - Exposes HTTP API on port 9000

2. **Frontend** calls hardware service
   - After backend API returns lock data
   - Sends `encrypt_payload` to hardware service
   - Hardware service controls dispenser/encoder
   - Returns card issuance result

3. **Complete Flow**:
   ```
   User → Frontend → Backend API → Lock Data
                                    ↓
   Frontend → Hardware Service → Dispenser/Encoder → Card Issued
   ```

## All Files Present ✅

All necessary files for the dispenser to work are now inside `kiosk-frontend/hardware-service/`:

✅ Server and API files
✅ Hardware control services
✅ SDK wrapper for DLL loading
✅ Hardware DLLs (Windows)
✅ Configuration files
✅ Documentation
✅ Startup scripts
✅ Frontend integration client

## Next Steps

1. Configure `.env` file with your COM ports
2. Install dependencies: `npm install`
3. Start service: `npm start` or `start.bat`
4. Test: Use lost card feature in frontend

