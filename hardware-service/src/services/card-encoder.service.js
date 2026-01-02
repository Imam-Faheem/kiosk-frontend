const { logger } = require('../utils/logger');
const k720SDK = require('./k720-sdk-wrapper');

/**
 * Card Encoder Service
 * Handles writing TTLock hex payload to RFID cards
 */
class CardEncoderService {
  constructor() {
    this.config = {
      defaultSector: parseInt(process.env.TTLOCK_CARD_SECTOR || '1'),
      defaultBlock: parseInt(process.env.TTLOCK_CARD_BLOCK || '0'),
      keyA: Buffer.from(process.env.TTLOCK_CARD_KEY_A || 'FFFFFFFFFFFF', 'hex'), // Get from TTLock docs
      keyType: 0 // 0 = Key A, 1 = Key B
    };
  }

  /**
   * Detect card type (S50, S70, or UL)
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<string>} Card type: 'S50', 'S70', or 'UL'
   */
  async detectCardType(encoderHandle, macAddr) {
    const functionName = 'detectCardType';
    
    try {
      const encoderDll = k720SDK.getEncoderDll();
      const prefix = k720SDK.config.encoderType === 'M600' ? 'M600' : 'M100A';
      
      // Try to auto-detect card type
      const cardTypeBuffer = Buffer.alloc(1);
      const recordInfo = Buffer.alloc(256);
      
      // Try detecting each type manually
      const detectS50 = encoderDll[`${prefix}_S50DetectCard`];
      const detectS70 = encoderDll[`${prefix}_S70DetectCard`];
      const detectUL = encoderDll[`${prefix}_ULDetectCard`];
      
      if (detectS50) {
        const result = detectS50(encoderHandle, macAddr, recordInfo);
        if (result === 0) {
          logger.info(`${functionName}: S50 card detected`);
          return 'S50';
        }
      }
      
      if (detectS70) {
        const result = detectS70(encoderHandle, macAddr, recordInfo);
        if (result === 0) {
          logger.info(`${functionName}: S70 card detected`);
          return 'S70';
        }
      }
      
      if (detectUL) {
        const result = detectUL(encoderHandle, macAddr, recordInfo);
        if (result === 0) {
          logger.info(`${functionName}: UL card detected`);
          return 'UL';
        }
      }

      throw new Error('Unable to detect card type - no card present or unsupported type');
    } catch (error) {
      logger.error(`${functionName}: Card type detection failed`, { error: error.message });
      throw new Error(`Card detection failed: ${error.message}`);
    }
  }

  /**
   * Get card ID (UID)
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {string} cardType - Card type: 'S50', 'S70', or 'UL'
   * @returns {Promise<Buffer>} Card ID (UID) as Buffer
   */
  async getCardId(encoderHandle, macAddr, cardType) {
    const functionName = 'getCardId';
    const encoderDll = k720SDK.getEncoderDll();
    const prefix = k720SDK.config.encoderType === 'M600' ? 'M600' : 'M100A';
    const recordInfo = Buffer.alloc(256);
    
    try {
      let cardIdBuffer;
      let result;
      
      switch (cardType) {
        case 'S50':
          cardIdBuffer = Buffer.alloc(4);
          result = encoderDll[`${prefix}_S50GetCardID`](encoderHandle, macAddr, cardIdBuffer, recordInfo);
          if (result !== 0) throw new Error(`Failed to get S50 card ID: ${result}`);
          return cardIdBuffer.slice(0, 4);
          
        case 'S70':
          cardIdBuffer = Buffer.alloc(4);
          result = encoderDll[`${prefix}_S70GetCardID`](encoderHandle, macAddr, cardIdBuffer, recordInfo);
          if (result !== 0) throw new Error(`Failed to get S70 card ID: ${result}`);
          return cardIdBuffer.slice(0, 4);
          
        case 'UL':
          cardIdBuffer = Buffer.alloc(7);
          result = encoderDll[`${prefix}_ULGetCardID`](encoderHandle, macAddr, cardIdBuffer, recordInfo);
          if (result !== 0) throw new Error(`Failed to get UL card ID: ${result}`);
          return cardIdBuffer.slice(0, 7);
          
        default:
          throw new Error(`Unsupported card type for ID retrieval: ${cardType}`);
      }
    } catch (error) {
      logger.error(`${functionName}: Failed to get card ID`, { error: error.message, card_type: cardType });
      throw error;
    }
  }

  /**
   * Encode card with TTLock proprietary hex format
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {string} ttlockHexPayload - Hex string from TTLock ekey (lockData)
   * @param {string} cardType - Card type: 'S50', 'S70', or 'UL'
   * @returns {Promise<Object>} Encoding result
   */
  async encodeCardWithTTLockFormat(encoderHandle, macAddr, ttlockHexPayload, cardType) {
    const functionName = 'encodeCardWithTTLockFormat';
    
    try {
      logger.info(`${functionName}: Encoding with TTLock format`, {
        payload_length: ttlockHexPayload.length,
        card_type: cardType,
        sector: this.config.defaultSector
      });

      // Convert hex string to buffer
      const payloadBuffer = Buffer.from(ttlockHexPayload, 'hex');
      
      // TTLock payload is typically 16 bytes per block
      // May span multiple blocks depending on payload size
      const blocksNeeded = Math.ceil(payloadBuffer.length / 16);
      
      logger.info(`${functionName}: Writing TTLock payload`, {
        sector: this.config.defaultSector,
        blocks: blocksNeeded,
        total_bytes: payloadBuffer.length
      });

      // Authenticate with sector key
      await this.loadSectorKey(encoderHandle, macAddr, cardType, this.config.defaultSector, this.config.keyA, this.config.keyType);

      // Write payload in 16-byte blocks
      for (let i = 0; i < blocksNeeded; i++) {
        const blockAddr = this.config.defaultBlock + i;
        const offset = i * 16;
        const blockData = Buffer.alloc(16);
        
        // Copy payload data to block (pad with zeros if needed)
        payloadBuffer.copy(blockData, 0, offset, Math.min(offset + 16, payloadBuffer.length));

        logger.info(`${functionName}: Writing block ${blockAddr}`, {
          block: blockAddr,
          data_hex: blockData.toString('hex').substring(0, 32) + '...'
        });

        await this.writeBlock(encoderHandle, macAddr, cardType, this.config.defaultSector, blockAddr, blockData);

        // Small delay between writes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(`${functionName}: TTLock encoding completed`);
      return { success: true, blocksWritten: blocksNeeded };

    } catch (error) {
      logger.error(`${functionName}: TTLock encoding failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Load sector key (authentication)
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {string} cardType - Card type
   * @param {number} sectorAddr - Sector address
   * @param {Buffer} key - Sector key (6 bytes)
   * @param {number} keyType - Key type (0 = Key A, 1 = Key B)
   */
  async loadSectorKey(encoderHandle, macAddr, cardType, sectorAddr, key, keyType) {
    const functionName = 'loadSectorKey';
    const encoderDll = k720SDK.getEncoderDll();
    const prefix = k720SDK.config.encoderType === 'M600' ? 'M600' : 'M100A';
    const recordInfo = Buffer.alloc(256);
    
    try {
      let result;
      
      if (cardType === 'S50' || cardType === 'S70') {
        const loadKeyFunc = cardType === 'S50' 
          ? encoderDll[`${prefix}_S50LoadSecKey`]
          : encoderDll[`${prefix}_S70LoadSecKey`];
        
        if (!loadKeyFunc) {
          throw new Error(`Load key function not found for ${cardType}`);
        }
        
        result = loadKeyFunc(encoderHandle, macAddr, sectorAddr, keyType, key, recordInfo);
        
        if (result !== 0) {
          throw new Error(`Failed to load sector key: ${result}`);
        }
        
        logger.info(`${functionName}: Sector key loaded`, { sector: sectorAddr, key_type: keyType });
      } else {
        // UL cards don't require sector keys
        logger.info(`${functionName}: UL card - no sector key required`);
      }
    } catch (error) {
      logger.error(`${functionName}: Failed to load sector key`, { error: error.message });
      throw error;
    }
  }

  /**
   * Write block to card
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {string} cardType - Card type
   * @param {number} sectorAddr - Sector address
   * @param {number} blockAddr - Block address
   * @param {Buffer} blockData - Block data (16 bytes)
   */
  async writeBlock(encoderHandle, macAddr, cardType, sectorAddr, blockAddr, blockData) {
    const functionName = 'writeBlock';
    const encoderDll = k720SDK.getEncoderDll();
    const prefix = k720SDK.config.encoderType === 'M600' ? 'M600' : 'M100A';
    const recordInfo = Buffer.alloc(256);
    
    try {
      let result;
      
      switch (cardType) {
        case 'S50':
          result = encoderDll[`${prefix}_S50WriteBlock`](encoderHandle, macAddr, sectorAddr, blockAddr, blockData, recordInfo);
          break;
        case 'S70':
          result = encoderDll[`${prefix}_S70WriteBlock`](encoderHandle, macAddr, sectorAddr, blockAddr, blockData, recordInfo);
          break;
        case 'UL':
          result = encoderDll[`${prefix}_ULWriteBlock`](encoderHandle, macAddr, blockAddr, blockData, recordInfo);
          break;
        default:
          throw new Error(`Unsupported card type for writing: ${cardType}`);
      }

      if (result !== 0) {
        throw new Error(`Failed to write block ${blockAddr}: ${result}`);
      }

      logger.debug(`${functionName}: Block ${blockAddr} written successfully`);
    } catch (error) {
      logger.error(`${functionName}: Failed to write block`, { 
        error: error.message, 
        block: blockAddr,
        card_type: cardType 
      });
      throw error;
    }
  }

  /**
   * Halt card (put it in sleep mode)
   * @param {HANDLE} encoderHandle - Encoder communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {string} cardType - Card type
   */
  async haltCard(encoderHandle, macAddr, cardType) {
    const functionName = 'haltCard';
    const encoderDll = k720SDK.getEncoderDll();
    const prefix = k720SDK.config.encoderType === 'M600' ? 'M600' : 'M100A';
    const recordInfo = Buffer.alloc(256);
    
    try {
      let result;
      
      switch (cardType) {
        case 'S50':
          result = encoderDll[`${prefix}_S50Halt`](encoderHandle, macAddr, recordInfo);
          break;
        case 'S70':
          result = encoderDll[`${prefix}_S70Halt`](encoderHandle, macAddr, recordInfo);
          break;
        case 'UL':
          result = encoderDll[`${prefix}_ULHalt`](encoderHandle, macAddr, recordInfo);
          break;
      }
      
      if (result !== 0) {
        logger.warn(`${functionName}: Failed to halt card`, { error_code: result });
      } else {
        logger.debug(`${functionName}: Card halted successfully`);
      }
    } catch (error) {
      logger.warn(`${functionName}: Error halting card`, { error: error.message });
      // Non-critical error, don't throw
    }
  }
}

module.exports = new CardEncoderService();

