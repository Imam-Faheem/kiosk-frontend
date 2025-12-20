import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Issue a digital key for a reservation
 * @param {Object} data - Key issue data
 * @param {string} data.reservation_id - Reservation ID (KSUID)
 * @param {string} data.guest_email - Guest email
 * @param {string} data.lock_id - Lock ID (KSUID)
 * @param {string} data.room_number - Room number
 * @param {number} data.key_type - Key type (1=Permanent, 2=Timed, 3=One-time, 4=Recurring)
 * @param {string} data.start_date - Start date (ISO 8601, required for types 2 and 3)
 * @param {string} data.end_date - End date (ISO 8601, required for types 2 and 3)
 * @param {string} data.key_name - Key name
 * @returns {Promise<Object>} Key issue response
 */
export const issueDigitalKey = async (data) => {
  if (debug) console.log('[digitalKey] issuing digital key', data);
  
  try {
    const requestBody = {
      reservation_id: data.reservation_id || data.reservationId,
      guest_email: data.guest_email || data.guestEmail,
      lock_id: data.lock_id || data.lockId || API_CONFIG.DEFAULT_LOCK_ID,
      room_number: data.room_number || data.roomNumber,
      key_type: data.key_type || data.keyType || 2, // Default to timed key
      key_name: data.key_name || data.keyName || `Room ${data.room_number || data.roomNumber} - Guest Key`,
    };

    // Add dates for timed/one-time keys (types 2 and 3)
    if (requestBody.key_type === 2 || requestBody.key_type === 3) {
      if (data.start_date || data.startDate) {
        requestBody.start_date = data.start_date || data.startDate;
      }
      if (data.end_date || data.endDate) {
        requestBody.end_date = data.end_date || data.endDate;
      }
    }

    const response = await apiClient.post('/api/kiosk/v1/key/issue', requestBody);
    
    if (debug) console.log('[digitalKey] key issue response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key issued successfully',
    };
  } catch (err) {
    if (debug) console.error('[digitalKey] key issue error', err?.response?.data || err?.message);
    
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
  if (debug) console.log('[digitalKey] fetching digital key', keyId);
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/key/${keyId}`);
    
    if (debug) console.log('[digitalKey] key response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Digital key retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[digitalKey] key fetch error', err?.response?.data || err?.message);
    
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
  if (debug) console.log('[digitalKey] revoking digital key', keyId);
  
  try {
    const response = await apiClient.delete(`/api/kiosk/v1/key/${keyId}`);
    
    if (debug) console.log('[digitalKey] key revocation response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key revoked successfully',
    };
  } catch (err) {
    if (debug) console.error('[digitalKey] key revocation error', err?.response?.data || err?.message);
    
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
 * @param {string} data.reason - Reason for regeneration (e.g., "lost_card")
 * @param {string} data.guest_email - Guest email
 * @returns {Promise<Object>} New key response
 */
export const regenerateDigitalKey = async (keyId, data = {}) => {
  if (debug) console.log('[digitalKey] regenerating digital key', { keyId, data });
  
  try {
    const response = await apiClient.post(`/api/kiosk/v1/key/${keyId}/regenerate`, {
      reason: data.reason || 'lost_card',
      guest_email: data.guest_email || data.guestEmail,
    });
    
    if (debug) console.log('[digitalKey] key regeneration response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Digital key regenerated successfully',
    };
  } catch (err) {
    if (debug) console.error('[digitalKey] key regeneration error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to regenerate digital key';
    throw new Error(errorMessage);
  }
};

