import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
import usePropertyStore from '../stores/propertyStore';

const MILLISECONDS_PER_DAY = 86400000;

const extractNestedValue = (obj, ...paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((current, prop) => current?.[prop], obj);
    if (value !== undefined && value !== null) return value;
  }
  return null;
};

const transformOfferToRoom = (offer, roomTypesMap, adults, nights) => {
  const unitGroup = offer?.unitGroup ?? {};
  const ratePlan = offer?.ratePlan ?? {};
  const price = offer?.totalGrossAmount ?? {};

  const roomTypeId = extractNestedValue(unitGroup, 'id') ??
                     extractNestedValue(ratePlan, 'unitGroupId') ??
                     offer?.id;

  const totalPrice = price?.amount ?? 0;
  const images = roomTypesMap[roomTypeId] ?? 
                 (Array.isArray(unitGroup?.images) ? unitGroup.images.map(img => typeof img === 'string' ? img : img?.url).filter(Boolean) : []) ?? [];

  return {
    roomTypeId,
    unitGroupId: unitGroup?.id ?? roomTypeId,
    ratePlanId: ratePlan?.id ?? null,
    name: unitGroup?.name ?? ratePlan?.name ?? 'Room',
    description: unitGroup?.description ?? ratePlan?.description ?? '',
    capacity: unitGroup?.maxPersons ?? adults ?? 1,
    maxGuests: unitGroup?.maxPersons ?? adults ?? 1,
    amenities: Array.isArray(unitGroup?.amenities) ? unitGroup.amenities.map(a => typeof a === 'string' ? a : a?.name).filter(Boolean) : [],
    images,
    pricePerNight: nights > 0 ? totalPrice / nights : totalPrice,
    totalPrice,
    currency: price?.currency ?? ratePlan?.currency ?? 'EUR',
    available: true,
    _offerData: {
      unitGroupId: unitGroup?.id,
      ratePlanId: ratePlan?.id,
      arrival: offer?.arrival,
      departure: offer?.departure,
    },
  };
};

const fetchRoomTypeImages = async (propertyId) => {
  const roomTypesMap = {};
  try {
    const { data } = await apiClient.get('/rooms/types', { params: { propertyId } });
    const roomTypes = data?.data ?? data ?? [];
    roomTypes.forEach((roomType) => {
      if (roomType.roomTypeId && roomType.images) {
        roomTypesMap[roomType.roomTypeId] = roomType.images;
      }
    });
  } catch {
    // Continue without images if fetch fails
  }
  return roomTypesMap;
};

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
  const propertyId = data?.propertyId ?? usePropertyStore.getState().propertyId ?? process.env.REACT_APP_PROPERTY_ID ?? 'BER';
  const arrival = data.checkIn ?? data.arrival;
  const departure = data.checkOut ?? data.departure;
  const adults = data.guests ?? data.adults ?? 1;

  const params = {
    propertyId,
    arrival,
    departure,
    adults: Number(adults) || 1, // Number() can return 0, so || is correct here
    channelCode: 'Direct',
    timeSliceTemplate: 'OverNight',
    unitGroupTypes: 'BedRoom',
  };

  try {
    const response = await apiClient.get('/kiosk/offers', { params });
    const responseData = response.data;

    // If backend returns availableRooms directly, return as-is
    if (responseData?.data?.availableRooms) {
      return responseData;
    }

    // Fetch room type images
    const roomTypesMap = await fetchRoomTypeImages(propertyId);

    const offers = responseData?.offers ?? [];
    if (offers.length === 0) {
      return {
        success: true,
        data: {
          checkIn: arrival,
          checkOut: departure,
          guests: Number(adults),
          availableRooms: [],
          totalAvailable: 0,
        },
        message: 'No rooms available for selected dates',
      };
    }

    const nights = Math.max(1, Math.ceil((new Date(departure) - new Date(arrival)) / MILLISECONDS_PER_DAY));
    const availableRooms = offers.map((offer) => transformOfferToRoom(offer, roomTypesMap, adults, nights));

    return {
      success: true,
      data: {
        checkIn: arrival,
        checkOut: departure,
        guests: Number(adults),
        availableRooms,
        totalAvailable: availableRooms.length,
      },
      message: `${availableRooms.length} rooms available for selected dates`,
    };
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

export const getRoomDetails = async (roomTypeId, propertyId = null) => {
  const finalPropertyId = propertyId ?? usePropertyStore.getState().propertyId ?? process.env.REACT_APP_PROPERTY_ID ?? 'BER';
  try {
    const response = await apiClient.get(`/rooms/${roomTypeId}/details`, {
      params: { propertyId: finalPropertyId },
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

export const getAllRoomTypes = async (propertyId = null) => {
  const finalPropertyId = propertyId ?? usePropertyStore.getState().propertyId ?? process.env.REACT_APP_PROPERTY_ID ?? 'BER';
  try {
    const response = await apiClient.get('/rooms/types', {
      params: { propertyId: finalPropertyId },
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
