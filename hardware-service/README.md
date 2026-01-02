# Kiosk Hardware Service

Local Node.js service for controlling card dispenser and encoder hardware on the kiosk machine.

## Overview

This service runs locally on the kiosk machine and provides an HTTP API for the React frontend to control hardware devices (card dispenser and encoder).

**Platform**: Windows (COM ports) or Linux (USB serial devices)

**Hardware**:
- **K720 Card Dispenser**: Handles card movement (dispensing/ejecting)
- **M100A or M600 Encoder**: Handles RFID card encoding

## Architecture

- **Frontend (React)**: Makes API calls to backend, receives lock data, then calls this local hardware service
- **Hardware Service (Node.js)**: Runs on kiosk machine, controls physical hardware via native DLLs/SOs
- **Backend API**: Returns lock data and reservation info, doesn't handle hardware

## Setup

### Quick Start

1. **Copy hardware DLLs**:
   ```bash
   # Ensure DLLs are in hardware-service/hardware/ directory
   # Windows: K720_Dll.dll, M100A_DLL.dll (or M600_DLL.dll)
   ```

2. **Install dependencies**:
   ```bash
   cd hardware-service
   npm install
   ```
   
   **Note for Windows**: You may need Python and Windows Build Tools for native modules:
   ```bash
   npm install -g windows-build-tools
   ```

3. **Configure environment**:
   ```bash
   # Copy example file
   copy .env.example .env  # Windows
   # or
   cp .env.example .env    # Linux
   
   # Edit .env with your hardware configuration
   ```

4. **Start the service**:
   ```bash
   npm start
   ```

### Windows Setup

See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed Windows installation instructions.

### Configuration

Edit `.env` file with your hardware settings:

```env
# Service Port
HARDWARE_SERVICE_PORT=9000

# SDK Path (relative to hardware-service directory)
CARD_DISPENSER_SDK_PATH=./hardware

# Dispenser Configuration
CARD_DISPENSER_PORT=COM3        # Windows: COM3/COM4, Linux: /dev/ttyUSB0
CARD_DISPENSER_BAUD=9600
CARD_DISPENSER_MAC_ADDR=0x01

# Encoder Configuration
CARD_ENCODER_PORT=COM4          # Windows: COM3/COM4, Linux: /dev/ttyUSB1
CARD_ENCODER_BAUD=9600
CARD_ENCODER_TYPE=M100A         # M100A or M600

# TTLock Card Encoding
TTLOCK_CARD_SECTOR=1
TTLOCK_CARD_BLOCK=0
TTLOCK_CARD_KEY_A=FFFFFFFFFFFF
```

## API Endpoints

### Health Check
```
GET /health
```

### Issue Card
```
POST /api/card/issue
Content-Type: application/json

{
  "lockData": "hex_string_from_ttlock"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "cardId": "ABCD1234",
    "cardType": "S50",
    "encodedAt": "2025-01-02T10:30:00.000Z"
  },
  "message": "Card issued successfully"
}
```

## Integration with Frontend

The frontend calls this service after receiving successful response from the backend API:

1. Frontend calls backend: `POST /api/kiosk/v1/.../lost-card`
2. Backend returns: `{ success: true, data: { ekey: { encrypt_payload: "..." } } }`
3. Frontend calls hardware service: `POST http://localhost:9000/api/card/issue`
4. Hardware service controls dispenser/encoder and returns result

## Running in Production

For production deployment, run this service as a systemd service or Windows service alongside the React app.

