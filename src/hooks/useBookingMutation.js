import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '../services/bookingService';

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
      onError?.(error);
    },
  });
};

