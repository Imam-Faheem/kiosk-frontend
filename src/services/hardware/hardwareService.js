import axios from 'axios';

/**
 * Hardware Service Client
 * Communicates with local hardware service running on kiosk machine
 */
const HARDWARE_SERVICE_URL = process.env.REACT_APP_HARDWARE_SERVICE_URL || 'http://localhost:9000';

const hardwareClient = axios.create({
  baseURL: HARDWARE_SERVICE_URL,
  timeout: 60000, // 60 seconds timeout for hardware operations
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check if hardware service is available
 */
export const checkHardwareService = async () => {
  try {
    const response = await hardwareClient.get('/health');
    return response.data?.status === 'ok';
  } catch (error) {
    console.error('[Hardware Service] Health check failed', error);
    return false;
  }
};

/**
 * Issue card with card data from TTLock
 * @param {string} cardData - Hex string from TTLock (cardData from getCardData API)
 * @param {string} hotelInfo - Hotel info string from TTLock (optional, but recommended)
 * @returns {Promise<Object>} Card issuance result
 */
export const issueCard = async (cardData, hotelInfo = null) => {
  try {
    if (!cardData) {
      throw new Error('Card data (cardData) is required');
    }

    console.log('[Hardware Service] Issuing card', {
      card_data_length: cardData.length,
      has_hotel_info: !!hotelInfo
    });

    const response = await hardwareClient.post('/api/card/issue', {
      cardData,
      hotelInfo
    });

    return response.data;
  } catch (error) {
    console.error('[Hardware Service] Card issuance failed', {
      error: error.message,
      response: error.response?.data
    });

    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to issue card'
    );
  }
};

export default {
  checkHardwareService,
  issueCard
};

