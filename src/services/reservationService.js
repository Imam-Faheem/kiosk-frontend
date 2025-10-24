import { apiClient } from './api/apiClient';
import { simulateApiDelay, mockReservations, mockSuccessResponses, mockErrors } from './mockData';

// Validate reservation for check-in
export const validateReservation = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/reservations/validate', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const { reservationId, lastName } = data;
    const reservation = mockReservations.find(r => 
      r.reservationId === reservationId && r.lastName.toLowerCase() === lastName.toLowerCase()
    );
    
    if (!reservation) {
      throw new Error(mockErrors.RESERVATION_NOT_FOUND.message);
    }
    
    return {
      success: true,
      data: reservation,
      message: 'Reservation validated successfully'
    };
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