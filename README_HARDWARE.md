# Hardware Integration Guide

## Overview

The kiosk frontend now includes hardware control for card dispenser and encoder. The hardware operations are handled by a local Node.js service that runs on the kiosk machine.

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Browser)      │
└────────┬────────┘
         │
         │ 1. API Call (GET /lost-card)
         ▼
┌─────────────────┐
│  Backend API    │
│  (Kong Gateway) │
└────────┬────────┘
         │
         │ 2. Returns lock data
         ▼
┌─────────────────┐
│  React Frontend │
│  (Browser)      │
└────────┬────────┘
         │
         │ 3. Hardware API Call (POST /api/card/issue)
         ▼
┌─────────────────┐
│ Hardware Service│
│  (Node.js)      │
│  localhost:9000 │
└────────┬────────┘
         │
         │ 4. Controls Hardware
         ▼
┌─────────────────┐
│  Card Dispenser │
│  & Encoder      │
└─────────────────┘
```

## Setup

### 1. Install Hardware Service Dependencies

```bash
cd kiosk-frontend/hardware-service
npm install
```

### 2. Configure Hardware Ports (Optional)

Set environment variables before starting the hardware service:

```bash
# Windows
export CARD_DISPENSER_PORT=COM3
export CARD_ENCODER_PORT=COM4

# Linux
export CARD_DISPENSER_PORT=/dev/ttyUSB0
export CARD_ENCODER_PORT=/dev/ttyUSB1
```

### 3. Start Hardware Service

```bash
cd kiosk-frontend/hardware-service
npm start
```

The service will run on `http://localhost:9000` by default.

### 4. Start React Frontend

```bash
cd kiosk-frontend
npm start
```

## How It Works

### Lost Card Flow

1. **User submits lost card request** → Frontend calls backend API
2. **Backend returns lock data** → `{ success: true, data: { ekey: { encrypt_payload: "..." } } }`
3. **Frontend triggers hardware** → Calls local hardware service with `encrypt_payload`
4. **Hardware service**:
   - Initializes dispenser and encoder
   - Moves card to encoding position
   - Encodes card with TTLock data
   - Moves card to dispensing position
   - Ejects card
5. **Frontend receives result** → Shows success/error to user

### Code Flow

**Frontend Service** (`src/services/lostCardService.js`):
```javascript
// 1. Call backend API
const apiResult = await apiClient.get('/lost-card');

// 2. If successful and has lock data, trigger hardware
if (apiResult?.success && apiResult?.data?.ekey?.encrypt_payload) {
  const hardwareResult = await issueHardwareCard(lockData);
  // Merge results
}
```

**Hardware Service Client** (`src/services/hardware/hardwareService.js`):
```javascript
// Calls local hardware service
const response = await hardwareClient.post('/api/card/issue', { lockData });
```

**Hardware Service** (`hardware-service/server.js`):
```javascript
// Receives request and controls hardware
app.post('/api/card/issue', async (req, res) => {
  const result = await cardService.issueCard(req.body.lockData);
  res.json(result);
});
```

## Error Handling

- If backend API fails → Frontend shows error, hardware not triggered
- If hardware service unavailable → Frontend shows warning but API result still returned
- If hardware operation fails → Frontend shows error but API result still returned

## Production Deployment

1. **Hardware Service**: Run as systemd service (Linux) or Windows service
2. **React Frontend**: Build and serve via web server
3. **Configuration**: Set `REACT_APP_HARDWARE_SERVICE_URL` environment variable if hardware service runs on different port/host

## Troubleshooting

### Hardware Service Not Starting
- Check if ports are available
- Verify DLLs/SOs are in `hardware-service/hardware/` directory
- Check Node.js version (requires >= 14.0.0)
- Verify native dependencies are installed: `ffi-napi`, `ref-napi`, `ref-struct-napi`

### Hardware Service Not Responding
- Check if service is running: `curl http://localhost:9000/health`
- Check CORS configuration in `hardware-service/server.js`
- Verify frontend is calling correct URL

### Card Not Dispensing
- Check hardware connections (USB/Serial)
- Verify port configuration matches actual hardware ports
- Check hardware service logs for errors
- Verify card box is not empty

