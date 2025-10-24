import { useMutation } from '@tanstack/react-query';
import { 
  searchRoomAvailability, 
  getRoomDetails,
  getAllRoomTypes,
  calculateRoomPricing 
} from '../services/roomService';

/**
 * Unified room mutation hook
 * @param {string} action - The action to perform: 'searchAvailability', 'getDetails', 'getAll'
 * @param {Object} callbacks - Optional onSuccess and onError callbacks
 * @returns {Object} - React Query mutation object or function
 */
export const useRoomMutation = (action, { onSuccess, onError } = {}) => {
  // Special case for non-mutation function
  if (action === 'calculatePricing') {
    return calculateRoomPricing;
  }

  const actionMap = {
    searchAvailability: searchRoomAvailability,
    getDetails: getRoomDetails,
    getAll: getAllRoomTypes,
  };

  const mutationFn = actionMap[action];

  if (!mutationFn) {
    throw new Error(`Invalid room action: ${action}`);
  }

  return useMutation({
    mutationFn,
    onSuccess,
    onError: (error) => {
      console.error(`Room ${action} failed:`, error);
      if (onError) onError(error);
    },
  });
};
