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
  
  const storePropertyId = extractPropertyIdFromStore(state);
  const storeOrgId = extractOrganizationIdFromStore(state);
  
  if (storePropertyId && storeOrgId) {
    return { propertyId: storePropertyId, organizationId: storeOrgId };
  }
  
  const storedData = getStoredPropertyData();
  const storedPropertyId = storedData?.propertyId ?? storedData?.property_id;
  const storedOrgId = storedData?.organizationId ?? storedData?.organization_id;
  
  return {
    propertyId: storePropertyId ?? storedPropertyId ?? API_CONFIG.DEFAULT_PROPERTY_ID,
    organizationId: storeOrgId ?? storedOrgId ?? API_CONFIG.ORGANIZATION_ID,
  };
};

const isPresent = (value) => value != null && value !== '';

export const issueCard = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/cards/issue', data);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to issue card';
    throw new Error(message);
  }
};

export const validateGuest = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/lost-card/validate', {
      reservationNumber: data.reservationNumber,
      roomType: data.roomType,
      lastName: data.lastName,
    });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ?? error?.message ?? 'Failed to validate guest';
    throw new Error(message);
  }
};

export const regenerateCard = async (data) => {
  const { reservation_id, room_number } = data;
  
  if (!isPresent(reservation_id)) {
    throw new Error('Reservation ID is required.');
  }

  const { propertyId, organizationId } = getPropertyIds();
  if (!isPresent(propertyId) || !isPresent(organizationId)) {
    throw new Error('Property configuration is missing.');
  }

  const url = `/api/kiosk/v1/lost-card/regenerate`;
  const requestBody = {
    reservation_id,
    room_number,
  };

  try {
    console.log('[regenerateCard] Making API call:', {
      url,
      method: 'POST',
      body: requestBody,
      propertyId,
      organizationId,
      reservation_id,
    });
    
    const response = await apiClient.post(url, requestBody);
    
    console.log('[regenerateCard] API response received:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
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
    console.error('[regenerateCard] Error:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      code: error.code,
      url,
    });
    
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error(translateError('cannotConnectToServer'));
      }
      if (error.code === 'ETIMEDOUT') {
        throw new Error(translateError('requestTimedOut'));
      }
      throw new Error(translateError('networkError'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

export const getCardStatus = async (cardId) => {
  try {
    const response = await apiClient.get(`/api/kiosk/v1/cards/${cardId}/status`);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to get card status';
    throw new Error(message);
  }
};
