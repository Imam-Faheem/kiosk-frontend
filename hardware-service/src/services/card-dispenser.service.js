const { logger } = require('../utils/logger');
const k720SDK = require('./k720-sdk-wrapper');

/**
 * Card Dispenser Service
 * Handles card movement, status checking with polling logic
 * Manages dual device communication (dispenser + encoder)
 */
class CardDispenserService {
  constructor() {
    this.POLL_INTERVAL = 200; // 200ms polling interval
    this.MAX_POLL_TIME = 15000; // 15 seconds max wait time
    this.CARD_MOVEMENT_TIMEOUT = 10000; // 10 seconds for card movement
  }

  /**
   * Check device status
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<Object>} Device status
   */
  async checkDeviceStatus(dispenserHandle, macAddr) {
    const functionName = 'checkDeviceStatus';
    
    try {
      const positionStatus = await this.checkCardPosition(dispenserHandle);
      
      // Check card box status
      if (positionStatus.cardBoxStatus === 0x30) { // CARDBOXEMPTY
        throw new Error('Card box is empty - cannot dispense card');
      }
      
      // Check retain box status
      if (positionStatus.retainBoxStatus === 0x31) { // RETAINBOXFULL
        throw new Error('Retain box is full - cannot process cards');
      }
      
      logger.info(`${functionName}: Device status OK`, {
        device_status: positionStatus.deviceStatus.toString(16),
        card_box_status: positionStatus.cardBoxStatus.toString(16),
        retain_box_status: positionStatus.retainBoxStatus.toString(16)
      });
      
      return positionStatus;
    } catch (error) {
      logger.error(`${functionName}: Device status check failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Check card position
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @returns {Promise<Object>} Card position status
   */
  async checkCardPosition(dispenserHandle) {
    const functionName = 'checkCardPosition';
    const dispenserDll = k720SDK.getDispenserDll();
    
    try {
      const deviceStatus = Buffer.alloc(1);
      const transportStatus = Buffer.alloc(1);
      const cardBoxStatus = Buffer.alloc(1);
      const retainBoxStatus = Buffer.alloc(1);

      const result = dispenserDll.K720_CheckCardPosition(
        deviceStatus,
        transportStatus,
        cardBoxStatus,
        retainBoxStatus
      );

      if (result !== 0) {
        throw new Error(`Failed to check card position: ${result}`);
      }

      return {
        deviceStatus: deviceStatus[0],
        transportStatus: transportStatus[0],
        cardBoxStatus: cardBoxStatus[0],
        retainBoxStatus: retainBoxStatus[0]
      };
    } catch (error) {
      logger.error(`${functionName}: Failed to check card position`, { error: error.message });
      throw error;
    }
  }

  /**
   * Move card to encoding position with polling
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<Object>} Movement result
   */
  async moveCardToEncodingPosition(dispenserHandle, macAddr) {
    const functionName = 'moveCardToEncodingPosition';
    
    try {
      logger.info(`${functionName}: Initiating card movement to encoding position`);
      
      const dispenserDll = k720SDK.getDispenserDll();
      
      // Send move command (returns immediately, card is still moving)
      // 0x01 = move to encoding/reading position
      const moveResult = dispenserDll.K720_MoveCard(0x01);
      
      if (moveResult !== 0) {
        throw new Error(`Move command failed: ${moveResult}`);
      }

      // Poll for status until card reaches encoding position
      const startTime = Date.now();
      let cardInPosition = false;
      
      while (!cardInPosition && (Date.now() - startTime) < this.CARD_MOVEMENT_TIMEOUT) {
        // Check card position status
        const positionStatus = await this.checkCardPosition(dispenserHandle);
        
        // Position status bytes:
        // DeviceStatus: 0x30=IDLE, 0x33=SENDINGCARD, 0x34=RETAININGCARD
        // TransportStatus: 0x30=OVERLAP, 0x32=MEDIAPRESENT, 0x34=MEDIAENTERING
        
        if (positionStatus.transportStatus === 0x32) { // MEDIAPRESENT
          // Card is in reading/encoding position
          cardInPosition = true;
          logger.info(`${functionName}: Card reached encoding position`);
          break;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
      }

      if (!cardInPosition) {
        throw new Error('Card movement timeout - card did not reach encoding position');
      }

      // Additional verification: ensure card is stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };

    } catch (error) {
      logger.error(`${functionName}: Card movement failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Wait for card to be in specific position with timeout
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @param {number} expectedStatus - Expected transport status code
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if card reached position
   */
  async waitForCardInPosition(dispenserHandle, macAddr, expectedStatus, timeout = 10000) {
    const functionName = 'waitForCardInPosition';
    const startTime = Date.now();

    while ((Date.now() - startTime) < timeout) {
      const status = await this.checkCardPosition(dispenserHandle);
      
      if (status.transportStatus === expectedStatus) {
        logger.info(`${functionName}: Card reached expected position`, {
          expected_status: expectedStatus.toString(16),
          actual_status: status.transportStatus.toString(16)
        });
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
    }

    throw new Error(`Timeout waiting for card position ${expectedStatus.toString(16)}`);
  }

  /**
   * Move card to dispensing position with polling
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<Object>} Movement result
   */
  async moveCardToDispensingPosition(dispenserHandle, macAddr) {
    const functionName = 'moveCardToDispensingPosition';
    
    try {
      logger.info(`${functionName}: Moving card to dispensing position`);
      
      const dispenserDll = k720SDK.getDispenserDll();
      
      // 0x02 = move to dispensing/ejection position
      const moveResult = dispenserDll.K720_MoveCard(0x02);
      
      if (moveResult !== 0) {
        throw new Error(`Move to dispensing position failed: ${moveResult}`);
      }

      // Poll for status until card reaches dispensing position
      const startTime = Date.now();
      let cardInPosition = false;
      
      while (!cardInPosition && (Date.now() - startTime) < this.CARD_MOVEMENT_TIMEOUT) {
        const positionStatus = await this.checkCardPosition(dispenserHandle);
        
        // Check if card is ready for ejection
        if (positionStatus.transportStatus === 0x34) { // MEDIAENTERING or ready for ejection
          cardInPosition = true;
          logger.info(`${functionName}: Card reached dispensing position`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
      }

      if (!cardInPosition) {
        throw new Error('Card movement timeout - card did not reach dispensing position');
      }

      // Wait for card to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };

    } catch (error) {
      logger.error(`${functionName}: Card movement to dispensing position failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Eject card
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<Object>} Ejection result
   */
  async ejectCard(dispenserHandle, macAddr) {
    const functionName = 'ejectCard';
    
    try {
      logger.info(`${functionName}: Ejecting card`);
      
      const dispenserDll = k720SDK.getDispenserDll();
      
      // Eject card (move to front and wait for removal)
      // The card should already be in dispensing position
      // Additional move command may be needed depending on hardware
      const moveResult = dispenserDll.K720_MoveCard(0x03); // 0x03 = eject
      
      if (moveResult !== 0) {
        throw new Error(`Card ejection failed: ${moveResult}`);
      }

      // Wait for card to be removed (poll until card is gone)
      const startTime = Date.now();
      const EJECT_TIMEOUT = 8000; // 8 seconds for user to take card
      
      while ((Date.now() - startTime) < EJECT_TIMEOUT) {
        const positionStatus = await this.checkCardPosition(dispenserHandle);
        
        // Card removed when transport status indicates no card
        if (positionStatus.transportStatus === 0x33) { // MEDIANOTPRESENT
          logger.info(`${functionName}: Card ejected and removed by user`);
          return { success: true };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
      }

      // Card may still be in position, but we'll consider it ejected
      logger.warn(`${functionName}: Card ejection timeout - card may still be in position`);
      return { success: true, warning: 'Card may not have been removed' };

    } catch (error) {
      logger.error(`${functionName}: Card ejection failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Retain card (move to retain box on error)
   * @param {HANDLE} dispenserHandle - Dispenser communication handle
   * @param {BYTE} macAddr - Device MAC address
   * @returns {Promise<Object>} Retain result
   */
  async retainCard(dispenserHandle, macAddr) {
    const functionName = 'retainCard';
    
    try {
      logger.info(`${functionName}: Retaining card due to error`);
      
      const dispenserDll = k720SDK.getDispenserDll();
      
      // Retain card to card box (flag = true means retain, false means return to card box)
      const retainResult = dispenserDll.K720_RetainToCardBox(true, 4000, 4000);
      
      if (retainResult !== 0) {
        logger.warn(`${functionName}: Failed to retain card`, { error_code: retainResult });
        return { success: false, error_code: retainResult };
      }

      logger.info(`${functionName}: Card retained successfully`);
      return { success: true };

    } catch (error) {
      logger.error(`${functionName}: Card retention failed`, { error: error.message });
      // Don't throw - retention failure is not critical
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CardDispenserService();

