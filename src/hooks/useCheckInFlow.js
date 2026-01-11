import { useMutation } from '@tanstack/react-query';
import { getReservationDetails, processCheckIn } from '../services/checkinService';
import { processPaymentByTerminal } from '../services/paymentService';
import { issueCard } from '../services/cardIssuanceService';

/**
 * Hook to get reservation details for check-in
 */
export const useReservationDetails = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId, lastName = null }) => {
      return await getReservationDetails(reservationId, lastName);
    },
    ...options,
  });
};

/**
 * Hook to process payment by terminal
 */
export const usePaymentByTerminal = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId, paymentData = {} }) => {
      return await processPaymentByTerminal(reservationId, paymentData);
    },
    ...options,
  });
};

/**
 * Hook to process check-in
 */
export const useCheckIn = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId, checkInData = {} }) => {
      return await processCheckIn(reservationId, checkInData);
    },
    ...options,
  });
};

/**
 * Hook to issue card after check-in
 */
export const useIssueCard = (options = {}) => {
  return useMutation({
    mutationFn: async ({ reservationId }) => {
      return await issueCard(reservationId);
    },
    ...options,
  });
};
