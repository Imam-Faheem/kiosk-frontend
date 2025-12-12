import { apiClient } from './api/apiClient';

// Search room availability
export const searchRoomAvailability = async (data) => {
  // Ensure propertyId is sent to backend if configured
  const propertyId = data?.propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER';
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  
  // Map frontend field names to backend API field names
  const arrival = data.checkIn || data.arrival;
  const departure = data.checkOut || data.departure;
  const adults = data.guests || data.adults || 1;
  
  if (debug) console.log('[rooms/availability] request data', { propertyId, arrival, departure, adults });
  
  // Use the working /api/kiosk/offers endpoint with GET method
  const params = {
    propertyId,
    arrival,
    departure,
    adults: Number(adults) || 1,
    channelCode: 'Direct',
    timeSliceTemplate: 'OverNight',
    unitGroupTypes: 'BedRoom',
  };
  
  const response = await apiClient.get('/kiosk/offers', { params });
  let out = response.data;
  if (debug) console.log('[rooms/availability] raw response', out);
  
  // Fetch room types to get images (offers endpoint doesn't include images)
  let roomTypesMap = {};
  try {
    const roomTypesResponse = await apiClient.get('/rooms/types', { params: { propertyId } });
    const roomTypesData = roomTypesResponse.data;
    const roomTypes = roomTypesData?.data || roomTypesData || [];
    if (Array.isArray(roomTypes)) {
      roomTypesMap = roomTypes.reduce((acc, rt) => {
        if (rt.roomTypeId && rt.images) {
          acc[rt.roomTypeId] = rt.images;
        }
        return acc;
      }, {});
      if (debug) console.log('[rooms/availability] room types with images', roomTypesMap);
    }
  } catch (err) {
    if (debug) console.warn('[rooms/availability] failed to fetch room types/images', err?.message);
  }
  
  // The /api/kiosk/offers endpoint returns { property: {...}, offers: [...] } directly
  const offers = out?.offers || [];
  if (Array.isArray(offers) && offers.length > 0) {
    const checkIn = arrival;
    const checkOut = departure;
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const availableRooms = offers.map((offer) => {
      const unitGroup = offer?.unitGroup || {};
      const ratePlan = offer?.ratePlan || {};
      const totalGrossAmount = offer?.totalGrossAmount || {};
      const currency = totalGrossAmount?.currency || ratePlan?.currency || 'EUR';
      const totalPrice = totalGrossAmount?.amount || 0;
      const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;
      const roomTypeId = unitGroup?.id || ratePlan?.unitGroupId || offer?.id;
      
      // Get images from room types map, fallback to unitGroup images if available
      let images = [];
      if (roomTypeId && roomTypesMap[roomTypeId]) {
        images = roomTypesMap[roomTypeId];
      } else if (unitGroup?.images && Array.isArray(unitGroup.images)) {
        images = unitGroup.images.map(img => img?.url || img).filter(Boolean);
      }
      
      return {
        roomTypeId, // unitGroup.id
        unitGroupId: unitGroup?.id || roomTypeId, // For booking
        ratePlanId: ratePlan?.id || null, // For booking
        name: unitGroup?.name || ratePlan?.name || 'Room',
        description: unitGroup?.description || ratePlan?.description || '',
        capacity: unitGroup?.maxPersons || Number(adults) || 1,
        maxGuests: unitGroup?.maxPersons || Number(adults) || 1,
        amenities: (unitGroup?.amenities || []).map(a => (typeof a === 'string' ? a : a?.name)).filter(Boolean),
        images: images.length > 0 ? images : [], // Empty array if no images found
        pricePerNight,
        totalPrice,
        currency,
        available: true,
        // Store original offer data for booking
        _offerData: {
          unitGroupId: unitGroup?.id,
          ratePlanId: ratePlan?.id,
          arrival: offer?.arrival,
          departure: offer?.departure,
        },
      };
    });
    
    const normalized = {
      checkIn,
      checkOut,
      guests: Number(adults),
      availableRooms,
      totalAvailable: availableRooms.length,
    };
    
    const normalizedOut = { 
      success: true, 
      data: normalized, 
      message: `${availableRooms.length} rooms available for selected dates` 
    };
    
    if (debug) console.log('[rooms/availability] normalized from offers', normalizedOut);
    return normalizedOut;
  }

  // Fallback: if backend returns `availableRooms` directly (from /api/rooms/availability endpoint)
  if (out?.data?.availableRooms && Array.isArray(out.data.availableRooms)) {
    if (debug) console.log('[rooms/availability] final response with availableRooms', out);
    return out;
  }

  // If no offers found, return empty result
  const emptyResponse = {
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
  
  if (debug) console.log('[rooms/availability] empty response', emptyResponse);
  return emptyResponse;
};

// Get room details
export const getRoomDetails = async (roomTypeId, propertyIdArg) => {
  const propertyId = propertyIdArg || process.env.REACT_APP_PROPERTY_ID || 'KIOSK_01';
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  try {
    if (debug) console.log('[rooms/details] request', { roomTypeId, propertyId });
    const response = await apiClient.get(`/rooms/${roomTypeId}/details`, { params: { propertyId } });
    if (debug) console.log('[rooms/details] response', response.data);
    return response.data;
  } catch (err) {
    if (debug) console.log('[rooms/details] error', err?.response?.data || err?.message);
    throw err;
  }
};

// Get all room types
export const getAllRoomTypes = async (propertyIdArg) => {
  const propertyId = propertyIdArg || process.env.REACT_APP_PROPERTY_ID || 'KIOSK_01';
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  try {
    if (debug) console.log('[rooms/types] request', { propertyId });
    const response = await apiClient.get('/rooms/types', { params: { propertyId } });
    if (debug) console.log('[rooms/types] response', response.data);
    return response.data;
  } catch (err) {
    if (debug) console.log('[rooms/types] error', err?.response?.data || err?.message);
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
