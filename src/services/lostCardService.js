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
    const response = await apiClient.get(endpoint);
    return response.data;
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
  
  const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/lost-card/regenerate`;

  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   'Failed to regenerate card';
    throw new Error(message);
  }
};

