import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';
import { translateError } from '../utils/translations';

/**
 * Issue a digital key for a reservation
 * @param {Object} data - Key issue data
 * @returns {Promise<Object>} Key issue response
 */
export const issueDigitalKey = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/key/issue', data);
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKey(data);
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
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
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKeyGet(keyId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error(translateError('digitalKeyNotFound'));
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? translateError('generic');
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
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return { success: true, data: { key_id: keyId, status: 'revoked' }, message: 'Digital key revoked successfully (mock)' };
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
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
    const response = await apiClient.post(`/api/kiosk/v1/key/${keyId}/regenerate`, data);
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.digitalKey({ reservation_id: data.reservation_id, lock_id: data.lock_id });
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to regenerate digital key';
    throw new Error(errorMessage);
  }
};

