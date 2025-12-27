import { GUEST_DETAILS_OPTIONS } from '../config/constants';

export const getRatePlanId = (room) => {
  return room?.ratePlan?.id ?? room?.ratePlanId ?? null;
};

export const getUnitGroupId = (room) => {
  return room?.unitGroup?.id ?? room?.unitGroupId ?? room?.unitGroup?.unitGroupId ?? null;
};

export const determineChannelCode = (ratePlanId, room) => {
  if (room?.channelCode) {
    return room.channelCode;
  }
  
  const ratePlanUpper = ratePlanId?.toUpperCase() ?? '';
  if (ratePlanUpper.includes('OTA')) {
    return 'BookingCom';
  }
  
  return 'Direct';
};

export const determineGuaranteeType = (ratePlanId, room) => {
  if (room?.guaranteeType) {
    return room.guaranteeType;
  }
  
  if (room?.ratePlan?.guaranteeType) {
    return room.ratePlan.guaranteeType;
  }
  
  const ratePlanUpper = ratePlanId?.toUpperCase() ?? '';
  const prepaymentKeywords = ['PREPAY', 'PREPAID', 'NONREF', 'NON-REF', 'OTA'];
  
  if (prepaymentKeywords.some(keyword => ratePlanUpper.includes(keyword))) {
    return 'Prepayment';
  }
  
  return 'CreditCard';
};

export const calculateNights = (arrival, departure) => {
  const arrivalDate = new Date(arrival);
  const departureDate = new Date(departure);
  const nights = Math.ceil((departureDate - arrivalDate) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) {
    throw new Error('Invalid date range: departure must be after arrival');
  }
  
  return nights;
};

export const buildTimeSlices = ({ ratePlanId, unitGroupId, nights, totalAmount }) => {
  const amountPerNight = totalAmount?.amount ? totalAmount.amount / nights : null;
  
  return Array.from({ length: nights }, () => {
    const timeSlice = { ratePlanId };
    
    if (unitGroupId) {
      timeSlice.unitGroupId = unitGroupId;
    }
    
    if (amountPerNight && totalAmount?.currency) {
      timeSlice.totalAmount = {
        amount: amountPerNight,
        currency: totalAmount.currency,
      };
    }
    
    return timeSlice;
  });
};

export const buildPrimaryGuest = (guestData) => {
  const primaryGuest = {
    title: guestData.title,
    gender: guestData.gender,
    firstName: guestData.firstName,
    lastName: guestData.lastName,
    email: guestData.email,
    phone: guestData.phone,
    address: {
      addressLine1: guestData.addressStreet,
      postalCode: guestData.addressPostal,
      city: guestData.addressCity,
      countryCode: guestData.country,
    },
  };
  
  if (guestData.birthDate) {
    primaryGuest.birthDate = guestData.birthDate;
  }
  
  if (guestData.nationalityCountryCode) {
    primaryGuest.nationalityCountryCode = guestData.nationalityCountryCode;
  }
  
  if (guestData.birthPlace) {
    primaryGuest.birthPlace = guestData.birthPlace;
  }
  
  if (guestData.documentType && guestData.documentNumber) {
    primaryGuest.identificationDocument = {
      type: GUEST_DETAILS_OPTIONS.DOCUMENT_TYPE_MAP[guestData.documentType] ?? guestData.documentType,
      number: guestData.documentNumber,
    };
  }
  
  return primaryGuest;
};

export const extractBookingError = (error) => {
  let userMessage = 'Failed to create booking. Please try again.';
  
  if (error?.response?.data) {
    const errorData = error.response.data;
    
    if (errorData?.details?.message) {
      userMessage = errorData.details.message;
    } else if (errorData?.details?.messages && Array.isArray(errorData.details.messages)) {
      userMessage = errorData.details.messages.join('. ');
    } else if (errorData?.message) {
      userMessage = errorData.message;
    } else if (errorData?.error) {
      userMessage = errorData.error;
    } else if (typeof errorData === 'string') {
      userMessage = errorData;
    }
  } else if (error?.message) {
    userMessage = error.message;
  }
  
  const availabilityKeywords = ['fully booked', 'not available', 'unit group'];
  const isAvailabilityError = availabilityKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  return {
    message: userMessage,
    status: error?.response?.status,
    isAvailabilityError,
    originalError: error,
  };
};

