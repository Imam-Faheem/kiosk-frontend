import { apiClient } from './api/apiClient';

// Search room availability
export const searchRoomAvailability = async (data) => {
  // Ensure propertyId is sent to backend if configured
  const propertyId = process.env.REACT_APP_PROPERTY_ID || 'KIOSK_01';
  const payload = {
    ...data,
    ...(data?.propertyId ? {} : (propertyId ? { propertyId } : {})),
  };
  const debug = String(process.env.REACT_APP_DEBUG_API || '').toLowerCase() === 'true';
  const useMock = String(process.env.REACT_APP_MOCK_ROOMS || '').toLowerCase() === 'true';
  if (debug) console.log('[rooms/availability] request payload', payload);
  const endpoint = useMock ? '/rooms/availability?mock=true' : '/rooms/availability';
  const response = await apiClient.post(endpoint, payload);
  let out = response.data;
  if (debug) console.log('[rooms/availability] raw response', out);
  const inner = out?.data || out;

  // Fallback: if backend returns `offers` instead of `availableRooms`, map it client-side
  if (!inner.availableRooms && Array.isArray(inner.offers)) {
    const checkIn = inner.checkIn || payload.checkIn;
    const checkOut = inner.checkOut || payload.checkOut;
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const availableRooms = inner.offers.map((offer) => {
      const unitGroup = offer?.unitGroup;
      const ratePlan = offer?.ratePlan;
      const amounts = offer?.amounts || {};
      const currency = amounts?.currency || ratePlan?.currency || 'EUR';
      const pricePerNight = amounts?.average?.gross || amounts?.averageGrossAmount || offer?.price?.amount || 0;
      const totalPrice = amounts?.total?.gross || amounts?.totalGrossAmount || (pricePerNight * nights);
      return {
        roomTypeId: unitGroup?.id || ratePlan?.unitGroupId || offer?.id,
        name: unitGroup?.name || ratePlan?.name || 'Room',
        description: unitGroup?.description || ratePlan?.description || '',
        capacity: unitGroup?.maxOccupancy || unitGroup?.maxPersons || Number(payload.guests) || 1,
        maxGuests: unitGroup?.maxOccupancy || unitGroup?.maxPersons || Number(payload.guests) || 1,
        amenities: (unitGroup?.amenities || []).map(a => (typeof a === 'string' ? a : a?.name)).filter(Boolean),
        images: unitGroup?.images?.map(img => img?.url).filter(Boolean) || [],
        pricePerNight,
        totalPrice,
        currency,
        available: true,
      };
    });
    const normalized = {
      checkIn,
      checkOut,
      guests: payload.guests,
      availableRooms,
      totalAvailable: availableRooms.length,
    };
    if (out?.data) {
      out.data = normalized;
      if (debug) console.log('[rooms/availability] normalized from offers', out);
      return out;
    }
    const normalizedOut = { success: true, data: normalized, message: `${availableRooms.length} rooms available for selected dates` };
    if (debug) console.log('[rooms/availability] normalized wrapper from offers', normalizedOut);
    return normalizedOut;
  }

  if (debug) console.log('[rooms/availability] final response', out);
  return out;
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
