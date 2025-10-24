import { useMutation } from '@tanstack/react-query';
import { 
  searchRoomAvailability, 
  getRoomDetails,
  getAllRoomTypes,
  calculateRoomPricing 
} from '../services/roomService';

export const useRoomMutation = () => {
  const searchAvailabilityMutation = useMutation({
    mutationFn: searchRoomAvailability,
    onError: (error) => {
      console.error('Room availability search failed:', error);
    }
  });

  const getRoomDetailsMutation = useMutation({
    mutationFn: getRoomDetails,
    onError: (error) => {
      console.error('Room details retrieval failed:', error);
    }
  });

  const getAllRoomTypesMutation = useMutation({
    mutationFn: getAllRoomTypes,
    onError: (error) => {
      console.error('Room types retrieval failed:', error);
    }
  });

  return {
    searchAvailability: searchAvailabilityMutation,
    getRoomDetails: getRoomDetailsMutation,
    getAllRoomTypes: getAllRoomTypesMutation,
    calculatePricing: calculateRoomPricing
  };
};
