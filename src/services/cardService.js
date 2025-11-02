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

// Validate guest for lost card using Apaleo API
export const validateGuest = async (data) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[card] validating guest for lost card', data);
  
  try {
    const response = await apiClient.post('/lost-card/validate', {
      reservationNumber: data.reservationNumber,
      roomType: data.roomType,
      lastName: data.lastName,
    });
    
    if (debug) console.log('[card] validation response', response.data);
    
    return response.data;
  } catch (error) {
    if (debug) console.error('[card] validation error', error?.response?.data || error?.message);
    
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to validate guest';
    throw new Error(errorMessage);
  }
};

// Regenerate lost card using backend API
export const regenerateCard = async (data) => {
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  if (debug) console.log('[card] regenerating card', data);
  
  try {
    const response = await apiClient.post('/lost-card/regenerate', {
      reservation_id: data.reservationId || data.reservation_id,
      property_id: data.propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER',
      room_number: data.roomNumber || data.room_number,
    });
    
    if (debug) console.log('[card] regenerate response', response.data);
    
    return response.data;
  } catch (error) {
    if (debug) console.error('[card] regenerate error', error?.response?.data || error?.message);
    
    const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
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
