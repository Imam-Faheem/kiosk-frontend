import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
 
// Search room availability
export const searchRoomAvailability = async (data) => {
  const getPropertyId = () => {
    if (data?.propertyId) return data.propertyId;
    if (process.env.REACT_APP_PROPERTY_ID) return process.env.REACT_APP_PROPERTY_ID;
    return 'BER';
  };

  const propertyId = getPropertyId();
  
  const arrival = data.checkIn ?? data.arrival;
  const departure = data.checkOut ?? data.departure;
  
  const getAdults = () => {
    if (data.guests) return data.guests;
    if (data.adults) return data.adults;
    return 1;
  };
  const adults = getAdults();
  
  // Use the working /api/kiosk/offers endpoint with GET method
  const params = {
    propertyId,
    arrival,
    departure,
    adults: Number(adults) ? Number(adults) : 1,
    channelCode: 'Direct',
    timeSliceTemplate: 'OverNight',
    unitGroupTypes: 'BedRoom',
  };
  
  try {
    const response = await apiClient.get('/kiosk/offers', { params });
    let out = response.data;
  
    // Fetch room types for images
    const roomTypesMap = {};
    try {
      const { data } = await apiClient.get('/rooms/types', { params: { propertyId } });
      const roomTypes = data?.data ?? data ?? [];
      roomTypes.forEach(rt => {
        if (rt.roomTypeId && rt.images) roomTypesMap[rt.roomTypeId] = rt.images;
      });
    } catch {
      // Continue without images if fetch fails
    }
  
    // Fallback: if backend returns availableRooms directly
    if (out?.data?.availableRooms) return out;

    // Simple helper to get value with fallback
    const get = (obj, ...paths) => {
      for (const path of paths) {
        const value = path.split('.').reduce((o, p) => o?.[p], obj);
        if (value !== undefined && value !== null) return value;
      }
      return null;
    };

    const offers = out?.offers ?? [];
    if (!offers.length) {
      return {
        success: true,
        data: { checkIn: arrival, checkOut: departure, guests: Number(adults), availableRooms: [], totalAvailable: 0 },
        message: 'No rooms available for selected dates',
      };
    }

    const nights = Math.max(1, Math.ceil((new Date(departure) - new Date(arrival)) / 86400000));
    const availableRooms = offers.map(offer => {
      const ug = offer?.unitGroup ?? {};
      const rp = offer?.ratePlan ?? {};
      const price = offer?.totalGrossAmount ?? {};
      
      const getRoomTypeId = () => {
        const ugId = get(ug, 'id');
        if (ugId) return ugId;
        const rpId = get(rp, 'unitGroupId');
        if (rpId) return rpId;
        return offer?.id;
      };
      const roomTypeId = getRoomTypeId();
      
      const totalPrice = price?.amount ?? 0;
      
      const getImages = () => {
        if (roomTypesMap[roomTypeId]) return roomTypesMap[roomTypeId];
        const ugImages = ug?.images?.map(img => img?.url ?? img).filter(Boolean);
        return ugImages ?? [];
      };
      const images = getImages();

      const getName = () => {
        if (ug?.name) return ug.name;
        if (rp?.name) return rp.name;
        return 'Room';
      };

      const getDescription = () => {
        return ug?.description ?? rp?.description ?? '';
      };

      const getCapacity = () => {
        if (ug?.maxPersons) return ug.maxPersons;
        if (adults) return adults;
        return 1;
      };

      const getCurrency = () => {
        if (price?.currency) return price.currency;
        if (rp?.currency) return rp.currency;
        return 'EUR';
      };

      return {
        roomTypeId,
        unitGroupId: ug?.id ?? roomTypeId,
        ratePlanId: rp?.id ?? null,
        name: getName(),
        description: getDescription(),
        capacity: getCapacity(),
        maxGuests: getCapacity(),
        amenities: (ug?.amenities ?? []).map(a => typeof a === 'string' ? a : a?.name).filter(Boolean),
        images,
        pricePerNight: nights > 0 ? totalPrice / nights : totalPrice,
        totalPrice,
        currency: getCurrency(),
        available: true,
        _offerData: { unitGroupId: ug?.id, ratePlanId: rp?.id, arrival: offer?.arrival, departure: offer?.departure },
      };
    });

    return {
      success: true,
      data: { checkIn: arrival, checkOut: departure, guests: Number(adults), availableRooms, totalAvailable: availableRooms.length },
      message: `${availableRooms.length} rooms available for selected dates`,
    };
  } catch (err) {
    // Use mock data if network error or API fails
    if (shouldUseMock(err)) {
      await simulateApiDelay(600);
      return mockData.roomAvailability(data);
    }
    
    const getErrorMessage = () => {
      if (err?.response?.data?.message) return err.response.data.message;
      if (err?.response?.data?.error) return err.response.data.error;
      if (err?.message) return err.message;
      return 'Failed to search room availability';
    };
    throw new Error(getErrorMessage());
  }
};

// Get room details
export const getRoomDetails = async (roomTypeId, propertyIdArg) => {
  const getPropertyId = () => {
    if (propertyIdArg) return propertyIdArg;
    if (process.env.REACT_APP_PROPERTY_ID) return process.env.REACT_APP_PROPERTY_ID;
    return 'KIOSK_01';
  };
  const propertyId = getPropertyId();
  try {
    const response = await apiClient.get(`/rooms/${roomTypeId}/details`, { params: { propertyId } });
    return response.data;
  } catch (err) {
    // Use mock data if network error or API fails
    if (shouldUseMock(err)) {
      await simulateApiDelay(400);
      return mockData.roomDetails(roomTypeId);
    }
    throw err;
  }
};

// Get all room types
export const getAllRoomTypes = async (propertyIdArg) => {
  const getPropertyId = () => {
    if (propertyIdArg) return propertyIdArg;
    if (process.env.REACT_APP_PROPERTY_ID) return process.env.REACT_APP_PROPERTY_ID;
    return 'KIOSK_01';
  };
  const propertyId = getPropertyId();
  try {
    const response = await apiClient.get('/rooms/types', { params: { propertyId } });
    return response.data;
  } catch (err) {
    // Use mock data if network error or API fails
    if (shouldUseMock(err)) {
      await simulateApiDelay(400);
      return mockData.roomTypes();
    }
    throw err;
  }
};

// Calculate room pricing
export const calculateRoomPricing = (room, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const basePrice = room.basePrice * nights;
  const taxRate = 0.1; // 10% tax
  const serviceFee = 15.00;
  const cleaningFee = 25.00;
  
  const subtotal = basePrice;
  const tax = subtotal * taxRate;
  const total = subtotal + tax + serviceFee + cleaningFee;
  
  return {
    basePrice: room.basePrice,
    nights,
    subtotal,
    tax,
    serviceFee,
    cleaningFee,
    total,
    currency: room.currency
  };
};
