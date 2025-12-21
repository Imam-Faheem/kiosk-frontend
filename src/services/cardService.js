import { apiClient } from './api/apiClient';
import { simulateHardwareDelay, simulateApiDelay } from './mockData';

// Issue new card
export const issueCard = async (data) => {
  try {
    await simulateHardwareDelay();
    
    // Mock implementation - in real app, this would call your backend
    const response = await apiClient.post('/cards/issue', data);
    return response.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: {
        cardId: `CARD-${Date.now()}`,
        accessCode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'active',
        roomNumber: data.roomNumber,
        reservationId: data.reservationId
      },
      message: 'Card issued successfully'
    };
  }
};

// Validate guest for lost card using Apaleo API
export const validateGuest = async (data) => {
  try {
    const response = await apiClient.post('/lost-card/validate', {
      reservationNumber: data.reservationNumber,
      roomType: data.roomType,
      lastName: data.lastName,
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to validate guest';
    throw new Error(errorMessage);
  }
};

// Regenerate lost card using backend API
export const regenerateCard = async (data) => {
  try {
    const response = await apiClient.post('/lost-card/regenerate', {
      reservation_id: data.reservationId || data.reservation_id,
      property_id: data.propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER',
      room_number: data.roomNumber || data.room_number,
    });
    
    return response.data;
  } catch (error) {
    // Handle network errors with more detail
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
      }
      if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw new Error(error.message || 'Network error. Please check your connection.');
    }
    
    // Handle HTTP error responses
    const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.response?.statusText ||
                         error?.message || 
                         'Failed to regenerate card';
    throw new Error(errorMessage);
  }
};

// Get card status
export const getCardStatus = async (cardId) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get(`/cards/${cardId}/status`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: {
        cardId,
        status: 'active',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }
};
