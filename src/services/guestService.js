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
  
  // Validate required fields
  validateBookingRequirements({ ratePlanId, arrival, departure, adults });
  
  // Warn if unitGroupId is missing (Apaleo will auto-assign)
  if (!unitGroupId) {
    console.warn('UnitGroupId not found in room data. Apaleo will auto-assign a unit.');
  }
  
  // Determine channel code and guarantee type
  const channelCode = determineChannelCode(ratePlanId, room);
  const guaranteeType = determineGuaranteeType(ratePlanId, room);
  
  // Calculate nights and build time slices
  const nights = calculateNights(arrival, departure);
  const timeSlices = buildTimeSlices({
    ratePlanId,
    unitGroupId,
    nights,
    totalAmount: room?.totalGrossAmount,
  });
  
  // Build primary guest object
  const primaryGuest = buildPrimaryGuest(guestData);
  
  // Build reservation object in the order expected by backend
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
  
  // Add optional fields if provided
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
  
  // Log payload for debugging (remove in production or use proper logging)
  if (process.env.NODE_ENV === 'development') {
    console.log('Booking Payload:', JSON.stringify(payload, null, 2));
  }
  
  try {
    const url = `/api/kiosk/v1/organizations/${organizationId}/properties/${propertyId}/bookings`;
    const response = await apiClient.post(url, payload, { 
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (err) {
    // Log error for debugging
    if (err?.response && process.env.NODE_ENV === 'development') {
      console.error('Booking API Error:', {
        status: err.response.status,
        message: err.response.data?.message ?? err.message,
        data: err.response.data,
        url: err.config?.url,
      });
    }
    
    if (shouldUseMock(err)) {
      await simulateApiDelay(500);
      return mockData.saveGuestDetails(guestData);
    }
    
    // Extract and format error message
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

