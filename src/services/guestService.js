import { apiClient } from './api/apiClient';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Get property and organization IDs from localStorage
 * @returns {Object} Property context with propertyId and organizationId
 */
const getPropertyContext = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { propertyId: null, organizationId: null };
    }
    
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (!propertyData) {
      return { propertyId: null, organizationId: null };
    }

    const parsed = JSON.parse(propertyData);
    return {
      propertyId: parsed.propertyId ?? null,
      organizationId: parsed.organizationId ?? null,
    };
  } catch {
    return { propertyId: null, organizationId: null };
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
  const { propertyId: contextPropertyId, organizationId } = getPropertyContext();
  const propertyId = guestData.propertyId || contextPropertyId;

  if (!propertyId) {
    throw new Error('Property ID is required. Please select a property first.');
  }

  if (!organizationId) {
    throw new Error('Organization ID is required. Please check your configuration.');
  }

  // Use kiosk API endpoint with organization and property IDs in path
  const endpoint = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/guests/details`;

  try {
    const response = await apiClient.post(endpoint, guestData);
    return response.data;
  } catch (error) {
    console.error('[saveGuestDetails] Error:', {
      endpoint,
      guestData: { ...guestData, propertyId: undefined }, // Don't log full data
      propertyId,
      organizationId,
      error: error.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
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

