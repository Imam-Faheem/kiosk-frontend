import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, getReservation } from '../services/bookingService';
import { updateApaleoReservationWithGuest } from '../services/guestService';
import { processPaymentByTerminal } from '../services/paymentService';
import usePropertyStore from '../stores/propertyStore';
import { API_CONFIG } from '../config/constants';

const extractReservationId = (result) => {
  if (!result) return null;
  
  const sources = [
    result?.data?.reservationIds?.[0]?.id,
    result?.reservationIds?.[0]?.id,
    result?.data?.id,
    result?.data?.reservationId,
    result?.id,
    result?.reservationId,
    result?.bookingId,
    result?.data?.bookingId,
    result?.reservation?.id,
    result?.reservation?.bookingId,
    result?.reservations?.[0]?.id,
    result?.reservations?.[0]?.bookingId,
  ];
  
  return sources.find(id => id != null && id !== 'BOOKING-CREATED') ?? null;
};

const buildBookingPayload = (searchCriteria, guestDetails, ratePlanId, formatDateForAPI) => {
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

const getOrganizationId = () => 
  usePropertyStore.getState().selectedProperty?.organization_id ?? API_CONFIG.ORGANIZATION_ID;

const safeAsync = async (fn, fallback = null) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const processPayment = async (reservationId, { propertyId, organizationId, totalAmount }) => {
  const result = await safeAsync(
    () => processPaymentByTerminal(reservationId, {
      propertyId,
      organizationId,
      amount: totalAmount.amount,
      currency: totalAmount.currency,
    })
  );
  
  return result 
    ? { success: true, data: result }
    : { success: false, error: 'Payment processing failed', message: 'Payment will be processed separately' };
};

const processBookingFlow = async ({ propertyId, reservationId, guestDetails, totalAmount }) => {
  const organizationId = getOrganizationId();
  if (!organizationId) {
    throw new Error('Organization ID is required for payment processing.');
  }

  const [detailsResult] = await Promise.allSettled([
    safeAsync(() => getReservation(reservationId, propertyId)),
    safeAsync(() => updateApaleoReservationWithGuest(reservationId, guestDetails, propertyId)),
  ]);

  const reservationDetails = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
  const paymentResult = await processPayment(reservationId, { propertyId, organizationId, totalAmount });

  return { reservationDetails, paymentResult };
};

const extractErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const errorData = error?.response?.data;
  const messageSources = [
    errorData?.details?.messages,
    errorData?.messages,
    errorData?.message,
    errorData?.error,
    error?.message,
  ];

  for (const source of messageSources) {
    if (!source) continue;
    if (Array.isArray(source)) return source.join('. ');
    if (typeof source === 'string') {
      const isNetwork = source.includes('Network') || source.includes('ERR_');
      return isNetwork ? 'Network error. Please check your connection and try again.' : source;
    }
  }
  
  return 'Failed to create booking. Please try again.';
};

const validateBookingResult = (result) => {
  if (!result) throw new Error('No response from booking service. Please try again.');
  if (result.success === false || result.error) {
    throw new Error(result.message ?? result.error ?? 'Failed to create booking. Please try again.');
  }
};

const isBookingSuccessfulWithoutId = (result) => {
  if (result.success === true) return true;
  const hasData = result.data ?? result.id;
  return result.success === undefined && !result.error && hasData;
};

export const useBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingPayload, propertyId, guestDetails, totalAmount }) => {
      const bookingResult = await createBooking(bookingPayload, propertyId);
      validateBookingResult(bookingResult);

      const reservationId = extractReservationId(bookingResult);
      
      if (!reservationId) {
        if (isBookingSuccessfulWithoutId(bookingResult)) {
          return { reservationId: null, bookingResult, isPending: true };
        }
        throw new Error(
          bookingResult?.message 
          ?? bookingResult?.error 
          ?? 'Booking created but no reservation ID returned. Please contact support.'
        );
      }

      const { reservationDetails, paymentResult } = await processBookingFlow({
        propertyId,
        reservationId,
        guestDetails,
        totalAmount,
      });

      return {
        reservationId,
        bookingResult,
        reservationDetails,
        paymentResult,
        isPending: false,
      };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
    throwOnError: false,
  });
};

export { extractErrorMessage };

