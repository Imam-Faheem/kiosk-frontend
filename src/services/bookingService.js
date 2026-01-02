import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';
import { API_CONFIG } from '../config/constants';

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

export const createBooking = async (bookingData, hotelId) => {
  const context = getPropertyContext();
  const propertyId = bookingData.propertyId ?? context.propertyId;
  const organizationId = context.organizationId;
  
  if (!propertyId || !organizationId) {
    throw new Error('Property ID and Organization ID are required to create a booking.');
  }
  
  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/bookings`;
  
  try {
    console.log('[createBooking] Making request:', {
      endpoint,
      fullUrl: `${apiClient.defaults?.baseURL ?? ''}${endpoint}`,
      propertyId,
      organizationId,
      bookingData,
    });
    
    const response = await apiClient.post(endpoint, bookingData);
    
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

