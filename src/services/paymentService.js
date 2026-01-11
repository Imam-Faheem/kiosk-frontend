import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import { getPropertyContext } from '../utils/storage';

/**
 * Process payment by terminal for a reservation.
 *
 * POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/payments/by-terminal
 */
export const processPaymentByTerminal = async (reservationId, paymentData = {}) => {
  if (!reservationId) {
    throw new Error('Reservation ID is required for terminal payment.');
  }

  const context = getPropertyContext();
  const propertyId = paymentData.propertyId ?? context.propertyId;
  const organizationId = paymentData.organizationId ?? context.organizationId;

  if (!propertyId || !organizationId) {
    throw new Error('Property ID and Organization ID are required for terminal payment.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/reservations/${reservationId}/payments/by-terminal`;
  const body = {
    ...(paymentData.amount !== undefined && { amount: paymentData.amount }),
    ...(paymentData.currency && { currency: paymentData.currency }),
  };

  try {
    const response = await apiClient.post(endpoint, body);
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message
      ?? error?.response?.data?.error
      ?? error?.message
      ?? 'Failed to process payment by terminal';
    throw new Error(errorMessage);
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use processPaymentByTerminal instead
 */
export const processPayment = async (data) => {
  const reservationId = data?.reservationId ?? data?.reservation_id ?? data?.id;
  if (!reservationId) {
    throw new Error('Reservation ID is required in payment data.');
  }
  return processPaymentByTerminal(reservationId, data);
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
