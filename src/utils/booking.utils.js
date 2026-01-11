export const buildBookingPayload = (searchCriteria, guestDetails, ratePlanId, formatDateForAPI) => {
  const primaryGuest = {
    title: guestDetails?.title ?? 'Mr',
    gender: guestDetails?.gender ?? 'Male',
    firstName: guestDetails.firstName,
    lastName: guestDetails.lastName,
    email: guestDetails.email,
    phone: guestDetails.phone,
    address: {
      addressLine1: guestDetails.addressStreet,
      postalCode: guestDetails.addressPostal,
      city: guestDetails.addressCity,
      countryCode: guestDetails.country ?? 'GB',
    },
  };

  // Handle document type - support both documentType/documentNumber and identificationType/identificationNumber
  const documentType = guestDetails.documentType ?? guestDetails.identificationType;
  const documentNumber = guestDetails.documentNumber ?? guestDetails.identificationNumber;
  
  if (documentType && documentNumber) {
    primaryGuest.identificationDocument = {
      type: documentType,
      number: documentNumber,
    };
  }

  if (guestDetails.nationalityCountryCode) {
    primaryGuest.nationalityCountryCode = guestDetails.nationalityCountryCode;
  }

  if (guestDetails.birthDate) {
    primaryGuest.birthDate = formatDateForAPI(guestDetails.birthDate);
  }

  if (guestDetails.birthPlace) {
    primaryGuest.birthPlace = guestDetails.birthPlace;
  }

  return {
    reservations: [
      {
        arrival: formatDateForAPI(searchCriteria.checkIn),
        departure: formatDateForAPI(searchCriteria.checkOut),
        adults: Number(searchCriteria.guests) ?? 1,
        guestComment: guestDetails?.guestComment ?? guestDetails?.comment ?? '',
        channelCode: 'Direct',
        primaryGuest,
        guaranteeType: guestDetails?.guaranteeType ?? 'CreditCard',
        travelPurpose: guestDetails?.travelPurpose ?? 'Business',
        timeSlices: [{ ratePlanId }],
      },
    ],
  };
};

export const getBookingErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  const status = error?.response?.status;
  const errorCode = error?.response?.data?.code;
  const errorMessage = error?.response?.data?.message ?? error?.response?.data?.error;
  const statusText = error?.response?.statusText;

  // Handle by HTTP status code
  switch (status) {
    case 400:
      return errorMessage || 'Invalid booking request. Please check your information and try again.';
    case 401:
      return 'Authentication failed. Please try again.';
    case 403:
      return 'You do not have permission to create this booking.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return errorMessage || 'This booking conflicts with an existing reservation.';
    case 422:
      return errorMessage || 'Validation error. Please check all required fields.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      break;
  }

  // Handle by error code if available
  if (errorCode) {
    const errorCodeMessages = {
      ROOM_NOT_AVAILABLE: 'The selected room is no longer available. Please choose another room.',
      ROOM_UNAVAILABLE: 'The selected room is no longer available. Please choose another room.',
      INVALID_DATE_RANGE: 'Invalid check-in or check-out date. Please select valid dates.',
      INVALID_DATES: 'Invalid check-in or check-out date. Please select valid dates.',
      GUEST_VALIDATION_FAILED: 'Invalid guest information. Please check all required fields.',
      INVALID_GUEST_DATA: 'Invalid guest information. Please check all required fields.',
      RATE_PLAN_NOT_FOUND: 'The selected rate plan is no longer available.',
      INVALID_RATE_PLAN: 'The selected rate plan is no longer available.',
      PAYMENT_REQUIRED: 'Payment processing failed. Please try again or use a different payment method.',
      PAYMENT_FAILED: 'Payment processing failed. Please try again or use a different payment method.',
      PROPERTY_NOT_FOUND: 'Property not found. Please select a valid property.',
      ORGANIZATION_NOT_FOUND: 'Organization not found.',
    };

    if (errorCodeMessages[errorCode]) {
      return errorCodeMessages[errorCode];
    }
  }

  // Handle network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timeout. The server took too long to respond. Please try again.';
    }
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message || 'Network error. Please check your connection.';
  }

  // Fallback to error message or status text
  return errorMessage || statusText || error.message || 'Failed to create booking. Please try again.';
};

