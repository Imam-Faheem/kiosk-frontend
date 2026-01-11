import { useMutation } from './useMutation';
import { 
  searchRoomAvailability, 
  getRoomDetails,
  getAllRoomTypes,
  calculateRoomPricing 
} from '../services/roomService';

export const useRoomMutation = (action, { onSuccess, onError } = {}) => {
  const actionMap = {
    searchAvailability: searchRoomAvailability,
    getDetails: getRoomDetails,
    getAll: getAllRoomTypes,
  };

  const mutationFn = actionMap[action];

  // Always call useMutation hook, but handle special cases
  const mutation = useMutation(
    mutationFn ?? (() => {
      throw new Error(`Invalid room action: ${action}`);
    }),
    {
      onSuccess,
      onError: (error) => {
        console.error(`Room ${action} failed:`, error);
        if (onError) onError(error);
      },
    }
  );

  // Special case for non-mutation function
  if (action === 'calculatePricing') {
    return calculateRoomPricing;
  }

  return mutation;
};
