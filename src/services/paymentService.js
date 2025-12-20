import { apiClient } from './api/apiClient';
import { API_CONFIG } from '../config/constants';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

/**
 * Process payment for a reservation
 * @param {Object} data - Payment data
 * @param {string} data.reservation_id - Reservation ID (KSUID)
 * @param {number} data.amount - Payment amount
 * @param {string} data.currency - Currency code (e.g., "USD")
 * @param {Object} data.payment_method - Payment method object
 * @param {string} data.payment_method.type - Payment method type ("card" or "other")
 * @param {string} data.payment_method.card_last4 - Last 4 digits of card (required if type is "card")
 * @param {string} data.payment_method.card_brand - Card brand ("visa", "mastercard", "amex", "discover") (required if type is "card")
 * @param {string} data.description - Payment description
 * @param {Object} data.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Payment response
 */
export const processPayment = async (data) => {
  if (debug) console.log('[payment] processing payment', data);
  
  try {
    const requestBody = {
      reservation_id: data.reservation_id || data.reservationId,
      amount: data.amount,
      currency: data.currency || 'USD',
      payment_method: {
        type: data.payment_method?.type || data.paymentMethod?.type || 'card',
      },
      description: data.description || 'Room charges and taxes',
    };

    // Add card details if payment method is card
    if (requestBody.payment_method.type === 'card') {
      requestBody.payment_method.card_last4 = data.payment_method?.card_last4 || 
                                              data.paymentMethod?.cardLast4 || 
                                              data.cardLast4;
      requestBody.payment_method.card_brand = data.payment_method?.card_brand || 
                                             data.paymentMethod?.cardBrand || 
                                             data.cardBrand || 
                                             'visa';
    }

    // Add metadata if provided
    if (data.metadata) {
      requestBody.metadata = data.metadata;
    }

    const response = await apiClient.post('/api/kiosk/v1/payment', requestBody);
    
    if (debug) console.log('[payment] payment response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Payment processed successfully',
    };
  } catch (err) {
    if (debug) console.error('[payment] payment error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to process payment';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment status for a reservation
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (reservationId) => {
  if (debug) console.log('[payment] fetching payment status', reservationId);
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/payment/status/${reservationId}`);
    
    if (debug) console.log('[payment] payment status response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Payment status retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[payment] status error', err?.response?.data || err?.message);
    
    if (err?.response?.status === 404) {
      throw new Error('Payment status not found');
    }
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch payment status';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment history for a reservation
 * @param {Object} params - Query parameters
 * @param {string} params.reservationId - Reservation ID (optional)
 * @param {number} params.page - Page number (optional)
 * @param {number} params.limit - Items per page (optional)
 * @returns {Promise<Object>} Payment history
 */
export const getPaymentHistory = async (params = {}) => {
  if (debug) console.log('[payment] fetching payment history', params);
  
  try {
    const queryParams = {};
    if (params.reservationId) queryParams.reservationId = params.reservationId;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const response = await apiClient.get('/api/kiosk/v1/payment/history', { params: queryParams });
    
    if (debug) console.log('[payment] payment history response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
      message: 'Payment history retrieved successfully',
    };
  } catch (err) {
    if (debug) console.error('[payment] history error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch payment history';
    throw new Error(errorMessage);
  }
};

/**
 * Process refund for a payment
 * @param {string} transactionId - Transaction ID
 * @param {Object} data - Refund data
 * @param {number} data.amount - Refund amount
 * @param {string} data.currency - Currency code
 * @param {string} data.reason - Refund reason
 * @returns {Promise<Object>} Refund response
 */
export const processRefund = async (transactionId, data) => {
  if (debug) console.log('[payment] processing refund', { transactionId, data });
  
  try {
    const response = await apiClient.post(`/api/kiosk/v1/payment/${transactionId}/refund`, {
      amount: data.amount,
      currency: data.currency || 'USD',
      reason: data.reason || 'Refund request',
    });
    
    if (debug) console.log('[payment] refund response', response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Refund processed successfully',
    };
  } catch (err) {
    if (debug) console.error('[payment] refund error', err?.response?.data || err?.message);
    
    const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Failed to process refund';
    throw new Error(errorMessage);
  }
};

// Legacy function names for backward compatibility
export const checkPaymentStatus = getPaymentStatus;
export const initiatePayment = processPayment;
export const pollPaymentStatus = getPaymentStatus;
