import { useMutation as useReactQueryMutation } from '@tanstack/react-query';

/**
 * Unified mutation hook that accepts an action and optional callbacks
 * @param {Function} mutationFn - The function to call for the mutation
 * @param {Object} options - Optional configuration
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback  
 * @param {Function} options.onSettled - Settled callback
 * @returns {Object} - React Query mutation object
 */
export const useMutation = (mutationFn, options = {}) => {
  return useReactQueryMutation({
    mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
  });
};
