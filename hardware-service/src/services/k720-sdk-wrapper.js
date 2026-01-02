const ffi = require('ffi-napi');
const ref = require('ref-napi');
const Struct = require('ref-struct-napi');
const path = require('path');
const { logger } = require('../utils/logger');

/**
 * K720 SDK Wrapper - Handles dual device communication
 * Dispenser: K720_Dll.dll (motors/card movement)
 * Encoder: M100A_DLL.dll or M600_DLL.dll (RFID read/write)
 */
class K720SDKWrapper {
  constructor() {
    this.dispenserDll = null;
    this.encoderDll = null;
    this.dispenserHandle = null;
    this.encoderHandle = null;
    
    // Default ports based on platform
    // Windows: COM ports (COM3, COM4, etc.)
    // Linux: USB serial devices (/dev/ttyUSB0, /dev/ttyUSB1, etc.)
    const defaultDispenserPort = process.platform === 'win32' ? 'COM3' : '/dev/ttyUSB0';
    const defaultEncoderPort = process.platform === 'win32' ? 'COM4' : '/dev/ttyUSB1';
    
    this.config = {
      dispenserPort: process.env.CARD_DISPENSER_PORT || defaultDispenserPort,
      encoderPort: process.env.CARD_ENCODER_PORT || defaultEncoderPort,
      dispenserBaud: parseInt(process.env.CARD_DISPENSER_BAUD || '9600'),
      encoderBaud: parseInt(process.env.CARD_ENCODER_BAUD || '9600'),
      macAddr: parseInt(process.env.CARD_DISPENSER_MAC_ADDR || '0x01', 16),
      sdkPath: process.env.CARD_DISPENSER_SDK_PATH || './hardware',
      encoderType: process.env.CARD_ENCODER_TYPE || 'M100A' // M100A or M600
    };
  }

  /**
   * Initialize both DLLs
   * Supports both Windows (.dll) and Linux (.so) libraries
   */
  async initialize() {
    try {
      const sdkPath = this.config.sdkPath;
      const platform = process.platform;
      
      // Determine library extension based on platform
      const libExt = platform === 'win32' ? '.dll' : '.so';
      
      // Load Dispenser DLL/SO (K720_Dll.dll or libK720.so)
      const dispenserLibName = platform === 'win32' ? 'K720_Dll.dll' : 'libK720.so';
      const dispenserLibPath = path.join(sdkPath, dispenserLibName);
      this.dispenserDll = this.loadDispenserDLL(dispenserLibPath);
      
      // Load Encoder DLL/SO (M100A_DLL.dll or libM100A.so)
      const encoderDllName = this.config.encoderType === 'M600' 
        ? (platform === 'win32' ? 'M600_DLL.dll' : 'libM600.so')
        : (platform === 'win32' ? 'M100A_DLL.dll' : 'libM100A.so');
      const encoderLibPath = path.join(sdkPath, encoderDllName);
      this.encoderDll = this.loadEncoderDLL(encoderLibPath);
      
      logger.info('K720 SDK initialized', {
        platform,
        dispenser_lib: dispenserLibName,
        encoder_lib: encoderDllName,
        sdk_path: sdkPath
      });
      
    } catch (error) {
      logger.error('Failed to initialize K720 SDK', { 
        error: error.message,
        platform: process.platform,
        stack: error.stack
      });
      throw new Error(`SDK initialization failed: ${error.message}`);
    }
  }

  /**
   * Load Dispenser DLL/SO (K720_Dll.dll or libK720.so) - Handles card movement
   */
  loadDispenserDLL(libPath) {
    return ffi.Library(libPath, {
      // Communication
      'K720_CommOpen': ['pointer', ['string']],
      'K720_CommOpenWithBaud': ['pointer', ['string', 'uint32']],
      'K720_CommClose': ['int', ['pointer']],
      
      // Device Status & Control
      'K720_Query': ['int', ['pointer', 'uchar', 'pointer', 'string']],
      'K720_CheckCardPosition': ['int', ['pointer', 'pointer', 'pointer', 'pointer']],
      'K720_MoveCard': ['int', ['uchar']],
      'K720_RetainToCardBox': ['int', ['bool', 'int', 'int']],
      'K720_ForceMove': ['int', ['pointer']],
      
      // Card Detection (for dispenser position checking)
      'K720_AutoTestRFIDCard': ['int', ['pointer', 'uchar', 'pointer', 'string']],
      
      // USB Support
      'K720_USB_OpenRU': ['int', ['pointer']],
      'K720_USB_CloseRU': ['int', ['pointer']],
      'K720_USB_MoveCard': ['int', ['uchar']],
      'K720_USB_CheckCardPosition': ['int', ['pointer', 'pointer', 'pointer', 'pointer']],
      'K720_USB_Query': ['int', ['pointer', 'uchar', 'pointer']]
    });
  }

  /**
   * Load Encoder DLL/SO (M100A_DLL.dll or libM100A.so) - Handles RFID encoding
   * Note: Function names may vary - adjust based on actual library exports
   */
  loadEncoderDLL(libPath) {
    const prefix = this.config.encoderType === 'M600' ? 'M600' : 'M100A';
    
    return ffi.Library(libPath, {
      // Communication
      [`${prefix}_CommOpen`]: ['pointer', ['string']],
      [`${prefix}_CommClose`]: ['int', ['pointer']],
      
      // S50 Card Operations
      [`${prefix}_S50DetectCard`]: ['int', ['pointer', 'uchar', 'string']],
      [`${prefix}_S50GetCardID`]: ['int', ['pointer', 'uchar', 'pointer', 'string']],
      [`${prefix}_S50LoadSecKey`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S50ReadBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S50WriteBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S50Halt`]: ['int', ['pointer', 'uchar', 'string']],
      
      // S70 Card Operations
      [`${prefix}_S70DetectCard`]: ['int', ['pointer', 'uchar', 'string']],
      [`${prefix}_S70GetCardID`]: ['int', ['pointer', 'uchar', 'pointer', 'string']],
      [`${prefix}_S70LoadSecKey`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S70ReadBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S70WriteBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_S70Halt`]: ['int', ['pointer', 'uchar', 'string']],
      
      // UL Card Operations
      [`${prefix}_ULDetectCard`]: ['int', ['pointer', 'uchar', 'string']],
      [`${prefix}_ULGetCardID`]: ['int', ['pointer', 'uchar', 'pointer', 'string']],
      [`${prefix}_ULReadBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_ULWriteBlock`]: ['int', ['pointer', 'uchar', 'uchar', 'pointer', 'string']],
      [`${prefix}_ULHalt`]: ['int', ['pointer', 'uchar', 'string']]
    });
  }

  /**
   * Open dispenser communication
   */
  async openDispenser() {
    try {
      if (this.dispenserHandle) {
        logger.warn('Dispenser already open');
        return this.dispenserHandle;
      }

      const port = this.config.dispenserPort;
      const baud = this.config.dispenserBaud;
      
      // Try USB first, fallback to Serial
      let handle;
      if (port.toUpperCase().startsWith('USB') || port.toUpperCase().startsWith('/dev/')) {
        // USB device or Linux device path
        const handlePtr = ref.alloc('pointer');
        const result = this.dispenserDll.K720_USB_OpenRU(handlePtr);
        if (result !== 0) {
          throw new Error(`Failed to open USB dispenser: ${result}`);
        }
        handle = handlePtr.deref();
      } else {
        // Serial port (COM on Windows, /dev/tty* on Linux)
        handle = this.dispenserDll.K720_CommOpenWithBaud(port, baud);
        if (!handle || handle.isNull()) {
          throw new Error(`Failed to open dispenser port ${port}`);
        }
      }

      this.dispenserHandle = handle;
      logger.info('Dispenser opened', { port, baud });
      return handle;
    } catch (error) {
      logger.error('Failed to open dispenser', { error: error.message });
      throw error;
    }
  }

  /**
   * Open encoder communication
   */
  async openEncoder() {
    try {
      if (this.encoderHandle) {
        logger.warn('Encoder already open');
        return this.encoderHandle;
      }

      const port = this.config.encoderPort;
      const prefix = this.config.encoderType === 'M600' ? 'M600' : 'M100A';
      const openFunc = this.encoderDll[`${prefix}_CommOpen`];
      
      if (!openFunc) {
        throw new Error(`Encoder function ${prefix}_CommOpen not found`);
      }
      
      const handle = openFunc(port);
      if (!handle || handle.isNull()) {
        throw new Error(`Failed to open encoder port ${port}`);
      }

      this.encoderHandle = handle;
      logger.info('Encoder opened', { port, encoder_type: this.config.encoderType });
      return handle;
    } catch (error) {
      logger.error('Failed to open encoder', { error: error.message });
      throw error;
    }
  }

  /**
   * Close both devices
   */
  async closeAll() {
    if (this.dispenserHandle) {
      try {
        this.dispenserDll.K720_CommClose(this.dispenserHandle);
        this.dispenserHandle = null;
      } catch (error) {
        logger.warn('Error closing dispenser', { error: error.message });
      }
    }

    if (this.encoderHandle) {
      try {
        const prefix = this.config.encoderType === 'M600' ? 'M600' : 'M100A';
        const closeFunc = this.encoderDll[`${prefix}_CommClose`];
        if (closeFunc) {
          closeFunc(this.encoderHandle);
        }
        this.encoderHandle = null;
      } catch (error) {
        logger.warn('Error closing encoder', { error: error.message });
      }
    }
  }

  /**
   * Get dispenser handle
   */
  getDispenserHandle() {
    return this.dispenserHandle;
  }

  /**
   * Get encoder handle
   */
  getEncoderHandle() {
    return this.encoderHandle;
  }

  /**
   * Get MAC address
   */
  getMacAddr() {
    return this.config.macAddr;
  }

  /**
   * Get dispenser DLL
   */
  getDispenserDll() {
    return this.dispenserDll;
  }

  /**
   * Get encoder DLL
   */
  getEncoderDll() {
    return this.encoderDll;
  }
}

module.exports = new K720SDKWrapper();

