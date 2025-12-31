import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import usePropertyStore from '../stores/propertyStore';
import { STORAGE_KEYS, API_CONFIG } from '../config/constants';

const extractPropertyIdFromStore = (state) => {
  return state.propertyId ?? state.selectedProperty?.property_id ?? state.selectedProperty?.id;
};

const extractOrganizationIdFromStore = (state) => {
  return state.selectedProperty?.organizationId ?? 
         state.selectedProperty?.organization?.id ??
         state.selectedProperty?.organization_id;
};

const getStoredPropertyData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getPropertyIds = () => {
  const state = usePropertyStore.getState();
  
  // Try store first
  const storePropertyId = extractPropertyIdFromStore(state);
  const storeOrgId = extractOrganizationIdFromStore(state);
  
  if (storePropertyId && storeOrgId) {
    return { propertyId: storePropertyId, organizationId: storeOrgId };
  }
  
  // Fallback to localStorage
  const storedData = getStoredPropertyData();
  const storedPropertyId = storedData?.propertyId ?? storedData?.property_id;
  const storedOrgId = storedData?.organizationId ?? storedData?.organization_id;
  
  return {
    propertyId: storePropertyId ?? storedPropertyId ?? API_CONFIG.DEFAULT_PROPERTY_ID,
    organizationId: storeOrgId ?? storedOrgId ?? API_CONFIG.ORGANIZATION_ID,
  };
};

const getErrorMessage = (error) => {
  const sources = [
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.message,
  ];
  return sources.find(msg => msg != null);
};

export const processCheckIn = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/check-in', data);
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
const isObject = (value) => typeof value === 'object' && value !== null;
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidHttpStatus = (status) => status >= 200 && status < 300;
const isNonEmpty = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return isNonEmptyString(value);
};
const isValidDate = (value) => !isNaN(new Date(value).getTime());

const getResponseStatus = (response) => response.status ?? response.response?.status;

const hasValidGuestName = (data) => {
  const guestName = data?.guest_name;
  if (!guestName) return false;
  const firstName = guestName.first_name ?? '';
  const lastName = guestName.last_name ?? '';
  return isNonEmptyString(firstName) && isNonEmptyString(lastName);
};

const validate = (predicate, value, message) => {
  if (!predicate(value)) throw new Error(message);
};

const assertValidInput = (reservationId, lastName) => {
  validate(isPresent, reservationId, translateError('reservationIdRequired'));
  validate(isPresent, lastName, translateError('lastNameRequired'));
};

const assertPropertyConfiguration = (propertyId, organizationId) => {
  const missingIds = [propertyId, organizationId].filter(id => !isPresent(id));
  if (missingIds.length > 0) throw new Error('Property configuration is missing.');
};

export const validateReservation = async (data) => {
  const { reservationId, lastName } = data;
  
  assertValidInput(reservationId, lastName);
  
  const { propertyId, organizationId } = getPropertyIds();
  assertPropertyConfiguration(propertyId, organizationId);
  
  const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/reservations/${reservationId}/check-in`;
  
  console.log('[validateReservation] Making API call:', {
    url,
    method: 'GET',
    params: { lastName },
    propertyId,
    organizationId,
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

const assertReservationId = (reservationId) => {
  if (!isPresent(reservationId)) {
    throw new Error('Reservation ID is required.');
  }
};

export const performCheckIn = async (reservationId) => {
  assertReservationId(reservationId);
  
  const { propertyId, organizationId } = getPropertyIds();
  assertPropertyConfiguration(propertyId, organizationId);
  
  const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/reservations/${reservationId}/check-in`;
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
