# Hardware SDK Files

This directory contains the hardware SDK DLL files for the K720 Card Dispenser and Encoder.

## Files

- **K720_Dll.dll** - Dispenser DLL (handles card movement/motors)
- **M100A_DLL.dll** - Encoder DLL (handles RFID card encoding - M100A model)
- **M600_DLL.dll** - Encoder DLL (handles RFID card encoding - M600 model)
- **K720_Dll.h** - Header file with function definitions (reference)
- **K720_Dll.lib** - Library file for linking (reference)

## Usage

The SDK wrapper (`k720-sdk-wrapper.js`) loads these DLLs using `ffi-napi` to communicate with the hardware.

## Configuration

Set the following environment variables:

```env
# SDK Path (relative to kiosk service root)
CARD_DISPENSER_SDK_PATH=./hardware

# Dispenser Configuration
CARD_DISPENSER_PORT=COM3
CARD_DISPENSER_BAUD=9600
CARD_DISPENSER_MAC_ADDR=0x01

# Encoder Configuration
CARD_ENCODER_PORT=COM4
CARD_ENCODER_BAUD=9600
CARD_ENCODER_TYPE=M100A  # or M600

# TTLock Card Encoding
TTLOCK_CARD_SECTOR=1
TTLOCK_CARD_BLOCK=0
TTLOCK_CARD_KEY_A=FFFFFFFFFFFF  # Get from TTLock documentation
```

## Notes

- These DLLs are Windows-specific and will only work on Windows systems
- For Linux/Mac development, you may need to mock the hardware or use a Windows VM/container
- The DLLs must be in the same architecture (32-bit or 64-bit) as your Node.js installation

