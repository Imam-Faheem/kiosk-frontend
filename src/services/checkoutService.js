import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';

/**
 * Process checkout for a reservation
 * @param {Object} data - Checkout data
 * @returns {Promise<Object>} Checkout response
 */
export const processCheckout = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/checkout', data);
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.checkout(data);
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
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
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.checkoutStatus(reservationId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Checkout not found');
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch checkout status';
    throw new Error(errorMessage);
  }
};

