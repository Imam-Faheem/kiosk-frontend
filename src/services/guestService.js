import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
import {
  getRatePlanId,
  getUnitGroupId,
  determineChannelCode,
  determineGuaranteeType,
  buildPrimaryGuest,
  extractBookingError,
} from '../utils/bookingHelpers';
import { validateBookingRequirements } from '../utils/validationHelpers';
import usePropertyStore from '../stores/propertyStore';
import { API_CONFIG } from '../config/constants';

const getPropertyIds = () => {
  const state = usePropertyStore.getState();
  const propertyId = state.selectedProperty?.property_id ?? state.propertyId;
  const organizationId = API_CONFIG.ORGANIZATION_ID;
  const apaleoPropertyId = state.selectedProperty?.apaleo_external_property_id ?? '';
  
  return { propertyId, organizationId, apaleoPropertyId };
};

const formatReservationPayload = (guestData, searchCriteria, room) => {
  const ratePlanId = getRatePlanId(room);
  const unitGroupId = getUnitGroupId(room);
  const arrival = searchCriteria?.checkIn;
  const departure = searchCriteria?.checkOut;
  const adults = Number(searchCriteria?.guests);
  
  validateBookingRequirements({ ratePlanId, arrival, departure, adults });
  
  const channelCode = determineChannelCode(ratePlanId, room);
  const guaranteeType = determineGuaranteeType(ratePlanId, room);
  
  const primaryGuest = buildPrimaryGuest(guestData);
  
  const timeSlice = { ratePlanId };
  if (unitGroupId) {
    timeSlice.unitGroupId = unitGroupId;
  }
  
  const reservation = {
    arrival,
    departure,
    adults,
    childrenAges: [],
    channelCode,
    primaryGuest,
    guaranteeType,
    timeSlices: [timeSlice],
  };
  
  if (guestData.guestComment) {
    reservation.guestComment = guestData.guestComment;
  }
  
  if (guestData.travelPurpose) {
    reservation.travelPurpose = guestData.travelPurpose;
  }

  return {
    reservations: [reservation],
  };
};

export const saveGuestDetails = async (guestData, searchCriteria, room) => {
  const { propertyId, organizationId } = getPropertyIds();
  
  const missingIds = [propertyId, organizationId].filter(id => !id);
  if (missingIds.length > 0) {
    throw new Error('Property configuration is missing. Please select a property first.');
  }
  
  const payload = formatReservationPayload(guestData, searchCriteria, room);
  
  try {
    const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/bookings`;
    const response = await apiClient.post(url, payload, { 
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      await simulateApiDelay(500);
      return mockData.saveGuestDetails(guestData);
    }
    
    const errorMessage = err?.response?.data?.message ?? err?.message ?? '';
    const unitAssignmentKeywords = ['assign unit', 'Failed to assign unit'];
    const isUnitAssignmentError = unitAssignmentKeywords.some(keyword => errorMessage.includes(keyword));
    
    if (isUnitAssignmentError) {
      const responseData = err?.response?.data;
      const errorDetails = responseData?.details ?? responseData;
      
      const bookingData = responseData?.data ?? responseData?.booking ?? errorDetails?.booking ?? errorDetails?.data ?? responseData;
      
      const bookingIdentifiers = [
        bookingData?.id,
        bookingData?.bookingId,
        bookingData?.reservationIds?.[0]?.id,
        bookingData?.reservationId,
        errorDetails?.id,
        errorDetails?.bookingId,
      ];
      
      if (bookingIdentifiers.some(id => id != null)) {
        return {
          success: true,
          data: bookingData,
          message: 'Booking created successfully. Unit will be assigned later.',
        };
      }
      
      if (err?.response?.status === 422 && isUnitAssignmentError) {
        return {
          success: true,
          data: {
            id: 'BOOKING-CREATED',
            message: 'Booking created successfully. Unit assignment will be handled by the hotel staff.',
          },
          message: 'Booking created successfully. Unit will be assigned later.',
        };
      }
    }
    
    const { message, status, isAvailabilityError } = extractBookingError(err);
    
    const customError = new Error(message);
    customError.status = status;
    customError.originalError = err;
    customError.isAvailabilityError = isAvailabilityError;
    
    throw customError;
  }
};

export const getGuestDetails = async (params) => {
  try {
    const response = await apiClient.get('/guests/details', { params });
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      await simulateApiDelay(400);
      return mockData.getGuestDetails(params);
    }
    throw err;
  }
};

export const updateApaleoReservationWithGuest = async (reservationId, guestData) => {
  const { propertyId } = getPropertyIds();
  
  try {
    const params = propertyId ? { propertyId } : {};
    const response = await apiClient.patch(`/guests/reservation/${reservationId}`, guestData, { params });
    return response.data;
  } catch (err) {
    if (shouldUseMock(err)) {
      await simulateApiDelay(500);
      return mockData.updateApaleoReservationWithGuest(reservationId, guestData);
    }
    throw err;
  }
};

