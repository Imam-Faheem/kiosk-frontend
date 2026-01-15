import { useMutation } from './useMutation';
import {
  processCheckIn,
  getCheckInStatus,
  canCheckIn
} from '../services/checkinService';

/**
 * Unified check-in mutation hook
 * @param {string} action - The action to perform: 'process', 'getStatus', 'canCheckIn'
 * @param {Object} callbacks - Optional onSuccess and onError callbacks
 * @returns {Object} - React Query mutation object
 */
export const useCheckInMutation = (action, { onSuccess, onError } = {}) => {
  const actionMap = {
    process: processCheckIn,
    getStatus: getCheckInStatus,
    canCheckIn: canCheckIn,
  };

  const mutationFn = actionMap[action];

  if (!mutationFn) {
    throw new Error(`Invalid check-in action: ${action}`);
  }

  return useMutation(mutationFn, {
    onSuccess,
    onError: (error) => {
      if (onError) onError(error);
    },
  });
};

