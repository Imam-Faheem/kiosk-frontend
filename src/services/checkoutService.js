import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Process checkout for a reservation
 * @param {Object} data - Checkout data
 * @param {string} data.reservation_id - Reservation ID (KSUID)
 * @param {string} data.room_number - Room number
 * @param {number} data.final_bill_amount - Final bill amount
 * @param {string} data.payment_status - Payment status (paid, pending, unpaid, completed)
 * @param {string} data.guest_email - Guest email (optional)
 * @param {string} data.check_out_date - Check-out date (ISO 8601, optional)
 * @returns {Promise<Object>} Checkout response
 */
export const processCheckout = async (data) => {
  if (debug) console.log('[checkout] processing checkout', data);
  
  try {
    const requestBody = {
      reservation_id: data.reservation_id || data.reservationId,
      room_number: data.room_number || data.roomNumber,
      final_bill_amount: data.final_bill_amount || data.finalBillAmount,
      payment_status: data.payment_status || data.paymentStatus || 'completed',
    };

    // Add optional fields if provided
    if (data.guest_email || data.guestEmail) {
      requestBody.guest_email = data.guest_email || data.guestEmail;
    }
    if (data.check_out_date || data.checkOutDate) {
      requestBody.check_out_date = data.check_out_date || data.checkOutDate;
    }

    const response = await apiClient.post('/api/kiosk/v1/checkout', requestBody);
    
    if (debug) console.log('[checkout] checkout response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Checkout completed successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkout] checkout error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to process checkout';
    throw new Error(errorMessage);
  }
};

/**
 * Get checkout status for a reservation
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Checkout status
 */
export const getCheckoutStatus = async (reservationId) => {
  if (debug) console.log('[checkout] fetching checkout status', reservationId);
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/checkout/${reservationId}/status`);
    
    if (debug) console.log('[checkout] checkout status response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Checkout status retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[checkout] status error', err?.response?.data || err?.message);
    
    if (err?.response?.status === 404) {
      throw new Error('Checkout not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch checkout status';
    throw new Error(errorMessage);
  }
};

