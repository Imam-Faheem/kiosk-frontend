import { useMutation } from '@tanstack/react-query';
import { validateLostCard } from '../services/lostCardService';
import { issueCard } from '../services/cardIssuanceService';

/**
 * Hook to validate lost card request
 */
export const useValidateLostCard = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId }) => {
      return await validateLostCard(reservationId);
    },
    ...options,
  });
};

/**
 * Hook to issue card for lost card
 */
export const useIssueCardForLostCard = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId }) => {
      return await issueCard(reservationId);
    },
    ...options,
  });
};
