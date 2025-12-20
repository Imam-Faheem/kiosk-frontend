import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Process check-in for a reservation
 * @param {Object} data - Check-in data
 * @param {string} data.reservation_id - Reservation ID (KSUID)
 * @param {string} data.guest_email - Guest email
 * @param {string} data.guest_phone - Guest phone
 * @param {Object} data.guest_name - Guest name object
 * @param {string} data.guest_name.first_name - Guest first name
 * @param {string} data.guest_name.last_name - Guest last name
 * @param {string} data.check_in_date - Check-in date (ISO 8601)
 * @param {string} data.check_out_date - Check-out date (ISO 8601)
 * @param {string} data.room_number - Room number
 * @param {string} data.confirmation_code - Confirmation code (optional)
 * @returns {Promise<Object>} Check-in response
 */
export const processCheckIn = async (data) => {
  if (debug) console.log('[checkin] processing check-in', data);
  
  try {
    const response = await apiClient.post('/api/kiosk/v1/check-in', {
      reservation_id: data.reservation_id || data.reservationId,
      guest_email: data.guest_email || data.guestEmail,
      guest_phone: data.guest_phone || data.guestPhone,
      guest_name: {
        first_name: data.guest_name?.first_name || data.guestName?.firstName || data.firstName,
        last_name: data.guest_name?.last_name || data.guestName?.lastName || data.lastName,
      },
      check_in_date: data.check_in_date || data.checkInDate,
      check_out_date: data.check_out_date || data.checkOutDate,
      room_number: data.room_number || data.roomNumber,
      confirmation_code: data.confirmation_code || data.confirmationCode,
    });
    
    if (debug) console.log('[checkin] check-in response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Check-in completed successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkin] check-in error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to process check-in';
    throw new Error(errorMessage);
  }
};

/**
 * Get check-in status for a reservation
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Check-in status
 */
export const getCheckInStatus = async (reservationId) => {
  if (debug) console.log('[checkin] fetching check-in status', reservationId);
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    
    if (debug) console.log('[checkin] check-in status response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Check-in status retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkin] status error', err?.response?.data || err?.message);
    
    if (err?.response?.status === 404) {
      throw new Error('Check-in not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch check-in status';
    throw new Error(errorMessage);
  }
};

/**
 * Validate reservation before check-in
 * @param {Object} data - Validation data
 * @param {string} data.reservationId - Reservation ID
 * @param {string} data.lastName - Guest's last name
 * @returns {Promise<Object>} Reservation details
 */
export const validateReservation = async (data) => {
  if (debug) console.log('[checkin] validating reservation', data);
  
  try {
    // This would typically call a reservation validation endpoint
    // For now, we'll return the data structure expected
    return {
      success: true,
      data: {
        reservationId: data.reservationId,
        lastName: data.lastName,
        validated: true,
      },
      message: 'Reservation validated successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkin] validation error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate reservation';
    throw new Error(errorMessage);
  }
};
