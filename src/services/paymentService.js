import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import usePropertyStore from '../stores/propertyStore';
import { API_CONFIG } from '../config/constants';

const getPropertyIds = () => {
  const state = usePropertyStore.getState();
  const propertyId = state.selectedProperty?.property_id ?? state.propertyId;
  const organizationId = API_CONFIG.ORGANIZATION_ID;
  
  return { propertyId, organizationId };
};

/**
 * Process payment for a reservation
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Payment response
 */
export const processPayment = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/payment', data);
    return response.data;
  } catch (err) {
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
    return response.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new Error(translateError('paymentStatusNotFound'));
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? translateError('generic');
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
    return response.data;
  } catch (err) {
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
    const response = await apiClient.post(`/api/kiosk/v1/payment/${transactionId}/refund`, data);
    return response.data;
  } catch (err) {
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to process refund';
    throw new Error(errorMessage);
  }
};

/**
 * Get payment account details
 * @param {string} paymentAccountId - Payment account ID
 * @returns {Promise<Object>} Payment account response
 */
export const getPaymentAccount = async (paymentAccountId) => {
  if (!paymentAccountId) {
    throw new Error('Payment account ID is required.');
  }
  try {
    const response = await apiClient.get(`/api/kiosk/v1/payment-accounts/${paymentAccountId}`);
    return response.data;
  } catch (err) {
    const errorMessage = err?.response?.data?.message ??
                         err?.response?.data?.error ??
                         err?.message ??
                         'Failed to fetch payment account';
    throw new Error(errorMessage);
  }
};

// Legacy function names for backward compatibility
export const checkPaymentStatus = getPaymentStatus;
export const initiatePayment = processPayment;
export const pollPaymentStatus = getPaymentStatus;
