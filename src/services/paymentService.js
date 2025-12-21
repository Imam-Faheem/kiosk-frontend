import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';

// Helper to normalize payment data
const normalizePaymentData = (data) => {
  const requestBody = {
    reservation_id: data.reservation_id ?? data.reservationId,
    amount: data.amount,
    currency: data.currency ?? 'USD',
    payment_method: {
      type: data.payment_method?.type ?? data.paymentMethod?.type ?? 'card',
    },
    description: data.description ?? 'Room charges and taxes',
  };
  if (requestBody.payment_method.type === 'card') {
    requestBody.payment_method.card_last4 = data.payment_method?.card_last4 ?? 
                                            data.paymentMethod?.cardLast4 ?? 
                                            data.cardLast4;
    requestBody.payment_method.card_brand = data.payment_method?.card_brand ?? 
                                           data.paymentMethod?.cardBrand ?? 
                                           data.cardBrand ?? 
                                           'visa';
  }
  if (data.metadata) requestBody.metadata = data.metadata;
  return requestBody;
};

/**
 * Process payment for a reservation
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Payment response
 */
export const processPayment = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/payment', normalizePaymentData(data));
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: response.data.message ?? 'Payment processed successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.payment(data);
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
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
  try {
    const response = await apiClient.get(`/api/kiosk/v1/payment/status/${reservationId}`);
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: 'Payment status retrieved successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.paymentStatus(reservationId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Payment status not found');
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch payment status';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment history for a reservation
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Payment history
 */
export const getPaymentHistory = async (params = {}) => {
  try {
    const queryParams = {};
    if (params.reservationId) queryParams.reservationId = params.reservationId;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const response = await apiClient.get('/api/kiosk/v1/payment/history', { params: queryParams });
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      pagination: response.data.pagination,
      message: 'Payment history retrieved successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.paymentHistory(params);
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch payment history';
    throw new Error(errorMessage);
  }
};

/**
 * Process refund for a payment
 * @param {string} transactionId - Transaction ID
 * @param {Object} data - Refund data
 * @returns {Promise<Object>} Refund response
 */
export const processRefund = async (transactionId, data) => {
  try {
    const response = await apiClient.post(`/api/kiosk/v1/payment/${transactionId}/refund`, {
      amount: data.amount,
      currency: data.currency ?? 'USD',
      reason: data.reason ?? 'Refund request',
    });
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: response.data.message ?? 'Refund processed successfully',
    };
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.refund(transactionId, data);
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to process refund';
    throw new Error(errorMessage);
  }
};

// Legacy function names for backward compatibility
export const checkPaymentStatus = getPaymentStatus;
export const initiatePayment = processPayment;
export const pollPaymentStatus = getPaymentStatus;
