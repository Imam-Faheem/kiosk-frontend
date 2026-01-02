# Hardware Service Setup Checklist

Use this checklist to ensure everything is properly configured for the dispenser to work.

## ✅ Files Verification

- [ ] `server.js` - Main HTTP server
- [ ] `package.json` - Dependencies configuration
- [ ] `.env.example` - Configuration template
- [ ] `.env` - Your actual configuration (create from .env.example)
- [ ] `hardware/K720_Dll.dll` - Dispenser DLL (Windows)
- [ ] `hardware/M100A_DLL.dll` or `M600_DLL.dll` - Encoder DLL (Windows)
- [ ] `src/services/card.service.js` - Card issuance logic
- [ ] `src/services/k720-sdk-wrapper.js` - SDK wrapper
- [ ] `src/services/card-dispenser.service.js` - Dispenser operations
- [ ] `src/services/card-encoder.service.js` - Encoder operations
- [ ] `src/utils/logger.js` - Logging utility

## ✅ Configuration

- [ ] `.env` file created from `.env.example`
- [ ] `CARD_DISPENSER_PORT` set to correct COM port (check Device Manager)
- [ ] `CARD_ENCODER_PORT` set to correct COM port (check Device Manager)
- [ ] `CARD_ENCODER_TYPE` set to `M100A` or `M600` (match your hardware)
- [ ] `CARD_DISPENSER_SDK_PATH` points to `./hardware` directory

## ✅ Dependencies

- [ ] Node.js installed (v14+)
- [ ] Python installed (for native modules)
- [ ] Windows Build Tools installed (or Visual Studio Build Tools)
- [ ] Run `npm install` in `hardware-service/` directory
- [ ] All dependencies installed without errors

## ✅ Hardware Connection

- [ ] Dispenser connected to computer (USB or Serial)
- [ ] Encoder connected to computer (USB or Serial)
- [ ] COM ports identified in Device Manager
- [ ] Hardware powered on
- [ ] Card box has cards loaded
- [ ] Retain box is not full

## ✅ Service Startup

- [ ] Service starts without errors: `npm start`
- [ ] Health check works: `curl http://localhost:9000/health`
- [ ] Service responds with: `{"status":"ok","service":"hardware-service"}`
- [ ] No DLL loading errors in console
- [ ] No COM port errors in console

## ✅ Frontend Integration

- [ ] Frontend service client exists: `src/services/hardware/hardwareService.js`
- [ ] Lost card service integrated: `src/services/lostCardService.js`
- [ ] Hardware service URL configured (default: `http://localhost:9000`)
- [ ] Frontend can reach hardware service (no CORS errors)

## ✅ Testing

- [ ] Test health endpoint: `GET http://localhost:9000/health`
- [ ] Test card issuance with sample lock data
- [ ] Verify card dispenses correctly
- [ ] Verify card encodes correctly
- [ ] Test full lost card flow from frontend

## Troubleshooting

If any item fails:

1. **DLL Errors**: Check DLLs are in `hardware/` folder, verify architecture matches Node.js
2. **COM Port Errors**: Check Device Manager, verify correct port numbers
3. **Build Errors**: Install Python and Windows Build Tools
4. **Service Not Starting**: Check port 9000 is available, check logs
5. **Frontend Can't Connect**: Check CORS settings, verify service is running

## Quick Test

```bash
# 1. Start hardware service
cd kiosk-frontend/hardware-service
npm start

# 2. In another terminal, test health
curl http://localhost:9000/health

# 3. Test card issuance (replace with real lock data)
curl -X POST http://localhost:9000/api/card/issue \
  -H "Content-Type: application/json" \
  -d "{\"lockData\": \"test_hex_string_here\"}"
```

