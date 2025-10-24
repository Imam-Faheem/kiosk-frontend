import { useMutation } from '@tanstack/react-query';
import { 
  issueCard, 
  validateGuest, 
  regenerateCard,
  getCardStatus 
} from '../services/cardService';

export const useCardMutation = () => {
  const issueCardMutation = useMutation({
    mutationFn: issueCard,
    onError: (error) => {
      console.error('Card issuance failed:', error);
    }
  });

  const validateGuestMutation = useMutation({
    mutationFn: validateGuest,
    onError: (error) => {
      console.error('Guest validation failed:', error);
    }
  });

  const regenerateCardMutation = useMutation({
    mutationFn: regenerateCard,
    onError: (error) => {
      console.error('Card regeneration failed:', error);
    }
  });

  const getCardStatusMutation = useMutation({
    mutationFn: getCardStatus,
    onError: (error) => {
      console.error('Card status retrieval failed:', error);
    }
  });

  return {
    issueCard: issueCardMutation,
    validateGuest: validateGuestMutation,
    regenerateCard: regenerateCardMutation,
    getCardStatus: getCardStatusMutation
  };
};
