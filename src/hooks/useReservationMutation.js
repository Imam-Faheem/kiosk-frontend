import { useMutation } from '@tanstack/react-query';
import { 
  validateReservation, 
  createReservation, 
  getReservationById,
  updateReservation,
  cancelReservation 
} from '../services/reservationService';

export const useReservationMutation = () => {
  const validateReservationMutation = useMutation({
    mutationFn: validateReservation,
    onError: (error) => {
      console.error('Reservation validation failed:', error);
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onError: (error) => {
      console.error('Reservation creation failed:', error);
    }
  });

  const getReservationMutation = useMutation({
    mutationFn: getReservationById,
    onError: (error) => {
      console.error('Reservation retrieval failed:', error);
    }
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ reservationId, data }) => updateReservation(reservationId, data),
    onError: (error) => {
      console.error('Reservation update failed:', error);
    }
  });

  const cancelReservationMutation = useMutation({
    mutationFn: cancelReservation,
    onError: (error) => {
      console.error('Reservation cancellation failed:', error);
    }
  });

  return {
    validateReservation: validateReservationMutation,
    createReservation: createReservationMutation,
    getReservation: getReservationMutation,
    updateReservation: updateReservationMutation,
    cancelReservation: cancelReservationMutation
  };
};
