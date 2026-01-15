import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import { STORAGE_KEYS } from '../config/constants';
import { API_CONFIG } from '../config/constants';

const getErrorMessage = (error) => {
  const sources = [
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.message,
  ];
  return sources.find(msg => msg != null);
};

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
 * Process check-in for a reservation
 * PUT /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/check-in
 * @param {string} reservationId - Reservation ID
 * @param {Object} data - Optional check-in data
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Check-in response
 */
export const processCheckIn = async (reservationId, data = {}, propertyId = null, organizationId = null) => {
  if (!isPresent(reservationId)) {
    throw new Error('Reservation ID is required to process check-in.');
  }

  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;

  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to process check-in.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/check-in`;

  console.log('[processCheckIn] Making API call:', {
    endpoint,
    method: 'PUT',
    propertyId: finalPropertyId,
    organizationId: finalOrganizationId,
    reservationId,
    data,
  });

  try {
    const response = await apiClient.put(endpoint, data);

    console.log('[processCheckIn] Success:', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error('[processCheckIn] Error:', {
      message: error.message,
      status: getErrorStatus(error),
      data: error?.response?.data,
    });

    const message = getErrorMessage(error) ?? 'Failed to process check-in';
    throw new Error(message);
  }
};

const getErrorStatus = (error) => error?.response?.status;

const handleStatusError = (error, status, message) => {
  if (getErrorStatus(error) === status) {
    throw new Error(message);
  }
};

export const getCheckInStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    return response.data;
  } catch (error) {
    handleStatusError(error, 404, translateError('checkinNotFound'));

    const message = getErrorMessage(error) ?? translateError('generic');
    throw new Error(message);
  }
};

const isPresent = (value) => value != null && value !== '';

/**
 * Check if a reservation can be checked in
 * GET /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/can-check-in
 * @param {string} reservationId - Reservation ID
 * @param {string} lastName - Last name (optional, for validation)
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Can check-in result
 */
export const canCheckIn = async (reservationId, lastName = null, propertyId = null, organizationId = null) => {
  if (!isPresent(reservationId)) {
    throw new Error(translateError('reservationIdRequired'));
  }

  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;

  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to check if reservation can check in.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/can-check-in`;

  try {
    const response = await apiClient.get(endpoint, {
      params: lastName ? { lastName } : {},
    });

    const apiData = response.data?.success === true && response.data?.data
      ? response.data.data
      : response.data;

    if (!apiData) {
      throw new Error(translateError('reservationNotFound'));
    }

    // Validate lastName if provided (optional, if API doesn't already do it)
    if (lastName) {
      const lastNameLower = lastName.trim().toLowerCase();
      const reservationLastName = apiData?.reservation?.primaryGuest?.lastName?.trim().toLowerCase() ??
        apiData?.primaryGuest?.lastName?.trim().toLowerCase();

      if (reservationLastName && lastNameLower !== reservationLastName) {
        throw new Error(translateError('lastNameMismatch'));
      }
    }

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFound'));
    }
    if (error?.response?.status === 403) {
      throw new Error(translateError('invalidLastName'));
    }

    const message = error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      translateError('guestValidationFailed');
    throw new Error(message);
  }
};

/**
 * Get reservation details for check-in
 * GET /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/details
 * @param {string} reservationId - Reservation ID
 * @param {string} lastName - Last name (optional, for UI validation only)
 * @param {string} propertyId - Property ID (optional)
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<Object>} Reservation details
 */
export const getReservationDetails = async (reservationId, lastName = null, propertyId = null, organizationId = null) => {
  if (!isPresent(reservationId)) {
    throw new Error(translateError('reservationIdRequired'));
  }

  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;

  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to get reservation details.');
  }

  const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/details`;

  try {
    const response = await apiClient.get(endpoint, {
      params: lastName ? { lastName } : {},
    });

    const apiData = response.data?.success === true && response.data?.data
      ? response.data.data
      : response.data;

    if (!apiData) {
      throw new Error(translateError('reservationNotFound'));
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
      throw new Error(translateError('reservationNotFound'));
    }

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFound'));
    }
    if (error?.response?.status === 403) {
      throw new Error(translateError('invalidLastName'));
    }

    const message = error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      translateError('guestValidationFailed');
    throw new Error(message);
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getReservationDetails instead
 */
export const validateReservation = async (data, propertyId = null, organizationId = null) => {
  const { reservationId, lastName } = data;
  return getReservationDetails(reservationId, lastName, propertyId, organizationId);
};

export const performCheckIn = async (reservationId, propertyId = null, organizationId = null) => {
  if (!isPresent(reservationId)) {
    throw new Error('Reservation ID is required.');
  }

  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;

  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to perform check-in.');
  }

  const url = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/check-in`;
  const response = await apiClient.get(url);

  // Handle API response wrapper: { success: true, data: {...} }
  const apiData = response.data?.success === true && response.data?.data
    ? response.data.data
    : response.data;

  return {
    success: true,
    data: apiData,
  };
};
