import { apiClient } from './api/apiClient';

/**
 * Create a booking in Apaleo
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.propertyId - Property ID
 * @param {string} bookingData.unitGroupId - Unit Group ID (room type)
 * @param {string} bookingData.ratePlanId - Rate Plan ID
 * @param {string} bookingData.arrival - Check-in date (YYYY-MM-DD)
 * @param {string} bookingData.departure - Check-out date (YYYY-MM-DD)
 * @param {number} bookingData.adults - Number of adults
 * @param {Object} bookingData.primaryGuest - Guest information
 * @param {string} hotelId - Hotel ID for the booking endpoint
 * @returns {Promise<Object>} Booking response from Apaleo
 */
export const createBooking = async (bookingData, hotelId) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[booking] creating booking', { bookingData, hotelId });
  
  try {
    const response = await apiClient.post(`/booking/${hotelId}`, bookingData);
    
    if (debug) console.log('[booking] response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[booking] error', err?.response?.data || err?.message);
    throw err;
  }
};

/**
 * Get reservation details by ID
 * @param {string} reservationId - Apaleo reservation ID
 * @returns {Promise<Object>} Reservation details
 */
export const getReservation = async (reservationId) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[reservation] fetching reservation', reservationId);
  
  try {
    const response = await apiClient.get(`/reservation/${reservationId}`);
    
    if (debug) console.log('[reservation] response', response.data);
    
    return response.data;
  } catch (err) {
    if (debug) console.error('[reservation] error', err?.response?.data || err?.message);
    throw err;
  }
};

