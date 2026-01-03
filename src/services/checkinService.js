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

export const processCheckIn = async (data, propertyId = null, organizationId = null) => {
  const reservationId = data.reservation_id ?? data.reservationId ?? data.id;
  
  if (!reservationId) {
    throw new Error('Reservation ID is required to process check-in.');
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to process check-in.');
  }
  
  try {
    const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/check-in`;
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
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

export const validateReservation = async (data, propertyId = null, organizationId = null) => {
  const { reservationId, lastName } = data;
  
  if (!reservationId) {
    throw new Error(translateError('reservationIdRequired'));
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to validate reservation.');
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

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('guestValidationFailed');
    throw new Error(message);
  }
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
