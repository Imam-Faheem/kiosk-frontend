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

  if (guestDetails.documentType && guestDetails.documentNumber) {
    primaryGuest.identificationDocument = {
      type: guestDetails.documentType,
      number: guestDetails.documentNumber,
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
        guestComment: guestDetails?.guestComment ?? '',
        channelCode: 'Direct',
        primaryGuest,
        guaranteeType: guestDetails?.guaranteeType ?? 'CreditCard',
        travelPurpose: guestDetails?.travelPurpose ?? 'Business',
        timeSlices: [{ ratePlanId }],
      },
    ],
  };
};

