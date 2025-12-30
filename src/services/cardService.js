import { apiClient } from './api/apiClient';
import { simulateHardwareDelay, simulateApiDelay, mockData, shouldUseMock } from './mockData';
import { translateError } from '../utils/translations';

export const issueCard = async (data) => {
  try {
    await simulateHardwareDelay();
    const response = await apiClient.post('/cards/issue', data);
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: {
        cardId: `CARD-${Date.now()}`,
        accessCode: `AC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'active',
        roomNumber: data.roomNumber,
        reservationId: data.reservationId,
      },
      message: 'Card issued successfully',
    };
  }
};

export const validateGuest = async (data) => {
  try {
    const response = await apiClient.post('/lost-card/validate', {
      reservationNumber: data.reservationNumber,
      roomType: data.roomType,
      lastName: data.lastName,
    });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ?? error?.message ?? 'Failed to validate guest';
    throw new Error(message);
  }
};

export const regenerateCard = async (data) => {
  try {
    const response = await apiClient.post('/lost-card/regenerate', data);
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(800);
      return mockData.regenerateLostCard(data);
    }

    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error(translateError('cannotConnectToServer'));
      }
      if (error.code === 'ETIMEDOUT') {
        throw new Error(translateError('requestTimedOut'));
      }
      throw new Error(translateError('networkError'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

export const getCardStatus = async (cardId) => {
  try {
    await simulateApiDelay();
    const response = await apiClient.get(`/cards/${cardId}/status`);
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: {
        cardId,
        status: 'active',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }
};
