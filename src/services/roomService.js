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

const validateChildrenAges = (children) => {
  if (!Array.isArray(children)) return null;
  if (children.length === 0) return null;
  const validAges = children.filter(age => typeof age === 'number' && age > 0 && age <= 17);
  return validAges.length > 0 ? validAges.join(',') : null;
};

const parseOffersResponse = (response) => {
  const offers = response?.data?.data?.offers ?? response?.data?.offers ?? [];
  return {
    success: true,
    property: response?.data?.data?.property ?? null,
    offers,
    totalOffers: offers.length,
  };
};

const createError = (status, errorData) => {
  const message = errorData?.message ?? errorData?.error;
  const isCredentialError = message?.includes('credentials') ? true : message?.includes('Apaleo') ? true : false;
  
  let userMessage = message ?? `Server error (${status})`;
  
  if (status === 500) {
    userMessage = isCredentialError 
      ? 'This property is not configured with Apaleo credentials. Please contact support.'
      : message ?? 'Server error occurred. Please try again later.';
  } else if (status === 400) {
    userMessage = message ?? 'Invalid request parameters. Please check your search criteria.';
  } else if (status === 404) {
    userMessage = 'Property or offers not found.';
  }

  const customError = new Error(userMessage);
  customError.status = status;
  customError.originalError = errorData;
  return customError;
};

export const searchOffers = async (data) => {
  const { organizationId, propertyId, searchParams } = data;
  
  try {
    const childrenParam = validateChildrenAges(searchParams.children);
    const params = {
      apaleo_external_property_id: searchParams.apaleoPropertyId,
      arrival: searchParams.arrival,
      departure: searchParams.departure,
      adults: searchParams.adults,
      ...(childrenParam && { children: childrenParam }),
    };

    const response = await apiClient.get(
      `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/offers`,
      { params }
    );

    return parseOffersResponse(response);
  } catch (error) {
    if (shouldUseMock(error)) {
      await simulateApiDelay(600);
      return mockData.roomAvailability({ 
        arrival: searchParams.arrival, 
        departure: searchParams.departure, 
        adults: searchParams.adults 
      });
    }

    if (!error.response) {
      const message = error.request 
        ? 'Network error. Please check your connection and try again.'
        : `Request failed: ${error.message}`;
      throw new Error(message);
    }

    throw createError(error.response.status, error.response.data);
  }
};