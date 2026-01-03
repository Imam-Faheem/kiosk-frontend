import { useMutation } from './useMutation';
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
  // Transform searchAvailability response to offers format
  const searchOffers = async (data) => {
    const result = await searchRoomAvailability(data);
    // Transform availableRooms to offers format expected by SearchRoomsPage
    const offers = (result.availableRooms ?? []).map(room => {
      // Reconstruct offer format from transformed room data
      return {
        unitGroup: {
          id: room.unitGroupId ?? room.roomTypeId,
          code: room.unitGroupId ?? room.roomTypeId,
          name: room.name,
          description: room.description,
          maxPersons: room.capacity ?? room.maxGuests,
        },
        ratePlan: {
          id: room.ratePlanId,
          code: room.ratePlanId,
          name: room.name,
          description: room.description,
        },
        totalGrossAmount: {
          amount: room.totalPrice,
          currency: room.currency ?? 'EUR',
        },
        availableUnits: room.availableUnits ?? 0,
        // Preserve original offer data if available
        ...(room._offerData ?? {}),
      };
    });
    
    return {
      offers,
      property: result.property ?? {},
    };
  };

  const actionMap = {
    searchAvailability: searchRoomAvailability,
    searchOffers: searchOffers,
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
