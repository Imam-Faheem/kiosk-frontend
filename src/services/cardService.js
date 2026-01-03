import { apiClient } from './api/apiClient';
import { translateError } from '../utils/translations';
import usePropertyStore from '../stores/propertyStore';
import { STORAGE_KEYS, API_CONFIG } from '../config/constants';

const DEFAULT_ORGANIZATION_ID = '0ujsszwN8NRY24YaXiTIE2VWDTS';
const isPresent = (value) => value != null && value !== '';
const INVALID_BOOKING_PATTERNS = ['BOOKING-CREATED', 'MOCK', 'mock', 'test'];

const createNullStorage = () => ({
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
});

const createBrowserStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createNullStorage();
  }
  return window.localStorage;
};

const createStorage = () => createBrowserStorage();

const parseJSONSafely = (data, fallback = null) => {
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

const createPropertyContextService = (storage = createStorage()) => {
  const getDefaultContext = () => ({
    propertyId: null,
    organizationId: API_CONFIG.ORGANIZATION_ID ?? DEFAULT_ORGANIZATION_ID,
  });

  const getPropertyFromStorage = () => {
    const propertyData = storage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    const parsed = parseJSONSafely(propertyData);
    return parsed?.propertyId && parsed?.organizationId
      ? { propertyId: parsed.propertyId, organizationId: parsed.organizationId }
      : null;
  };

  const getPropertyStoreState = () => {
    const storeData = storage.getItem('property-storage');
    return parseJSONSafely(storeData)?.state ?? null;
  };

  const getPropertyFromStore = () => {
    const state = getPropertyStoreState();
    const { selectedProperty, propertyId } = state ?? {};
    const organizationId = selectedProperty?.organization_id ?? selectedProperty?.organizationId;
    
    return propertyId && organizationId ? { propertyId, organizationId } : null;
  };

  const getOrganizationIdFromStore = () => {
    const state = getPropertyStoreState();
    return state?.selectedProperty?.organization_id ?? state?.selectedProperty?.organizationId ?? null;
  };

  const getContext = () => {
    try {
      return getPropertyFromStorage() ?? getPropertyFromStore() ?? getDefaultContext();
    } catch (error) {
      console.error('[getPropertyContext] Unexpected error:', error);
      return getDefaultContext();
    }
  };

  const getOrganizationId = (currentOrgId) => {
    return currentOrgId ?? getOrganizationIdFromStore() ?? API_CONFIG.ORGANIZATION_ID ?? DEFAULT_ORGANIZATION_ID;
  };

  return {
    getContext,
    getOrganizationId,
  };
};

const propertyContextService = createPropertyContextService();

const isValidBookingId = (id) => {
  if (!id) {
    return false;
  }

  const idLower = id.toLowerCase();
  return !INVALID_BOOKING_PATTERNS.some(
    pattern => id === pattern || idLower.includes(pattern)
  );
};

const hasGuestName = (guest) => {
  if (!guest) return false;
  return !!(guest.firstName ?? guest.lastName ?? guest.name);
};

const hasValidGuestData = (data) => {
  if (!data) {
    return false;
  }

  const bookingId = data.bookingId ?? data.reservationId ?? data.reservation_id;
  if (!isValidBookingId(bookingId)) {
    return false;
  }

  if (hasGuestName(data.primaryGuest)) {
    return true;
  }

  const folios = Array.isArray(data.folios) ? data.folios : [];
  if (folios.some(folio => hasGuestName(folio?.debitor))) {
    return true;
  }

  if (hasGuestName(data.guest_name)) {
    return true;
  }

  return false;
};

const extractReservationId = (guestData, validationData) => {
  const sources = [
    guestData?.bookingId,
    guestData?.reservationId,
    guestData?.reservation_id,
    guestData?.reservation?.id,
    guestData?.reservation?.bookingId,
    validationData?.reservationNumber,
  ];

  return sources.find(id => id != null) ?? null;
};

const extractRoomNumber = (guestData) => {
  const sources = [
    guestData?.unit?.name,
    guestData?.unit?.id,
    guestData?.roomNumber,
    guestData?.room_number,
    guestData?.folios?.[0]?.reservation?.unit?.name,
    guestData?.folios?.[0]?.reservation?.unit?.id,
  ];

  return sources.find(room => room != null && room !== '') ?? null;
};

const createValidationError = (key) => new Error(translateError(key));
const createPropertyError = () => new Error('Property ID is required. Please select a property first.');

const assertExists = (value, error) => {
  if (!value) throw error;
  return value;
};

const assertValid = (predicate, value, error) => {
  if (!predicate(value)) throw error;
  return value;
};

const validateGuestData = (guestData) => {
  assertExists(guestData, createValidationError('reservationNotFound'));
  assertValid(hasValidGuestData, guestData, createValidationError('reservationNotFound'));
  return guestData;
};

const validateReservationId = (reservationId) => {
  assertExists(reservationId, createValidationError('reservationNotFound'));
  assertValid(isValidBookingId, reservationId, createValidationError('reservationNotFound'));
  return reservationId;
};

const validateRoomNumber = (roomNumber) => {
  return assertExists(roomNumber, createValidationError('reservationNotFound'));
};

const validatePropertyId = (propertyId) => {
  return assertExists(propertyId, createPropertyError());
};

const extractPropertyId = (guestData) => {
  return guestData.propertyId ?? usePropertyStore.getState().propertyId;
};

export const prepareCardRegenerationData = (guestData, validationData) => {
  const validatedGuestData = validateGuestData(guestData);
  
  const reservationId = validateReservationId(
    extractReservationId(validatedGuestData, validationData)
  );
  
  const roomNumber = validateRoomNumber(
    extractRoomNumber(validatedGuestData)
  );
  
  const propertyId = validatePropertyId(
    extractPropertyId(validatedGuestData)
  );

  return {
    reservation_id: reservationId,
    room_number: roomNumber,
    property_id: propertyId,
  };
};

const buildCardIssueEndpoint = ({ organizationId, propertyId, reservationId }) => {
  if (!organizationId || !propertyId) {
    throw new Error('Organization ID and Property ID are required to build card issue endpoint.');
  }
  
  const basePath = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}`;
  // For new reservations, reservationId might be null, so we issue card without reservation segment
  // For existing reservations (check-in), include reservation segment
  const reservationSegment = reservationId ? `/reservations/${reservationId}` : '';
  return `${basePath}${reservationSegment}/cards/issue`;
};

const buildCardPayload = ({ roomNumber, guestName, email, reservationId }) => ({
  roomNumber,
  guestName,
  email,
  ...(reservationId && { reservationId }),
});

const getNetworkErrorMessage = (error) => {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. The server took too long to respond.';
  }

  const isNetworkError = error.code === 'ERR_NETWORK';
  const hasNetworkErrorInMessage = error.message?.includes('Network Error') ?? false;
  
  if (isNetworkError || hasNetworkErrorInMessage) {
    return 'Network error. Please check your connection and ensure the server is running.';
  }

  return error.message ?? 'Network error. Please check your connection.';
};

const getHttpErrorMessage = (error, defaultKey) => {
  return error.response?.data?.data?.message
    ?? error.response?.data?.message
    ?? error.response?.data?.error
    ?? error.response?.data?.data?.error
    ?? error.response?.statusText
    ?? error.message
    ?? translateError(defaultKey);
};

const validateContext = (context) => {
  if (!context.propertyId) {
    throw new Error('Property ID is required. Please select a property first.');
  }
  if (!context.organizationId) {
    throw new Error('Organization ID is required. Please check your configuration.');
  }
};

const createCardService = (contextService = propertyContextService) => {
  const issueCard = async (data) => {
    const context = contextService.getContext();
    
    // Try to get propertyId from multiple sources
    let propertyId = data.propertyId ?? context.propertyId;
    
    // If still not found, try to get from property store's selectedProperty
    if (!propertyId && typeof window !== 'undefined' && window.localStorage) {
      try {
        const propertyStoreData = localStorage.getItem('property-storage');
        if (propertyStoreData) {
          const storeParsed = parseJSONSafely(propertyStoreData);
          const selectedProperty = storeParsed?.state?.selectedProperty;
          propertyId = propertyId ?? storeParsed?.state?.propertyId ?? selectedProperty?.property_id ?? selectedProperty?.id;
        }
      } catch (e) {
        console.warn('[issueCard] Failed to read property from store:', e);
      }
    }

    if (!propertyId) {
      const errorMsg = 'Property ID is required. Please select a property first.';
      console.error('[issueCard]', errorMsg, { context, data });
      throw new Error(errorMsg);
    }

    const organizationId = contextService.getOrganizationId(context.organizationId);
    
    if (!organizationId) {
      const errorMsg = 'Organization ID is required. Please check your configuration.';
      console.error('[issueCard]', errorMsg, { context, propertyId });
      throw new Error(errorMsg);
    }

    const endpoint = buildCardIssueEndpoint({ organizationId, propertyId, reservationId: data.reservationId });
    const payload = buildCardPayload({ 
      roomNumber: data.roomNumber, 
      guestName: data.guestName, 
      email: data.email, 
      reservationId: data.reservationId 
    });

    try {
      console.log('[issueCard] Making request:', {
        endpoint,
        fullUrl: `${apiClient.defaults?.baseURL ?? ''}${endpoint}`,
        propertyId,
        organizationId,
        payload,
        baseURL: apiClient.defaults?.baseURL,
      });

      const response = await apiClient.post(endpoint, payload);
      console.log('[issueCard] Success:', { status: response.status, data: response.data });
      return response.data;
    } catch (error) {
      console.error('[issueCard] Error:', {
        endpoint,
        fullUrl: `${apiClient.defaults?.baseURL ?? ''}${endpoint}`,
        propertyId,
        organizationId,
        payload,
        error: error.message,
        errorCode: error.code,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        response: error?.response,
      });

      if (!error.response) {
        const networkError = getNetworkErrorMessage(error);
        console.error('[issueCard] Network error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack,
        });
        throw new Error(networkError);
      }

      throw new Error(getHttpErrorMessage(error, 'cardIssuanceFailed'));
    }
  };

  const validateGuest = async (data) => {
    const context = contextService.getContext();
    validateContext(context);

    const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/lost-card/validate`;

    try {
      const response = await apiClient.post(endpoint, {
        reservationNumber: data.reservationNumber,
        roomType: data.roomType,
        lastName: data.lastName,
      });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error(translateError('networkError'));
      }
      throw new Error(getHttpErrorMessage(error, 'guestValidationFailed'));
    }
  };

  const getNetworkErrorForRegenerate = (error) => {
    const isConnectionRefused = error.code === 'ECONNREFUSED';
    const hasNetworkErrorInMessage = error.message?.includes('Network Error') ?? false;
    
    if (isConnectionRefused || hasNetworkErrorInMessage) {
      return translateError('cannotConnectToServer');
    }
    if (error.code === 'ETIMEDOUT') {
      return translateError('requestTimedOut');
    }
    return translateError('networkError');
  };

  const regenerateCard = async (data) => {
    const context = contextService.getContext();
    validateContext(context);

    const reservationId = data?.reservation_id ?? data?.reservationId;
    if (!reservationId) {
      throw new Error('Reservation ID is required to regenerate card.');
    }

    const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/reservations/${reservationId}/lost-card`;

    try {
      const response = await apiClient.post(endpoint);
      
      // Check if response indicates an error even with 200 status
      if (response.data?.success === false) {
        const errorMsg = response.data?.message 
          ?? response.data?.error 
          ?? response.data?.data?.message
          ?? 'Failed to regenerate card';
        throw new Error(errorMsg);
      }
      
      const apiData = response.data?.success === true && response.data?.data 
        ? response.data.data 
        : response.data;
        
      // Check if data contains error information
      if (apiData && typeof apiData === 'object' && apiData.error) {
        throw new Error(apiData.error);
      }
      
      return {
        success: true,
        data: apiData,
      };
    } catch (error) {
      if (!error.response) {
        throw new Error(getNetworkErrorForRegenerate(error));
      }
      throw new Error(getHttpErrorMessage(error, 'cardRegenerationFailed'));
    }
  };

  const getCardStatus = async (cardId) => {
    const context = contextService.getContext();
    validateContext(context);

    const endpoint = `/api/kiosk/v1/organizations/${context.organizationId}/properties/${context.propertyId}/cards/${cardId}/status`;

    try {
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error(translateError('networkError'));
      }
      throw new Error(getHttpErrorMessage(error, 'cardDispenserError'));
    }
  };

  const getLostCardRequest = async (reservationId, propertyId = null, organizationId = null) => {
    if (!reservationId) {
      throw new Error('Reservation ID is required. Please provide the external reservation ID.');
    }
    
    const context = contextService.getContext();
    const finalPropertyId = propertyId ?? context.propertyId;
    const finalOrganizationId = organizationId ?? context.organizationId;
    
    if (!finalPropertyId || !finalOrganizationId) {
      throw new Error('Property ID and Organization ID are required to get lost card request.');
    }
    
    try {
      const endpoint = `/api/kiosk/v1/organizations/${finalOrganizationId}/properties/${finalPropertyId}/reservations/${reservationId}/lost-card`;
      const response = await apiClient.post(endpoint);
      const apiData = response.data?.success === true && response.data?.data 
        ? response.data.data 
        : response.data;
      return apiData;
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

  return {
    issueCard,
    validateGuest,
    regenerateCard,
    getCardStatus,
    getLostCardRequest,
  };
};

const cardService = createCardService();

export const issueCard = cardService.issueCard;
export const validateGuest = cardService.validateGuest;
export const regenerateCard = cardService.regenerateCard;
export const getCardStatus = cardService.getCardStatus;
export const getLostCardRequest = cardService.getLostCardRequest;
