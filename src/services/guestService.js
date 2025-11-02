import { apiClient } from './api/apiClient';

/**
 * Save guest details to backend
 * @param {Object} guestData - Guest information
 * @param {string} guestData.firstName - First name
 * @param {string} guestData.lastName - Last name
 * @param {string} guestData.email - Email address
 * @param {string} guestData.phone - Phone number
 * @param {string} guestData.country - Country code
 * @param {string} guestData.addressStreet - Street address
 * @param {string} guestData.addressCity - City
 * @param {string} guestData.addressState - State/Province
 * @param {string} guestData.addressPostal - ZIP/Postal code
 * @param {string} guestData.propertyId - Property ID (optional)
 * @param {string} guestData.reservationId - Reservation ID (optional)
 * @returns {Promise<Object>} Saved guest details response
 */
export const saveGuestDetails = async (guestData) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[guests/details] saving guest details', guestData);
  
  try {
    const response = await apiClient.post('/guests/details', guestData);
    
    if (debug) console.log('[guests/details] response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[guests/details] error', err?.response?.data || err?.message);
    throw err;
  }
};

/**
 * Get guest details by ID or email
 * @param {Object} params - Search parameters
 * @param {number} params.guestId - Guest ID (optional)
 * @param {string} params.email - Email address (optional)
 * @returns {Promise<Object>} Guest details response
 */
export const getGuestDetails = async (params) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[guests/details] fetching guest details', params);
  
  try {
    const response = await apiClient.get('/guests/details', { params });
    
    if (debug) console.log('[guests/details] response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[guests/details] error', err?.response?.data || err?.message);
    throw err;
  }
};

/**
 * Update Apaleo reservation with guest information
 * @param {string} reservationId - Apaleo reservation ID
 * @param {Object} guestData - Guest information
 * @param {string} propertyId - Property ID (optional)
 * @returns {Promise<Object>} Update response
 */
export const updateApaleoReservationWithGuest = async (reservationId, guestData, propertyId) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[guests/reservation] updating reservation', { reservationId, guestData, propertyId });
  
  try {
    const params = propertyId ? { propertyId } : {};
    const response = await apiClient.patch(`/guests/reservation/${reservationId}`, guestData, { params });
    
    if (debug) console.log('[guests/reservation] response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[guests/reservation] error', err?.response?.data || err?.message);
    throw err;
  }
};

