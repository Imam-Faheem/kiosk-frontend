import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';
import { mockData, shouldUseMock } from './mockData';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

// Helper to normalize key data
const normalizeKeyData = (data) => {
  const requestBody = {
    reservation_id: data.reservation_id || data.reservationId,
    guest_email: data.guest_email || data.guestEmail,
    lock_id: data.lock_id || data.lockId || API_CONFIG.DEFAULT_LOCK_ID,
    room_number: data.room_number || data.roomNumber,
    key_type: data.key_type || data.keyType || 2,
    key_name: data.key_name || data.keyName || `Room ${data.room_number || data.roomNumber} - Guest Key`,
  };
  if (requestBody.key_type === 2 || requestBody.key_type === 3) {
    if (data.start_date || data.startDate) requestBody.start_date = data.start_date || data.startDate;
    if (data.end_date || data.endDate) requestBody.end_date = data.end_date || data.endDate;
  }
  return requestBody;
};

/**
 * Issue a digital key for a reservation
 * @param {Object} data - Key issue data
 * @returns {Promise<Object>} Key issue response
 */
export const issueDigitalKey = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/key/issue', normalizeKeyData(data));
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key issued successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKey(data);
    }
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to issue digital key';
    throw new Error(errorMessage);
  }
};

/**
 * Get digital key details
 * @param {string} keyId - Key ID
 * @returns {Promise<Object>} Key details
 */
export const getDigitalKey = async (keyId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/key/${keyId}`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Digital key retrieved successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKeyGet(keyId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Digital key not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch digital key';
    throw new Error(errorMessage);
  }
};

/**
 * Revoke a digital key
 * @param {string} keyId - Key ID
 * @returns {Promise<Object>} Revocation response
 */
export const revokeDigitalKey = async (keyId) => {
  try {
    const response = await apiClient.delete(`/api/kiosk/v1/key/${keyId}`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key revoked successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return { success: true, data: { key_id: keyId, status: 'revoked' }, message: 'Digital key revoked successfully (mock)' };
    }
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to revoke digital key';
    throw new Error(errorMessage);
  }
};

/**
 * Regenerate a digital key (for lost card scenario)
 * @param {string} keyId - Original key ID
 * @param {Object} data - Regeneration data
 * @returns {Promise<Object>} New key response
 */
export const regenerateDigitalKey = async (keyId, data = {}) => {
  try {
    const response = await apiClient.post(`/api/kiosk/v1/key/${keyId}/regenerate`, {
      reason: data.reason || 'lost_card',
      guest_email: data.guest_email || data.guestEmail,
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key regenerated successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKey({ reservation_id: data.reservation_id, lock_id: data.lock_id });
    }
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to regenerate digital key';
    throw new Error(errorMessage);
  }
};

