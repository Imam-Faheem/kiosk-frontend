import { apiClient } from './api/apiClient';

/**
 * Get property and organization IDs from localStorage and property store
 * This function is called lazily (only when needed) to avoid initialization issues
 * @returns {Object} Property context with propertyId, organizationId, and apaleo_external_property_id
 */
const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: null, apaleoExternalPropertyId: null };
    }
    
    // Use string literal to avoid importing from constants (prevents circular dependencies)
    const propertyData = localStorage.getItem('kioskProperty');
    if (!propertyData) {
      return { propertyId: null, organizationId: null, apaleoExternalPropertyId: null };
    }

    const parsed = JSON.parse(propertyData);
    
    // Get apaleo_external_property_id from selectedProperty if available
    let apaleoExternalPropertyId = null;
    try {
      // Try to get from property-storage (Zustand store)
      const propertyStoreData = localStorage.getItem('property-storage');
      if (propertyStoreData) {
        const storeParsed = JSON.parse(propertyStoreData);
        const selectedProperty = storeParsed?.state?.selectedProperty;
        if (selectedProperty) {
          // Try various possible field names for the external property ID
          apaleoExternalPropertyId = 
            selectedProperty.apaleo_external_property_id ||
            selectedProperty.external_property_id ||
            selectedProperty.externalId ||
            selectedProperty.external_id ||
            selectedProperty.code ||
            selectedProperty.property_code ||
            selectedProperty.apaleoPropertyId ||
            null;
        }
      }
    } catch (e) {
      // Ignore errors when reading property store
      console.warn('Could not read apaleo_external_property_id from property store:', e);
    }

    return {
      propertyId: parsed.propertyId ?? null,
      organizationId: parsed.organizationId ?? (typeof process !== 'undefined' && process.env?.REACT_APP_ORGANIZATION_ID) ?? null,
      apaleoExternalPropertyId,
    };
  } catch {
    return { propertyId: null, organizationId: null, apaleoExternalPropertyId: null };
  }
};

/**
 * Search for available rooms
 * @param {Object} data - Search parameters
 * @param {string} data.arrival - Check-in date (YYYY-MM-DD)
 * @param {string} data.departure - Check-out date (YYYY-MM-DD)
 * @param {number} data.adults - Number of adults
 * @param {string} [data.propertyId] - Optional property ID override
 * @returns {Promise<Object>} Available rooms response
 */
export const searchRoomAvailability = async (data) => {
  const { propertyId: contextPropertyId, organizationId, apaleoExternalPropertyId } = getPropertyContext();
  const propertyId = data.propertyId || contextPropertyId;

  if (!propertyId) {
    throw new Error('Property ID is required. Please select a property first.');
  }

  if (!organizationId) {
    throw new Error('Organization ID is required. Please check your configuration.');
  }

  if (!apaleoExternalPropertyId) {
    throw new Error('Apaleo external property ID is required. Please ensure property is properly configured.');
  }

  // Build query parameters according to API specification
  const params = {
    apaleo_external_property_id: apaleoExternalPropertyId,
    arrival: data.arrival,
    departure: data.departure,
    adults: Number(data.adults) || 1,
    childrenAges: 0, // Default to 0 as per API requirement
  };

  // Build endpoint with organization ID and property ID in path
  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/offers`;

  try {
    const response = await apiClient.get(endpoint, { params });
    
    // Transform the API response to match the component's expected format
    const apiData = response.data?.data || response.data;
    const offers = apiData?.offers || [];
    
    // Transform offers to room format expected by the UI
    const availableRooms = offers.map((offer) => {
      const unitGroup = offer.unitGroup || {};
      const totalAmount = offer.totalGrossAmount || {};
      const ratePlan = offer.ratePlan || {};
      
      // Calculate price per night from timeSlices
      const timeSlices = offer.timeSlices || [];
      const pricePerNight = timeSlices.length > 0
        ? timeSlices.reduce((sum, slice) => {
            const sliceAmount = slice.totalGrossAmount?.amount || slice.baseAmount?.grossAmount || 0;
            return sum + sliceAmount;
          }, 0) / timeSlices.length
        : totalAmount.amount || 0;
      
      return {
        roomTypeId: unitGroup.id || unitGroup.code,
        unitGroupId: unitGroup.id || unitGroup.code,
        ratePlanId: ratePlan.id || ratePlan.code,
        name: unitGroup.name || unitGroup.code || 'Room',
        description: unitGroup.description || '',
        capacity: unitGroup.maxPersons || 2,
        maxGuests: unitGroup.maxPersons || 2,
        currency: totalAmount.currency || 'EUR',
        pricePerNight: Math.round(pricePerNight * 100) / 100, // Round to 2 decimal places
        totalPrice: totalAmount.amount || 0,
        availableUnits: offer.availableUnits || 0,
        amenities: [], // Can be populated if available in the response
        images: [], // Can be populated if available in the response
        // Store original offer data for later use
        _offerData: offer,
      };
    });
    
    // Return in the format expected by the component
    // The component expects: { availableRooms: [...], totalAvailable: number }
    return {
      availableRooms,
      totalAvailable: availableRooms.length,
      property: apiData?.property || {},
    };
  } catch (error) {
    // Enhanced error handling with more details
    console.error('[searchRoomAvailability] Error:', {
      endpoint,
      params,
      propertyId,
      organizationId,
      apaleoExternalPropertyId,
      error: error.message,
      code: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });

    // Handle network errors (no response from server)
    if (!error.response) {
      let networkError = 'Network error. Please check your connection.';
      
      if (error.code === 'ECONNABORTED') {
        networkError = 'Request timeout. The server took too long to respond.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        networkError = 'Network error. Please check your connection and ensure the server is running at http://localhost:8000';
      } else if (error.message) {
        networkError = error.message;
      }
      
      throw new Error(networkError);
    }

    // Handle HTTP errors (server responded with error status)
    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.statusText ??
      `Failed to search room availability (${error?.response?.status || 'Unknown error'})`;
    
    throw new Error(errorMessage);
  }
};

export const getRoomDetails = async (roomTypeId, propertyId) => {
  const response = await apiClient.get(`/rooms/${roomTypeId}/details`, {
    params: { propertyId },
  });
  return response.data;
};

export const getAllRoomTypes = async (propertyId) => {
  const response = await apiClient.get('/rooms/types', {
    params: { propertyId },
  });
  return response.data;
};

/**
 * Calculate room pricing from offer data
 * @param {Object} room - Room object with _offerData
 * @param {string} checkIn - Check-in date
 * @param {string} checkOut - Check-out date
 * @returns {Object} Pricing breakdown
 */
export const calculateRoomPricing = (room, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  
  // Extract pricing from offer data if available
  const offer = room?._offerData;
  
  if (offer) {
    const totalGrossAmount = offer.totalGrossAmount || {};
    const totalNetAmount = offer.totalNetAmount || {};
    const timeSlices = offer.timeSlices || [];
    
    // Calculate price per night from timeSlices
    const pricePerNight = timeSlices.length > 0
      ? timeSlices.reduce((sum, slice) => {
          const sliceAmount = slice.totalGrossAmount?.amount || slice.baseAmount?.grossAmount || 0;
          return sum + sliceAmount;
        }, 0) / timeSlices.length
      : (totalGrossAmount.amount || 0) / nights;
    
    // Calculate subtotal (net amount or gross - taxes)
    const grossTotal = totalGrossAmount.amount || 0;
    const netTotal = totalNetAmount.amount || 0;
    const subtotal = netTotal > 0 ? netTotal : (grossTotal * 0.9); // Fallback: assume 10% tax if net not available
    
    // Calculate taxes (difference between gross and net, or estimate)
    const taxes = netTotal > 0 
      ? grossTotal - netTotal 
      : grossTotal - subtotal;
    
    const currency = totalGrossAmount.currency || room.currency || 'EUR';
    
    return {
      pricePerNight: Math.round(pricePerNight * 100) / 100,
      nights,
      subtotal: Math.round(subtotal * 100) / 100,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round(grossTotal * 100) / 100,
      currency,
    };
  }
  
  // Fallback to room data if no offer data
  const pricePerNight = room.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const total = room.totalPrice || subtotal;
  const taxes = total - subtotal;
  const currency = room.currency || 'EUR';
  
  return {
    pricePerNight: Math.round(pricePerNight * 100) / 100,
    nights,
    subtotal: Math.round(subtotal * 100) / 100,
    taxes: Math.round(Math.max(0, taxes) * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency,
  };
};
