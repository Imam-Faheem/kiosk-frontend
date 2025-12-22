import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock } from './mockData';
import { normalizeReservationData } from '../lib/checkinUtils';

const isNetworkError = (error) => {
  return !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
};

/**
 * Process check-in for a reservation
 * @param {Object} data - Check-in data
 * @returns {Promise<Object>} Check-in response
 */
export const processCheckIn = async (data) => {
  try {
    const payload = normalizeReservationData(data);

    const response = await apiClient.post('/api/kiosk/v1/check-in', payload);
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: response.data.message ?? 'Check-in completed successfully',
    };
  } catch (err) {
    // Use mock data if network error
    if (shouldUseMock(err)) {
      return mockData.checkIn(data);
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to process check-in';
    throw new Error(errorMessage);
  }
};

/**
 * Get check-in status for a reservation
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Check-in status
 */
export const getCheckInStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    
    return {
      success: true,
      data: response.data.data ?? response.data,
      message: 'Check-in status retrieved successfully',
    };
  } catch (err) {
    // Use mock data if network error
    if (shouldUseMock(err)) {
      return mockData.checkInStatus(reservationId);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Check-in not found');
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch check-in status';
    throw new Error(errorMessage);
  }
};

/**
 * Validate reservation before check-in
 * @param {Object} data - Validation data
 * @param {string} data.reservationId - Reservation ID (KSUID)
 * @param {string} data.lastName - Guest's last name
 * @returns {Promise<Object>} Reservation details
 */
export const validateReservation = async (data) => {
  const reservationId = data.reservationId ?? data.reservation_id;
  const lastName = data.lastName ?? data.last_name;
  
  if (!reservationId) throw new Error('Reservation ID is required');
  if (!lastName) throw new Error('Last name is required');
  
  try {
    const response = await apiClient.get(`/api/kiosk/v1/reservations/${reservationId}`, {
      params: { lastName }
    });
    
    const reservationData = response.data.data ?? response.data;
    
    // Validate that we actually got reservation data
    if (!reservationData || (!reservationData.reservation_id && !reservationData.id)) {
      throw new Error('Invalid reservation data received from server');
    }
    
    return {
      success: true,
      data: reservationData,
      message: response.data.message ?? 'Reservation validated successfully',
    };
  } catch (err) {
    // Always use mock data on network errors (but not for 404/403 which are validation failures)
    if (isNetworkError(err) && err?.response?.status !== 404 && err?.response?.status !== 403) {
      return mockData.reservation(data);
    }
    
    // Also use mock data if shouldUseMock returns true (for other errors)
    if (shouldUseMock(err) && err?.response?.status !== 404 && err?.response?.status !== 403) {
      return mockData.reservation(data);
    }
    
    if (err?.response?.status === 404) {
      throw new Error('Reservation not found. Please check your reservation ID and last name.');
    }
    
    if (err?.response?.status === 403) {
      throw new Error('Invalid last name. Please verify your information.');
    }
    
    const errorMessage = err?.response?.data?.message ?? 
                         err?.response?.data?.error ?? 
                         err?.message ?? 
                         'Failed to validate reservation';
    throw new Error(errorMessage);
  }
};
