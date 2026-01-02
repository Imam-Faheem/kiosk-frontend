const k720SDK = require('./k720-sdk-wrapper');
const cardDispenserService = require('./card-dispenser.service');
const cardEncoderService = require('./card-encoder.service');

/**
 * Card Service - Hardware Operations Only
 * Orchestrates the complete card issuance flow:
 * 1. Initialize hardware (dispenser + encoder)
 * 2. Move card to encoding position
 * 3. Encode card with TTLock hex payload
 * 4. Move card to dispensing position
 * 5. Eject card
 */

/**
 * Issue card with lock data
 * @param {string} lockData - Hex string from TTLock (encrypt_payload)
 * @returns {Promise<Object>} Card issuance result
 */
async function issueCard(lockData) {
  const functionName = 'issueCard';
  
  try {
    if (!lockData) {
      throw new Error('Lock data (lockData) is required');
    }

    console.log(`${functionName}: Starting card issuance`, {
      lock_data_length: lockData.length
    });

    // Step 1: Initialize hardware (dispenser + encoder)
    await k720SDK.initialize();
    const dispenserHandle = await k720SDK.openDispenser();
    const encoderHandle = await k720SDK.openEncoder();
    const macAddr = k720SDK.getMacAddr();
    
    console.log(`${functionName}: Hardware initialized`, {
      dispenser_port: k720SDK.config.dispenserPort,
      encoder_port: k720SDK.config.encoderPort
    });

    try {
      // Step 2: Check device status
      await cardDispenserService.checkDeviceStatus(dispenserHandle, macAddr);

      // Step 3: Move card to encoding position (WITH POLLING)
      await cardDispenserService.moveCardToEncodingPosition(dispenserHandle, macAddr);
      
      // Step 4: Wait for card to stabilize in encoding position
      await cardDispenserService.waitForCardInPosition(dispenserHandle, macAddr, 0x32, 5000);

      // Step 5: Detect card type
      const cardType = await cardEncoderService.detectCardType(encoderHandle, macAddr);
      
      // Step 6: Get card ID (UID)
      const cardIdBuffer = await cardEncoderService.getCardId(encoderHandle, macAddr, cardType);
      const cardId = cardIdBuffer.toString('hex').toUpperCase();

      console.log(`${functionName}: Card detected`, {
        card_type: cardType,
        card_id: cardId
      });

      // Step 7: ENCODE card with TTLock hex payload
      await cardEncoderService.encodeCardWithTTLockFormat(
        encoderHandle,
        macAddr,
        lockData, // Hex string from TTLock
        cardType
      );

      console.log(`${functionName}: Card encoded successfully`, {
        lock_data_length: lockData.length,
        card_type: cardType
      });

      // Step 8: Halt card
      await cardEncoderService.haltCard(encoderHandle, macAddr, cardType);

      // Step 9: Move card to dispensing position (WITH POLLING)
      await cardDispenserService.moveCardToDispensingPosition(dispenserHandle, macAddr);

      // Step 10: Eject card
      await cardDispenserService.ejectCard(dispenserHandle);

      console.log(`${functionName}: Card issuance completed successfully`, {
        card_id: cardId
      });

      return {
        success: true,
        data: {
          cardId: cardId,
          cardType: cardType,
          encodedAt: new Date().toISOString()
        },
        message: 'Card issued successfully'
      };

    } catch (hardwareError) {
      console.error(`${functionName}: Hardware operation failed`, {
        error: hardwareError.message
      });
      
      // Retain card on error
      if (dispenserHandle) {
        await cardDispenserService.retainCard(dispenserHandle, macAddr).catch(() => {});
      }
      
      throw new Error(`Card issuance failed: ${hardwareError.message}`);
    } finally {
      // Close hardware connections
      await k720SDK.closeAll();
    }

  } catch (error) {
    console.error(`${functionName}: Card issuance failed`, {
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}

module.exports = {
  issueCard
};

