import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';

// Mock data helpers - optional fallback
let mockData, shouldUseMock;
try {
  const mockModule = require('./mockData');
  mockData = mockModule.mockData;
  shouldUseMock = mockModule.shouldUseMock;
} catch (e) {
  shouldUseMock = () => false;
  mockData = { checkIn: () => ({}), checkInStatus: () => ({}), reservation: () => ({ success: false }) };
}

export const processCheckIn = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/check-in', data);
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      return mockData.checkIn(data);
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                         'Failed to process check-in';
    throw new Error(message);
  }
};

export const getCheckInStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      return mockData.checkInStatus(reservationId);
    }
    
    if (error?.response?.status === 404) {
      throw new Error(translateError('checkinNotFound'));
    }
    
    const message = error?.response?.data?.message ?? error?.message ?? translateError('generic');
    throw new Error(message);
  }
};

export const validateReservation = async (data) => {
  const { reservationId, lastName } = data;
  
  if (!reservationId) {
    throw new Error(translateError('reservationIdRequired'));
  }
  if (!lastName) {
    throw new Error(translateError('lastNameRequired'));
  }
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/reservations/${reservationId}`, {
      params: { lastName },
    });
    return response.data;
  } catch (error) {
    const isNetworkError = !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
    const isValidationError = error?.response?.status === 404 || error?.response?.status === 403;

    if ((isNetworkError || shouldUseMock(error)) && !isValidationError) {
      return mockData.reservation(data);
    }
    
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFound'));
    }
    
    if (error?.response?.status === 403) {
      throw new Error(translateError('invalidLastName'));
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('generic');
    throw new Error(message);
  }
};
