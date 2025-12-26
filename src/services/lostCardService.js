import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
import { translateError } from '../utils/translations';

export const validateLostCardGuest = async (data) => {
  try {
    const { reservationNumber, roomNumber, lastName } = data;

    const reservationResponse = await apiClient.get(`/reservation/${reservationNumber}`);
    const reservation = reservationResponse.data;

    const lastNameLower = lastName?.trim().toLowerCase();
    const reservationLastName = reservation?.primaryGuest?.lastName?.trim().toLowerCase();

    if (!lastNameLower || !reservationLastName || lastNameLower !== reservationLastName) {
      throw new Error(translateError('lastNameMismatch'));
    }

    const assignedRoom = reservation?.unit?.code ?? reservation?.unit?.name ?? reservation?.unit?.id;
    if (roomNumber && assignedRoom && assignedRoom.toLowerCase() !== roomNumber.toLowerCase()) {
      throw new Error(translateError('roomNumberMismatch'));
    }

    return reservationResponse.data;
  } catch (error) {
    if (shouldUseMock(error) && error?.response?.status !== 404) {
      await simulateApiDelay(600);
      return mockData.validateLostCardGuest(data);
    }

    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to validate guest';
    throw new Error(message);
  }
};

export const regenerateLostCard = async (data) => {
  try {
    const response = await apiClient.post('/lost-card/regenerate', data);
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(800);
      return mockData.regenerateLostCard(data);
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

