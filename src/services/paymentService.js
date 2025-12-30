import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';
import { translateError } from '../utils/translations';
import usePropertyStore from '../stores/propertyStore';
import { API_CONFIG } from '../config/constants';

const getPropertyIds = () => {
  const state = usePropertyStore.getState();
  const propertyId = state.selectedProperty?.property_id ?? state.propertyId;
  const organizationId = API_CONFIG.ORGANIZATION_ID;
  
  return { propertyId, organizationId };
};

export const processPayment = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/payment', data);
    return response.data;
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

export const getPaymentStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/payment/status/${reservationId}`);
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      return mockData.paymentStatus(reservationId);
    }
    
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
    if (shouldUseMock(err)) {
      return mockData.paymentHistory(params);
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch payment history';
    throw new Error(errorMessage);
  }
};

export const processRefund = async (transactionId, data) => {
  try {
    const response = await apiClient.post(`/api/kiosk/v1/payment/${transactionId}/refund`, data);
    return response.data;
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

export const processPaymentByTerminal = async (reservationId) => {
  const { propertyId, organizationId } = getPropertyIds();
  
  const missingIds = [propertyId, organizationId, reservationId].filter(id => !id);
  if (missingIds.length > 0) {
    throw new Error('Property configuration or reservation ID is missing.');
  }
  
  try {
    const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/reservations/${reservationId}/payments/by-terminal`;
    const response = await apiClient.post(url);
    return response.data;
  } catch (err) {
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to process payment by terminal';
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
