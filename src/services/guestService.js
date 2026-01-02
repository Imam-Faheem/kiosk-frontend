import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Get property and organization IDs from localStorage and property store
 * @returns {Object} Property context with propertyId and organizationId
 */
const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: null };
    }
    
    // First try to get from localStorage
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

    // Fallback: Try to get from property store (Zustand)
    try {
      const propertyStoreData = localStorage.getItem('property-storage');
      if (propertyStoreData) {
        const storeParsed = JSON.parse(propertyStoreData);
        const selectedProperty = storeParsed?.state?.selectedProperty;
        const propertyId = storeParsed?.state?.propertyId;
        
        if (selectedProperty && propertyId) {
          const organizationId = selectedProperty.organization_id || selectedProperty.organizationId;
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

    // Default organization ID if still not found
    return {
      propertyId: null,
      organizationId: process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS',
    };
  } catch {
    return { 
      propertyId: null, 
      organizationId: process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS',
    };
  }
};

/**
 * Save guest details to backend
 * @param {Object} guestData - Guest information
 * @param {string} guestData.firstName - First name
 * @param {string} guestData.lastName - Last name
 * @param {string} guestData.email - Email address
 * @param {string} guestData.phone - Phone number
 * @param {string} guestData.country - Country code
 * @param {string} guestData.addressStreet - Street address
 * @param {string} guestData.addressCity - City
 * @param {string} guestData.addressState - State/Province
 * @param {string} guestData.addressPostal - ZIP/Postal code
 * @param {string} guestData.propertyId - Property ID (optional, will use from store if not provided)
 * @param {string} guestData.reservationId - Reservation ID (optional)
 * @returns {Promise<Object>} Saved guest details response
 */
export const saveGuestDetails = async (guestData) => {
  let { propertyId: contextPropertyId, organizationId } = getPropertyContext();
  const propertyId = guestData.propertyId || contextPropertyId;

  if (!propertyId) {
    throw new Error('Property ID is required. Please select a property first.');
  }

  // If organizationId is not found, try to get it from property store
  if (!organizationId) {
    try {
      const propertyStoreData = localStorage.getItem('property-storage');
      if (propertyStoreData) {
        const storeParsed = JSON.parse(propertyStoreData);
        const selectedProperty = storeParsed?.state?.selectedProperty;
        if (selectedProperty) {
          organizationId = selectedProperty.organization_id || selectedProperty.organizationId;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }

  // Fallback to default organization ID if still not found
  if (!organizationId) {
    organizationId = process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS';
  }

  // Use kiosk API endpoint with organization and property IDs in path
  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/guests/details`;

  try {
    console.log('[saveGuestDetails] Making request:', {
      endpoint,
      propertyId,
      organizationId,
      baseURL: apiClient.defaults.baseURL,
    });
    
    const response = await apiClient.post(endpoint, guestData);
    return response.data;
  } catch (error) {
    console.error('[saveGuestDetails] Error:', {
      endpoint,
      fullUrl: `${apiClient.defaults.baseURL}${endpoint}`,
      guestData: { ...guestData, propertyId: undefined }, // Don't log full data
      propertyId,
      organizationId,
      error: error.message,
      errorCode: error.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      responseHeaders: error?.response?.headers,
    });

    // Handle network errors
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

    // Handle HTTP errors
    const errorMessage =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.statusText ??
      `Failed to save guest details (${error?.response?.status || 'Unknown error'})`;
    
    throw new Error(errorMessage);
  }
};

export const getGuestDetails = async (params) => {
  const { propertyId, organizationId } = getPropertyContext();

  if (!propertyId || !organizationId) {
    throw new Error('Property and Organization IDs are required.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/guests/details`;
  const response = await apiClient.get(endpoint, { params });
  return response.data;
};

/**
 * Update Apaleo reservation with guest information
 * @param {string} reservationId - Apaleo reservation ID
 * @param {Object} guestData - Guest information
 * @param {string} propertyId - Property ID (optional, will use from store if not provided)
 * @returns {Promise<Object>} Update response
 */
export const updateApaleoReservationWithGuest = async (reservationId, guestData, propertyId) => {
  const { propertyId: contextPropertyId, organizationId } = getPropertyContext();
  const finalPropertyId = propertyId || contextPropertyId;

  if (!finalPropertyId || !organizationId) {
    throw new Error('Property and Organization IDs are required.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${finalPropertyId}/reservations/${reservationId}/guests`;
  const response = await apiClient.patch(endpoint, guestData);
  return response.data;
};

