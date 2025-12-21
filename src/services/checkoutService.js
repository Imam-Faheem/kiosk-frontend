import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

// Helper to normalize checkout data
const normalizeCheckoutData = (data) => {
  const requestBody = {
    reservation_id: data.reservation_id || data.reservationId,
    room_number: data.room_number || data.roomNumber,
    final_bill_amount: data.final_bill_amount || data.finalBillAmount,
    payment_status: data.payment_status || data.paymentStatus || 'completed',
  };
  if (data.guest_email || data.guestEmail) requestBody.guest_email = data.guest_email || data.guestEmail;
  if (data.check_out_date || data.checkOutDate) requestBody.check_out_date = data.check_out_date || data.checkOutDate;
  return requestBody;
};

/**
 * Process checkout for a reservation
 * @param {Object} data - Checkout data
 * @returns {Promise<Object>} Checkout response
 */
export const processCheckout = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/checkout', normalizeCheckoutData(data));
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Checkout completed successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.checkout(data);
    }
    
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
  try {
    const response = await apiClient.get(`/api/kiosk/v1/checkout/${reservationId}/status`);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Checkout status retrieved successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.checkoutStatus(reservationId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Checkout not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch checkout status';
    throw new Error(errorMessage);
  }
};

