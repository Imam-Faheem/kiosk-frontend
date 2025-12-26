import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';

/**
 * Search for available rooms
 * @param {Object} data - Search parameters
 * @param {string} data.checkIn - Check-in date
 * @param {string} data.checkOut - Check-out date
 * @param {number} data.guests - Number of guests
 * @param {string} [data.propertyId] - Optional property ID override
 * @returns {Promise<Object>} Available rooms response
 */
export const searchRoomAvailability = async (data) => {
  const params = {
    propertyId: data.propertyId,
    arrival: data.arrival,
    departure: data.departure,
    adults: Number(data.adults) || 1, // Number() can return 0, so || is correct here
    channelCode: 'Direct',
    timeSliceTemplate: 'OverNight',
    unitGroupTypes: 'BedRoom',
  };

  try {
    const response = await apiClient.get('/kiosk/offers', { params });
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(600);
      return mockData.roomAvailability(data);
    }

    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      'Failed to search room availability';
    throw new Error(errorMessage);
  }
};

export const getRoomDetails = async (roomTypeId, propertyId) => {
  try {
    const response = await apiClient.get(`/rooms/${roomTypeId}/details`, {
      params: { propertyId },
    });
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(400);
      return mockData.roomDetails(roomTypeId);
    }
    throw error;
  }
};

export const getAllRoomTypes = async (propertyId) => {
  try {
    const response = await apiClient.get('/rooms/types', {
      params: { propertyId },
    });
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(400);
      return mockData.roomTypes();
    }
    throw error;
  }
};

export const calculateRoomPricing = (room, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const basePrice = room.basePrice * nights;
  const subtotal = basePrice;
  const tax = subtotal * 0.1;
  const total = subtotal + tax + 15.00 + 25.00;

  return {
    basePrice: room.basePrice,
    nights,
    subtotal,
    tax,
    serviceFee: 15.00,
    cleaningFee: 25.00,
    total,
    currency: room.currency ?? 'EUR',
  };
};
