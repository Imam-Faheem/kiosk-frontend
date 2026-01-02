import { useMutation } from './useMutation';
import { saveGuestDetails } from '../services/guestService';

export const useGuestMutation = (options = {}) => {
  return useMutation(saveGuestDetails, {
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
  });
};

