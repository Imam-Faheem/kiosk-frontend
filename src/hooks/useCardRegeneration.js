import { useQuery, useMutation } from '@tanstack/react-query';
import { prepareCardRegenerationData } from '../services/cardService';
import { regenerateCard } from '../services/cardService';

export const useCardRegenerationData = (guestData, validationData, enabled = true) => {
  return useQuery({
    queryKey: ['cardRegenerationData', guestData, validationData],
    queryFn: () => {
      if (!guestData || !validationData) {
        throw new Error('Guest data and validation data are required');
      }
      return prepareCardRegenerationData(guestData, validationData);
    },
    enabled: enabled && !!guestData && !!validationData,
    retry: false,
    staleTime: Infinity,
  });
};

export const useCardRegenerationMutation = (options = {}) => {
  return useMutation({
    mutationFn: regenerateCard,
    retry: (failureCount, error) => {
      const errorMessage = error?.message ?? '';
      const isReservationNotFound = errorMessage.toLowerCase().includes('reservation not found') ||
                                   errorMessage.toLowerCase().includes('reservationnotfound');
      if (isReservationNotFound) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};

