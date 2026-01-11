import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';

/**
 * Process payment by terminal for a reservation
 * POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/payments/by-terminal
 * @param {string} reservationId - Reservation ID
 * @param {Object} paymentData - Payment data (optional)
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Payment response
 */
export const processPaymentByTerminal = async (reservationId, paymentData = {}, propertyId = null, organizationId = null) => {
  if (!reservationId) {
    throw new Error('Reservation ID is required to process payment.');
  }

  // Get property context
  const getPropertyContext = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { propertyId: null, organizationId: null };
      }
      
      const propertyData = localStorage.getItem('kioskProperty');
      if (propertyData) {
        const parsed = JSON.parse(propertyData);
        if (parsed.propertyId && parsed.organizationId) {
          return {
            propertyId: parsed.propertyId,
            organizationId: parsed.organizationId,
          };
        }
      }

      try {
        const propertyStoreData = localStorage.getItem('property-storage');
        if (propertyStoreData) {
          const storeParsed = JSON.parse(propertyStoreData);
          const selectedProperty = storeParsed?.state?.selectedProperty;
          const propId = storeParsed?.state?.propertyId;
          
          if (selectedProperty && propId) {
            const orgId = selectedProperty.organization_id ?? selectedProperty.organizationId;
            if (orgId) {
              return {
                propertyId: propId,
                organizationId: orgId,
              };
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }

      return { propertyId: null, organizationId: null };
    } catch {
      return { propertyId: null, organizationId: null };
    }
  };

  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to process payment.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/payments/by-terminal`;

  console.log('[processPaymentByTerminal] Making API call:', {
    endpoint,
    method: 'POST',
    propertyId: finalPropertyId,
    organizationId: finalOrganizationId,
    reservationId,
    paymentData,
  });

  try {
    const response = await apiClient.post(endpoint, paymentData);
    
    console.log('[processPaymentByTerminal] Success:', {
      status: response.status,
      data: response.data,
    });
    
    return response.data;
  } catch (error) {
    console.error('[processPaymentByTerminal] Error:', {
      endpoint,
      propertyId: finalPropertyId,
      organizationId: finalOrganizationId,
      reservationId,
      error: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    const errorMessage = error?.response?.data?.message ?? 
                         error?.response?.data?.error ?? 
                         error?.response?.statusText ??
                         error?.message ?? 
                         'Failed to process payment';
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
