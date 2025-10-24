import { useMutation } from '@tanstack/react-query';
import { 
  issueCard, 
  validateGuest, 
  regenerateCard,
  getCardStatus 
} from '../services/cardService';

/**
 * Unified card mutation hook
 * @param {string} action - The action to perform: 'issue', 'validate', 'regenerate', 'getStatus'
 * @param {Object} callbacks - Optional onSuccess and onError callbacks
 * @returns {Object} - React Query mutation object
 */
export const useCardMutation = (action, { onSuccess, onError } = {}) => {
  const actionMap = {
    issue: issueCard,
    validate: validateGuest,
    regenerate: regenerateCard,
    getStatus: getCardStatus,
  };

  const mutationFn = actionMap[action];

  if (!mutationFn) {
    throw new Error(`Invalid card action: ${action}`);
  }

  return useMutation({
    mutationFn,
    onSuccess,
    onError: (error) => {
      console.error(`Card ${action} failed:`, error);
      if (onError) onError(error);
    },
  });
};
