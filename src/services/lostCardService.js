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

export const validateLostCardGuest = async (data) => {
  const { reservationNumber, lastName } = data;

  if (!isPresent(reservationNumber)) {
    throw new Error(translateError('reservationIdRequired'));
  }
  if (!isPresent(lastName)) {
    throw new Error(translateError('lastNameRequired'));
  }

  const { propertyId, organizationId } = getPropertyIds();
  const missingIds = [propertyId, organizationId].filter(id => !isPresent(id));
  if (missingIds.length > 0) {
    throw new Error('Property configuration is missing.');
  }

  const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/reservations/${reservationNumber}/check-in`;

  try {
    const response = await apiClient.get(url, { params: { lastName } });
    
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;

    if (!apiData) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    const hasPrimaryGuest = !!apiData.primaryGuest;
    const hasFolios = Array.isArray(apiData.folios) && apiData.folios.length > 0;
    const hasGuestName = !!apiData.guest_name;

    if (!hasPrimaryGuest && !hasFolios && !hasGuestName) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    const lastNameSources = [
      apiData?.primaryGuest?.lastName,
      hasFolios ? apiData.folios[0]?.debitor?.name : null,
      apiData?.guest_name?.last_name,
      apiData?.guest_name?.lastName,
    ];
    const reservationLastName = lastNameSources
      .find(name => name != null)
      ?.trim()
      ?.toLowerCase();

    const lastNameLower = lastName?.trim()?.toLowerCase();

    if (!lastNameLower) {
      throw new Error(translateError('lastNameRequired'));
    }

    if (!reservationLastName) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }

    if (lastNameLower !== reservationLastName) {
      throw new Error(translateError('lastNameMismatch'));
    }

    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(translateError('reservationNotFoundByNumber'));
    }
    if (error?.response?.status === 403) {
      throw new Error(translateError('lastNameMismatch'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('guestValidationFailed');
    throw new Error(message);
  }
};

export const regenerateLostCard = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/lost-card/regenerate', data);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

