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
 * Issue card with lock data
 * @param {string} lockData - Hex string from TTLock (encrypt_payload)
 * @returns {Promise<Object>} Card issuance result
 */
export const issueCard = async (lockData) => {
  try {
    if (!lockData) {
      throw new Error('Lock data (lockData) is required');
    }

    console.log('[Hardware Service] Issuing card', {
      lock_data_length: lockData.length
    });

    const response = await hardwareClient.post('/api/card/issue', {
      lockData
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

