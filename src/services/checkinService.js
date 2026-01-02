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
  
  if (!isPresent(reservationId)) {
    throw new Error(translateError('reservationIdRequired'));
  }
  if (!isPresent(lastName)) {
    throw new Error(translateError('lastNameRequired'));
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to validate reservation.');
  }
  
  const url = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/check-in`;
  
  console.log('[validateReservation] Making API call:', {
    url,
    method: 'GET',
    params: { lastName },
    propertyId: finalPropertyId,
    organizationId: finalOrganizationId,
    reservationId,
  });
  
  try {
    const response = await apiClient.get(url, { params: { lastName } });
    
    console.log('[validateReservation] API response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasSuccess: response.data?.success,
      hasDataWrapper: !!response.data?.data,
    });
    
    // Handle API response wrapper: { success: true, data: {...} }
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;
    
    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    console.error('[validateReservation] Validation failed:', {
      message: error.message,
      status: getErrorStatus(error),
      data: error?.response?.data,
    });
    
    handleStatusError(error, 404, translateError('reservationNotFound'));
    handleStatusError(error, 403, translateError('invalidLastName'));
    
    throw error;
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
