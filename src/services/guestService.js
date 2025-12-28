import { apiClient } from './api/apiClient';
import { mockData, shouldUseMock, simulateApiDelay } from './mockData';
import {
  getRatePlanId,
  getUnitGroupId,
  determineChannelCode,
  determineGuaranteeType,
  calculateNights,
  buildTimeSlices,
  buildPrimaryGuest,
  extractBookingError,
} from '../utils/bookingHelpers';
import { validateBookingRequirements } from '../utils/validationHelpers';

const formatReservationPayload = (guestData, searchCriteria, room) => {
  const ratePlanId = getRatePlanId(room);
  const unitGroupId = getUnitGroupId(room);
  const arrival = searchCriteria?.checkIn;
  const departure = searchCriteria?.checkOut;
  const adults = Number(searchCriteria?.guests);
  
  validateBookingRequirements({ ratePlanId, arrival, departure, adults });
  
  const channelCode = determineChannelCode(ratePlanId, room);
  const guaranteeType = determineGuaranteeType(ratePlanId, room);
  
  const nights = calculateNights(arrival, departure);
  const timeSlices = buildTimeSlices({
    ratePlanId,
    unitGroupId,
    nights,
    totalAmount: room?.totalGrossAmount,
  });
  
  const primaryGuest = buildPrimaryGuest(guestData);
  
  const reservation = {
    arrival,
    departure,
    adults,
    childrenAges: [],
    channelCode,
    primaryGuest,
    guaranteeType,
    timeSlices,
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

export const saveGuestDetails = async (guestData, organizationId, propertyId, searchCriteria, room, apaleoPropertyId) => {
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
      const bookingData = responseData?.data ?? responseData?.booking ?? responseData;
      
      const bookingIdentifiers = [bookingData?.id, bookingData?.bookingId, bookingData?.reservationIds, bookingData?.reservationId];
      if (bookingIdentifiers.some(id => id != null)) {
        return {
          success: true,
          data: bookingData,
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

export const updateApaleoReservationWithGuest = async (reservationId, guestData, propertyId) => {
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

