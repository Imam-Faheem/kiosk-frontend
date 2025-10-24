import { useMutation } from '@tanstack/react-query';
import { 
  checkPaymentStatus, 
  initiatePayment, 
  pollPaymentStatus,
  processPayment 
} from '../services/paymentService';

export const usePaymentMutation = () => {
  const checkPaymentStatusMutation = useMutation({
    mutationFn: checkPaymentStatus,
    onError: (error) => {
      console.error('Payment status check failed:', error);
    }
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: initiatePayment,
    onError: (error) => {
      console.error('Payment initiation failed:', error);
    }
  });

  const pollPaymentStatusMutation = useMutation({
    mutationFn: pollPaymentStatus,
    onError: (error) => {
      console.error('Payment status polling failed:', error);
    }
  });

  const processPaymentMutation = useMutation({
    mutationFn: processPayment,
    onError: (error) => {
      console.error('Payment processing failed:', error);
    }
  });

  return {
    checkPaymentStatus: checkPaymentStatusMutation,
    initiatePayment: initiatePaymentMutation,
    pollPaymentStatus: pollPaymentStatusMutation,
    processPayment: processPaymentMutation
  };
};
