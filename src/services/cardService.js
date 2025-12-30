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

const isValidBookingId = (id) => {
  if (!id) return false;
  const invalidPatterns = ['BOOKING-CREATED', 'MOCK', 'mock', 'test'];
  const idLower = id.toLowerCase();
  const invalidChecks = invalidPatterns.map(pattern => [
    id === pattern,
    idLower.includes(pattern),
  ]);
  return !invalidChecks.some(checkPair => checkPair.some(Boolean));
};

const hasValidGuestData = (data) => {
  if (!data) return false;
  
  const bookingId = data.bookingId ?? data.reservationId ?? data.reservation_id;
  if (!isValidBookingId(bookingId)) return false;
  
  const guestChecks = [
    data.primaryGuest?.firstName ?? data.primaryGuest?.lastName ?? data.primaryGuest?.name,
    Array.isArray(data.folios) && data.folios.length > 0 && 
      data.folios.some(f => f.debitor?.name ?? f.debitor?.firstName ?? f.debitor?.lastName),
    data.guest_name?.first_name ?? data.guest_name?.firstName ?? data.guest_name?.last_name ?? data.guest_name?.lastName,
  ];
  
  return guestChecks.some(Boolean);
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

export const prepareCardRegenerationData = (guestData, validationData) => {
  if (!guestData) {
    throw new Error(translateError('reservationNotFound'));
  }

  if (!hasValidGuestData(guestData)) {
    throw new Error(translateError('reservationNotFound'));
  }

  const reservationId = extractReservationId(guestData, validationData);
  if (!reservationId || !isValidBookingId(reservationId)) {
    throw new Error(translateError('reservationNotFound'));
  }

  const roomNumber = extractRoomNumber(guestData);
  if (!roomNumber) {
    throw new Error(translateError('reservationNotFound'));
  }

  const propertyId = guestData.propertyId ?? usePropertyStore.getState().propertyId;
  
  if (!propertyId) {
    throw new Error('Property ID is required. Please select a property first.');
  }
  
  return {
    reservation_id: reservationId,
    room_number: roomNumber,
    property_id: propertyId,
  };
};

export const issueCard = async (data) => {
  try {
    const response = await apiClient.post('/api/kiosk/v1/cards/issue', data);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.message ??
                   translateError('cardIssuanceFailed');
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
    const message = error?.response?.data?.message ?? 
                   error?.response?.data?.error ??
                   error?.message ?? 
                   translateError('guestValidationFailed');
    throw new Error(message);
  }
};

export const regenerateCard = async (data) => {
  const { reservation_id, room_number } = data;
  
  if (!isPresent(reservation_id)) {
    throw new Error('Reservation ID is required.');
  }

  const { propertyId, organizationId } = getPropertyIds();
  const missingIds = [propertyId, organizationId].filter(id => !isPresent(id));
  if (missingIds.length > 0) {
    throw new Error('Property configuration is missing.');
  }

  const url = `/api/kiosk/v1/lost-card/regenerate`;
  const requestBody = {
    reservation_id,
    room_number,
  };

  try {
    const response = await apiClient.post(url, requestBody);
    
    if (!response || !response.data) {
      throw new Error(translateError('cardRegenerationFailed'));
    }
    
    // Handle API response wrapper: { success: true, data: {...} }
    const apiData = response.data?.success === true && response.data?.data 
      ? response.data.data 
      : response.data;
    
    if (!apiData) {
      throw new Error(translateError('cardRegenerationFailed'));
    }

    const essentialFields = [apiData.accessCode, apiData.passcode, apiData.code, apiData.status, apiData.cardId, apiData.id];
    if (!essentialFields.some(field => field != null)) {
      throw new Error(translateError('cardRegenerationFailed'));
    }
    
    return {
      success: true,
      data: apiData,
    };
  } catch (error) {
    if (!error.response) {
      const networkErrors = [
        { check: error.code === 'ECONNREFUSED', message: translateError('cannotConnectToServer') },
        { check: error.message?.includes('Network Error'), message: translateError('cannotConnectToServer') },
        { check: error.code === 'ETIMEDOUT', message: translateError('requestTimedOut') },
      ];
      const matchedError = networkErrors.find(e => e.check);
      if (matchedError) throw new Error(matchedError.message);
      throw new Error(translateError('networkError'));
    }

    const message = error?.response?.data?.message ??
                   error?.response?.data?.error ??
                   error?.response?.statusText ??
                   error?.message ??
                   translateError('cardRegenerationFailed');
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
                   translateError('cardDispenserError');
    throw new Error(message);
  }
};
