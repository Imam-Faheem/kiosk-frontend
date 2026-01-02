import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import { STORAGE_KEYS } from '../config/constants';
import { API_CONFIG } from '../config/constants';

// Mock data helpers - optional fallback (mockData file doesn't exist, using defaults)
const shouldUseMock = () => false;
const mockData = { 
  checkIn: () => ({}), 
  checkInStatus: () => ({}), 
  reservation: () => ({ success: false }) 
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
    if (shouldUseMock(error)) {
      return mockData.checkIn(data);
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                         'Failed to process check-in';
    throw new Error(message);
  }
};

export const getCheckInStatus = async (reservationId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`);
    return response.data;
  } catch (error) {
    if (shouldUseMock(error)) {
      return mockData.checkInStatus(reservationId);
    }
    
    if (error?.response?.status === 404) {
      throw new Error(translateError('checkinNotFound'));
    }
    
    const message = error?.response?.data?.message ?? error?.message ?? translateError('generic');
    throw new Error(message);
  }
};

export const validateReservation = async (data, propertyId = null, organizationId = null) => {
  const { reservationId, lastName } = data;
  
  if (!reservationId) {
    throw new Error(translateError('reservationIdRequired'));
  }
  if (!lastName) {
    throw new Error(translateError('lastNameRequired'));
  }
  
  const context = getPropertyContext();
  const finalPropertyId = propertyId ?? context.propertyId;
  const finalOrganizationId = organizationId ?? context.organizationId;
  
  if (!finalPropertyId || !finalOrganizationId) {
    throw new Error('Property ID and Organization ID are required to validate reservation.');
  }
  
  try {
    const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/details`;
    const response = await apiClient.get(endpoint, {
      params: { lastName },
    });
    return response.data;
  } catch (error) {
    const isNetworkError = !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
    const isValidationError = error?.response?.status === 404 || error?.response?.status === 403;

    if ((isNetworkError || shouldUseMock(error)) && !isValidationError) {
      return mockData.reservation(data);
    }
    
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFound'));
    }
    
    if (error?.response?.status === 403) {
      throw new Error(translateError('invalidLastName'));
    }
    
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('generic');
    throw new Error(message);
  }
};
