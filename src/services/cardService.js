import { apiClient } from './api/apiClient';
import { simulateHardwareDelay, simulateApiDelay, mockSuccessResponses, mockErrors } from './mockData';

// Issue new card
export const issueCard = async (data) => {
  try {
    await simulateHardwareDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/cards/issue', data);
    return mockResponse.data;
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

// Validate guest for lost card
export const validateGuest = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/cards/validate-guest', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    // Simulate validation - in real app, this would check against Apaleo
    const isValid = data.roomNumber && data.reservationNumber && data.lastName;
    
    if (!isValid) {
      throw new Error(mockErrors.GUEST_VALIDATION_FAILED.message);
    }
    
    return {
      success: true,
      data: {
        reservationId: data.reservationNumber,
        roomNumber: data.roomNumber,
        guestName: `${data.lastName}`,
        status: 'validated'
      },
      message: 'Guest validated successfully'
    };
  }
};

// Regenerate lost card
export const regenerateCard = async (data) => {
  try {
    await simulateHardwareDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/cards/regenerate', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: {
        cardId: `CARD-${Date.now()}`,
        accessCode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: 'active',
        roomNumber: data.roomNumber,
        reservationId: data.reservationId,
        oldCardDeactivated: true
      },
      message: 'Card regenerated successfully'
    };
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
