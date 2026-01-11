import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';
import { API_CONFIG } from '../config/constants';

/**
 * Get property and organization IDs from localStorage and property store
 * @returns {Object} Property context with propertyId and organizationId
 */
const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: API_CONFIG.ORGANIZATION_ID ?? null };
    }
    
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (propertyData) {
      const parsed = JSON.parse(propertyData);
      if (parsed.propertyId && parsed.organizationId) {
        return {
          propertyId: parsed.propertyId,
          organizationId: parsed.organizationId,
        };
      }
    }

    try {
      const propertyStoreData = localStorage.getItem('property-storage');
      if (propertyStoreData) {
        const storeParsed = JSON.parse(propertyStoreData);
        const selectedProperty = storeParsed?.state?.selectedProperty;
        const propertyId = storeParsed?.state?.propertyId;
        
        if (selectedProperty && propertyId) {
          const organizationId = selectedProperty.organization_id ?? selectedProperty.organizationId;
          if (organizationId) {
            return {
              propertyId: propertyId,
              organizationId: organizationId,
            };
          }
        }
      }
    } catch (e) {
      // Ignore errors when reading property store
    }

    return {
      propertyId: null,
      organizationId: API_CONFIG.ORGANIZATION_ID ?? null,
    };
  } catch {
    return { 
      propertyId: null, 
      organizationId: API_CONFIG.ORGANIZATION_ID ?? null,
    };
  }
};

/**
 * Create a booking
 * @param {Object} bookingData - Booking information with reservations array
 * @param {Array} bookingData.reservations - Array of reservation objects
 * @param {string} bookingData.reservations[].arrival - Check-in date (YYYY-MM-DD)
 * @param {string} bookingData.reservations[].departure - Check-out date (YYYY-MM-DD)
 * @param {number} bookingData.reservations[].adults - Number of adults
 * @param {string} bookingData.reservations[].channelCode - Channel code (e.g., 'Direct')
 * @param {Object} bookingData.reservations[].primaryGuest - Guest information
 * @param {Array} bookingData.reservations[].timeSlices - Array of time slices with ratePlanId
 * @param {string} hotelId - Hotel ID (optional, deprecated parameter)
 * @returns {Promise<Object>} Booking response
 */
export const createBooking = async (bookingData, hotelId) => {
  console.log('[createBooking] Received bookingData:', {
    bookingData,
    hasReservations: !!bookingData?.reservations,
    reservationsType: Array.isArray(bookingData?.reservations) ? 'array' : typeof bookingData?.reservations,
    reservationsLength: bookingData?.reservations?.length,
    bookingDataKeys: bookingData ? Object.keys(bookingData) : 'no data',
  });

  const context = getPropertyContext();
  const propertyId = bookingData?.propertyId ?? context.propertyId;
  const organizationId = context.organizationId;
  
  if (!propertyId || !organizationId) {
    throw new Error('Property ID and Organization ID are required to create a booking.');
  }
  
  // Validate that reservations array exists
  if (!bookingData?.reservations || !Array.isArray(bookingData.reservations) || bookingData.reservations.length === 0) {
    console.error('[createBooking] Validation failed:', {
      hasReservations: !!bookingData?.reservations,
      isArray: Array.isArray(bookingData?.reservations),
      length: bookingData?.reservations?.length,
      bookingData,
    });
    throw new Error('Booking data must include a non-empty "reservations" array.');
  }
  
  // Prepare the payload - ensure reservations array is present
  // Remove propertyId from payload as it's in the URL path, not the body
  // The API expects only { reservations: [...] } in the request body
  const payload = {
    reservations: bookingData.reservations,
  };
  
  // Validate payload structure
  if (!Array.isArray(payload.reservations) || payload.reservations.length === 0) {
    throw new Error('Payload must contain a non-empty reservations array. Received: ' + JSON.stringify(payload));
  }
  
  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/bookings`;
  
  try {
    console.log('[createBooking] Making request:', {
      endpoint,
      fullUrl: `${apiClient.defaults?.baseURL ?? ''}${endpoint}`,
      propertyId,
      organizationId,
      payload,
      payloadStringified: JSON.stringify(payload),
      reservationsCount: payload.reservations?.length,
      firstReservation: payload.reservations?.[0],
      hasReservations: !!payload.reservations,
    });
    
    const response = await apiClient.post(endpoint, payload);
    
    console.log('[createBooking] Response:', {
      status: response.status,
      data: response.data,
    });
    
    // Ensure response has success field for consistency
    const responseData = response.data ?? {};
    if (responseData.success === undefined) {
      // If API doesn't return success field, assume success if we have data
      responseData.success = !!(responseData.data || responseData.id || responseData.reservationId || responseData.reservationIds);
    }
    
    return responseData;
  } catch (error) {
    console.error('[createBooking] Error:', {
      endpoint,
      fullUrl: `${apiClient.defaults?.baseURL ?? ''}${endpoint}`,
      propertyId,
      organizationId,
      error: error.message,
      errorCode: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    
    // Re-throw with more context
    if (error.response) {
      const errorMessage = error.response?.data?.message 
        ?? error.response?.data?.error 
        ?? error.response?.statusText 
        ?? error.message 
        ?? 'Failed to create booking';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
};

/**
 * Get reservation details by ID
 * @param {string} reservationId - Apaleo reservation ID
 * @param {string} propertyId - Property ID (optional, will use from context if not provided)
 * @param {string} organizationId - Organization ID (optional, will use from context if not provided)
 * @returns {Promise<Object>} Reservation details
 */
export const getReservation = async (reservationId, propertyId = null, organizationId = null) => {
  if (!reservationId) {
    throw new Error('Reservation ID is required.');
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to get reservation details.');
  }
  
  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/details`;
  const response = await apiClient.get(endpoint);
  return response.data;
};

