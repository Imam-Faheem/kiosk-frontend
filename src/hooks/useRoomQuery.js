import { useQuery } from '@tanstack/react-query';
import { getRoomDetails } from '../services/roomService';
import usePropertyStore from '../stores/propertyStore';

export const useRoomQuery = (roomTypeId, options = {}) => {
  const propertyId = usePropertyStore((state) => state.propertyId);
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['roomDetails', roomTypeId, propertyId],
    queryFn: async () => {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      const result = await getRoomDetails(roomTypeId, propertyId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch room details');
      }
      return result;
    },
    enabled: enabled && !!roomTypeId && !!propertyId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
};

