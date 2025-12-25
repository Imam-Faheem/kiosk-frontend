import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';

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
      throw new Error('Check-in not found');
    }
    
    const message = error?.response?.data?.message ?? error?.message ?? 'Failed to fetch check-in status';
    throw new Error(message);
  }
};

export const validateReservation = async (data) => {
  const { reservationId, lastName } = data;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required');
  }
  if (!lastName) {
    throw new Error('Last name is required');
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
      throw new Error('Reservation not found. Please check your reservation ID and last name.');
    }
    
    if (error?.response?.status === 403) {
      throw new Error('Invalid last name. Please verify your information.');
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                         'Failed to validate reservation';
    throw new Error(message);
  }
};
