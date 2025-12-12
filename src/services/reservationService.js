import { apiClient } from './api/apiClient';
import { simulateApiDelay, mockReservations, mockSuccessResponses, mockErrors } from './mockData';
import { validateReservation as validateReservationApaleo } from './checkinService';

const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';

// Validate reservation for check-in using Apaleo API
export const validateReservation = async (data) => {
  if (debug) console.log('[reservation] validating reservation', data);
  
  try {
    // Use Apaleo API to validate reservation
    return await validateReservationApaleo(data);
  } catch (error) {
    if (debug) console.error('[reservation] validation error', error?.message);
    throw error;
  }
};

// Create new reservation
export const createReservation = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/reservations/create', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const newReservation = {
      id: `RES-${Date.now()}`,
      reservationId: `RES-${Date.now()}`,
      ...data,
      status: 'confirmed',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newReservation,
      message: 'Reservation created successfully'
    };
  }
};

// Get reservation by ID
export const getReservationById = async (reservationId) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get(`/reservations/${reservationId}`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const reservation = mockReservations.find(r => r.reservationId === reservationId);
    
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    
    return {
      success: true,
      data: reservation,
      message: 'Reservation retrieved successfully'
    };
  }
};

// Update reservation
export const updateReservation = async (reservationId, data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.put(`/reservations/${reservationId}`, data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: { ...data, id: reservationId },
      message: 'Reservation updated successfully'
    };
  }
};

// Cancel reservation
export const cancelReservation = async (reservationId) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.delete(`/reservations/${reservationId}`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: { reservationId, status: 'cancelled' },
      message: 'Reservation cancelled successfully'
    };
  }
};

// Search reservations
export const searchReservations = async (params) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get('/reservations/search', { params });
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: mockReservations,
      message: 'Reservations retrieved successfully'
    };
  }
};

// Legacy function for backward compatibility
export const fetchReservations = async () => {
  return searchReservations();
};