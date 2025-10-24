import { useMutation } from './useMutation';
import { 
  validateReservation, 
  createReservation, 
  getReservationById,
  updateReservation,
  cancelReservation 
} from '../services/reservationService';

/**
 * Unified reservation mutation hook
 * @param {string} action - The action to perform: 'validate', 'create', 'get', 'update', 'cancel'
 * @param {Object} callbacks - Optional onSuccess and onError callbacks
 * @returns {Object} - React Query mutation object
 */
export const useReservationMutation = (action, { onSuccess, onError } = {}) => {
  const actionMap = {
    validate: validateReservation,
    create: createReservation,
    get: getReservationById,
    update: ({ reservationId, data }) => updateReservation(reservationId, data),
    cancel: cancelReservation,
  };

  const mutationFn = actionMap[action];

  if (!mutationFn) {
    throw new Error(`Invalid reservation action: ${action}`);
  }

  return useMutation({
    mutationFn,
    onSuccess,
    onError: (error) => {
      console.error(`Reservation ${action} failed:`, error);
      if (onError) onError(error);
    },
  });
};
