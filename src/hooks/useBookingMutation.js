import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../services/bookingService';
import { getBookingErrorMessage } from '../utils/booking.utils';

export const useBookingMutation = ({ onSuccess, onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingPayload, propertyId }) => {
      return await createBooking(bookingPayload, propertyId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      onSuccess?.(data, variables);
    },
    onError: (error) => {
      const errorMessage = getBookingErrorMessage(error);
      onError?.(error, errorMessage);
    },
  });
};

