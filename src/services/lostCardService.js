import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
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

export const getLostCardRequest = async (reservationId, propertyId = null, organizationId = null) => {
  if (!reservationId) {
    throw new Error('Reservation ID is required.');
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to get lost card request.');
  }
  
  try {
    const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/lost-card`;
    const response = await apiClient.post(endpoint);
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;
    return apiData;
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to get lost card request';
    throw new Error(message);
  }
};

export const validateLostCardGuest = async (data) => {
  const { reservationNumber, lastName } = data;

  if (!reservationNumber) {
    throw new Error(translateError('reservationIdRequired'));
  }

  const context = getPropertyContext();
  
  if (!context.propertyId || !context.organizationId) {
    throw new Error('Property ID and Organization ID are required to validate lost card guest.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationNumber}/details`;

  try {
    const response = await apiClient.get(endpoint, {
      params: lastName ? { lastName } : {},
    });
    
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;

    if (!apiData) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    // Validate lastName if provided
    if (lastName) {
      const lastNameLower = lastName.trim().toLowerCase();
      const reservationLastName = apiData?.primaryGuest?.lastName?.trim().toLowerCase();

      if (!reservationLastName || lastNameLower !== reservationLastName) {
        throw new Error(translateError('lastNameMismatch'));
      }
    }

    const hasPrimaryGuest = !!apiData.primaryGuest;
    const hasFolios = Array.isArray(apiData.folios) && apiData.folios.length > 0;
    const hasGuestName = !!apiData.guest_name;

    if (!hasPrimaryGuest && !hasFolios && !hasGuestName) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('guestValidationFailed');
    throw new Error(message);
  }
};

export const regenerateLostCard = async (data) => {
  const context = getPropertyContext();
  
  if (!context.propertyId || !context.organizationId) {
    throw new Error('Property ID and Organization ID are required to regenerate lost card.');
  }
  
  // Extract reservation_id from data (can be reservation_id, reservationId, or id)
  const reservationId = data?.reservation_id ?? data?.reservationId ?? data?.id;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required to regenerate lost card.');
  }

  // Use the correct endpoint: /organizations/:organization_id/properties/:property_id/reservations/:reservation_id/lost-card
  const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationId}/lost-card`;

  try {
    const baseURL = apiClient.defaults?.baseURL ?? API_CONFIG.BASE_URL ?? 'http://localhost:8000';
    const fullUrl = `${baseURL}${endpoint}`;
    
    console.log('[regenerateLostCard] Making request to Kong:', {
      endpoint,
      baseURL,
      fullUrl,
      propertyId: context.propertyId,
      organizationId: context.organizationId,
      reservationId,
      data,
      method: 'POST',
    });

    const response = await apiClient.post(endpoint, data);
    
    console.log('[regenerateLostCard] Success:', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    const baseURL = apiClient.defaults?.baseURL ?? API_CONFIG.BASE_URL ?? 'http://localhost:8000';
    const fullUrl = `${baseURL}${endpoint}`;
    
    // Check if this is a CORS error
    const isCorsError = !error.response && (
      error.message?.includes('CORS') ||
      error.message?.includes('Access-Control') ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('blocked by CORS policy')
    );
    
    console.error('[regenerateLostCard] Error calling Kong:', {
      endpoint,
      baseURL,
      fullUrl,
      propertyId: context.propertyId,
      organizationId: context.organizationId,
      reservationId,
      error: error.message,
      errorCode: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      isCorsError,
      requestConfig: {
        url: endpoint,
        method: 'POST',
        baseURL: baseURL,
      },
    });

    // Handle CORS errors with a more helpful message
    if (isCorsError) {
      const corsMessage = `CORS error: The request to ${fullUrl} was blocked. Please ensure Kong is configured to allow the X-Organization-ID and X-Property-ID headers in CORS preflight responses.`;
      console.error('[regenerateLostCard] CORS Error Details:', corsMessage);
      throw new Error('Connection error: Unable to reach the server. Please check that Kong is running and CORS is properly configured.');
    }

    // Display the error message from the API response
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

