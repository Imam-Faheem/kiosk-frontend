import { useQuery, useMutation } from '@tanstack/react-query';
import { searchRoomAvailability } from '../services/roomService';
import { createBooking } from '../services/bookingService';
import { getReservationDetails, processCheckIn } from '../services/checkinService';
import { processPaymentByTerminal } from '../services/paymentService';
import { issueCard } from '../services/cardIssuanceService';

/**
 * Hook to get room offers for new reservation
 */
export const useRoomOffers = (searchParams, options = {}) => {
  return useQuery({
    queryKey: ['roomOffers', searchParams],
    queryFn: async () => {
      if (!searchParams?.arrival || !searchParams?.departure) {
        throw new Error('Arrival and departure dates are required');
      }
      return await searchRoomAvailability(searchParams);
    },
    enabled: options.enabled !== false && !!searchParams?.arrival && !!searchParams?.departure,
    ...options,
  });
};

/**
 * Hook to create booking
 */
export const useCreateBooking = (options = {}) => {
  return useMutation({
    mutationFn: async (bookingData) => {
      return await createBooking(bookingData);
    },
    ...options,
  });
};

/**
 * Re-export check-in flow hooks for new reservations
 */
export { useReservationDetails, usePaymentByTerminal, useCheckIn, useIssueCard } from './useCheckInFlow';
