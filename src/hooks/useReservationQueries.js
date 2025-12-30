import { useQuery } from '@tanstack/react-query';
import { getPaymentAccount } from '../services/paymentService';

export const usePaymentAccount = (reservation) => {
  const paymentAccountId =
    reservation?.paymentData?.data?.id ??
    reservation?.paymentData?.id ??
    reservation?.paymentData?.success?.data?.id;

  return useQuery({
    queryKey: ['payment-account', paymentAccountId],
    queryFn: () => getPaymentAccount(paymentAccountId),
    enabled: Boolean(paymentAccountId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

