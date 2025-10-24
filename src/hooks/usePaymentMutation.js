import { useMutation } from '@tanstack/react-query';
import { 
  checkPaymentStatus, 
  initiatePayment, 
  pollPaymentStatus,
  processPayment 
} from '../services/paymentService';

/**
 * Unified payment mutation hook
 * @param {string} action - The action to perform: 'checkStatus', 'initiate', 'poll', 'process'
 * @param {Object} callbacks - Optional onSuccess and onError callbacks
 * @returns {Object} - React Query mutation object
 */
export const usePaymentMutation = (action, { onSuccess, onError } = {}) => {
  const actionMap = {
    checkStatus: checkPaymentStatus,
    initiate: initiatePayment,
    poll: pollPaymentStatus,
    process: processPayment,
  };

  const mutationFn = actionMap[action];

  if (!mutationFn) {
    throw new Error(`Invalid payment action: ${action}`);
  }

  return useMutation({
    mutationFn,
    onSuccess,
    onError: (error) => {
      console.error(`Payment ${action} failed:`, error);
      if (onError) onError(error);
    },
  });
};
