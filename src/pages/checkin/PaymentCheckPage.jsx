import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Title,
  Stack,
  Box,
  Alert,
  Button,
} from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconLoader2,
  IconShield,
  IconUser,
  IconBed,
  IconPhone,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useLanguage from '../../hooks/useLanguage';
import { getPaymentAccount } from '../../services/paymentService';
import '../../styles/animations.css';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';

const PaymentCheckPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const isPaymentCompleted = (status) => {
    return status === 'Success' || status === 'completed' || status === 'paid';
  };


  const extractPaymentAccountId = (reservation, checkInData, folios) => {
    const sources = [
      checkInData?.paymentAccountId,
      checkInData?.paymentAccount?.id,
      reservation?.paymentAccountId,
      reservation?.paymentAccount?.id,
      folios?.[0]?.paymentAccountId,
      location.state?.paymentAccountId,
    ];
    return sources.find(id => id != null);
  };

  const getBalanceFromFolios = (folios) => {
    if (!Array.isArray(folios) || folios.length === 0) return null;
    const mainFolio = folios.find(f => f.isMainFolio) ?? folios[0];
    return mainFolio?.balance;
  };

  const getBalanceFromData = (checkInData, reservation, folios) => {
    const folioBalance = getBalanceFromFolios(folios);
    if (folioBalance !== null) return folioBalance;
    
    const checkInBalance = checkInData?.balance ?? checkInData?.payableAmount?.guest;
    if (checkInBalance) return checkInBalance;
    
    const reservationBalance = reservation?.balance ?? reservation?.payableAmount?.guest;
    if (reservationBalance) return reservationBalance;
    
    return null;
  };

  const reservation = location.state?.reservation;
  const checkInData = location.state?.checkInData;
  const folios = location.state?.folios;

  const paymentAccountId = extractPaymentAccountId(reservation, checkInData, folios);
  const balanceData = getBalanceFromData(checkInData, reservation, folios);
  const hasFoliosData = Array.isArray(folios) && folios.length > 0;

  const { data: paymentAccount, isLoading: loadingPayment, error: paymentError } = useQuery({
    queryKey: ['paymentAccount', paymentAccountId],
    queryFn: () => getPaymentAccount(paymentAccountId),
    enabled: !!paymentAccountId,
    retry: false,
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    if (paymentError) {
      console.error('Payment account fetch error:', paymentError);
      setError(paymentError.message ?? t('error.paymentFailed'));
      setPaymentFailed(true);
      setLoading(false);
      return;
    }

    if (paymentAccountId && loadingPayment) {
      setLoading(true);
      return;
    }

    console.log('Payment check data:', {
      paymentAccountId,
      hasPaymentAccount: !!paymentAccount,
      balanceData,
      hasFoliosData,
      hasCheckInData: !!checkInData,
      folios: folios?.length ?? 0,
    });

    if (paymentAccountId && paymentAccount) {
      const status = paymentAccount.status ?? 'Pending';
      const balance = balanceData?.amount ?? paymentAccount.balance?.amount ?? 0;
      const currency = balanceData?.currency ?? paymentAccount.balance?.currency ?? 'EUR';
      const hasFailure = status === 'Failure' || paymentAccount.failureReason;
      
      const paymentStatusData = {
        status,
        amount: Math.abs(balance),
        currency,
        balance,
        transactionId: paymentAccount.id ?? paymentAccountId,
        failureReason: paymentAccount.failureReason,
      };

      setPaymentStatus(paymentStatusData);
      setLoading(false);

      setPaymentFailed(hasFailure);

      setTimeout(() => {
        if (isPaymentCompleted(status) || balance <= 0) {
          navigate('/checkin/card-dispensing', {
            state: { reservation, paymentStatus: paymentStatusData, checkInData, folios }
          });
        } else {
          navigate('/checkin/payment', {
            state: { reservation, paymentStatus: paymentStatusData, checkInData, folios }
          });
        }
      }, 5000);
      return;
    }

    if (!paymentAccountId && (balanceData !== null || hasFoliosData || checkInData)) {
      const hasValidReservationId = reservation?.id ?? reservation?.bookingId;
      const hasValidCheckInData = checkInData?.bookingId ?? checkInData?.id;
      
      if (!hasValidReservationId && !hasValidCheckInData) {
        setError(t('error.paymentAccountNotFound'));
        setPaymentFailed(true);
        setLoading(false);
        return;
      }

      const balance = balanceData?.amount ?? 0;
      const currency = balanceData?.currency ?? 'EUR';
      const status = balance <= 0 ? 'Success' : 'Pending';
      
      const paymentStatusData = {
        status,
        amount: Math.abs(balance),
        currency,
        balance,
        transactionId: checkInData?.bookingId ?? reservation?.id ?? reservation?.bookingId,
      };

      setPaymentStatus(paymentStatusData);
      setLoading(false);

      setPaymentFailed(false);

      setTimeout(() => {
        if (balance <= 0) {
          navigate('/checkin/card-dispensing', {
            state: { reservation, paymentStatus: paymentStatusData, checkInData, folios }
          });
        } else {
          navigate('/checkin/payment', {
            state: { reservation, paymentStatus: paymentStatusData, checkInData, folios }
          });
        }
      }, 5000);
      return;
    }

    console.warn('No payment information found:', {
      reservation: !!reservation,
      checkInData: !!checkInData,
      folios: folios?.length ?? 0,
      balanceData,
      paymentAccountId,
    });
    
    setError(t('error.paymentAccountNotFound'));
    setPaymentFailed(true);
    setLoading(false);
  }, [reservation, paymentAccount, paymentAccountId, loadingPayment, paymentError, balanceData, hasFoliosData, checkInData, folios, navigate, t]);

  const handleBack = () => {
    navigate('/checkin');
  };

  if (!reservation) {
    return null;
  }

  return (
    <Container
      size="lg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      p={20}
      bg="#FFFFFF"
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        w="100%"
        maw={600}
        bg="#ffffff"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        {/* Content */}
        <Stack gap="lg" mb="xl">
          {loading ? (
            <>
              {/* Status Headline */}
              <Stack gap={8} align="center" mb={24}>
                <Title 
                  order={2} 
                  fw={700} 
                  c="dark.9" 
                  ta="center"
                  fz={24}
                  lts={-0.3}
                >
                  {t('paymentCheck.verifyingPaymentStatus')}
                </Title>
                <Text 
                  size="sm" 
                  c="dimmed" 
                  ta="center"
                  maw={500}
                  lh={1.6}
                >
                  {t('paymentCheck.pleaseWaitCheckingPayment')}
                </Text>
              </Stack>

              {/* Loading Indicator with Progress */}
              <Box
                p={24}
                bg="rgba(200, 101, 61, 0.02)"
                radius="md"
                style={{
                  border: '1px solid rgba(200, 101, 61, 0.1)',
                }}
              >
                <Stack align="center" gap={24}>
                  <Box className="loading-pulse">
                    <IconLoader2 
                      size={64} 
                      color="#C8653D"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  </Box>
                  <Stack align="center" gap={8}>
                    <Text size="sm" c="dimmed" ta="center">
                      {t('paymentCheck.processingPaymentVerification')}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      {t('paymentCheck.pleaseWait')}
                    </Text>
                  </Stack>
                </Stack>
              </Box>
            </>
          ) : error ? (
            <Alert
                icon={<IconX size={20} />}
                title={t('paymentCheck.verificationError')}
              color="red"
              variant="light"
                radius="md"
                styles={{ root: { border: '1px solid rgba(250, 82, 82, 0.2)' } }}
            >
                <Text size="md" fw={500} c="red.7">
              {error}
                </Text>
                <Text size="sm" c="dimmed" mt={8}>
                  {t('paymentCheck.pleaseTryAgainOrContact')}
                </Text>
            </Alert>
          ) : (
            <>
              {/* Status Headline */}
              <Stack gap={8} align="center" mb={24}>
                <Title 
                  order={2} 
                  fw={700} 
                  c="dark.9" 
                  ta="center"
                  fz={24}
                  lts={-0.3}
                >
                  {isPaymentCompleted(paymentStatus?.status) 
                    ? t('paymentCheck.paymentCompleted') 
                    : paymentFailed 
                    ? t('paymentCheck.paymentFailed') 
                    : t('paymentCheck.paymentVerification')}
                </Title>
                <Text 
                  size="sm" 
                  c="dimmed" 
                  ta="center"
                  maw={500}
                  lh={1.6}
                >
                  {isPaymentCompleted(paymentStatus?.status)
                    ? t('paymentCheck.paymentConfirmed')
                    : paymentFailed
                    ? t('paymentCheck.unableToVerifyPayment')
                    : t('paymentCheck.paymentVerificationInProgress')}
                </Text>
              </Stack>

              {/* Payment Status */}
              {paymentStatus && (
                <Box
                  p={24}
                  bg={isPaymentCompleted(paymentStatus.status) 
                    ? 'rgba(34, 197, 94, 0.02)' 
                    : paymentFailed 
                    ? 'rgba(239, 68, 68, 0.02)' 
                    : 'rgba(200, 101, 61, 0.02)'}
                  radius="md"
                  style={{
                    border: isPaymentCompleted(paymentStatus.status) 
                      ? '1px solid rgba(34, 197, 94, 0.15)' 
                      : paymentFailed 
                      ? '1px solid rgba(239, 68, 68, 0.15)' 
                      : '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Stack gap={20}>
                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                      bg={isPaymentCompleted(paymentStatus.status) 
                        ? 'rgba(34, 197, 94, 0.08)' 
                        : paymentFailed 
                        ? 'rgba(239, 68, 68, 0.08)' 
                        : 'rgba(200, 101, 61, 0.05)'}
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box
                        w={24}
                        h={24}
                        bg={isPaymentCompleted(paymentStatus.status) ? '#22c55e' : paymentFailed ? '#ef4444' : '#C8653D'}
                        style={{
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isPaymentCompleted(paymentStatus.status) ? (
                          <IconCheck size={14} color="white" stroke={3} />
                        ) : paymentFailed ? (
                          <IconX size={14} color="white" stroke={3} />
                        ) : (
                          <IconLoader2 
                            size={16} 
                            color="white" 
                            style={{ animation: 'spin 1s linear infinite' }}
                          />
                        )}
                      </Box>
                      <Text 
                        size="md" 
                        fw={700} 
                        c="dark.9"
                        ff="Inter, sans-serif"
                        lts={-0.2}
                        style={{ 
                          flex: 1,
                        }}
                      >
                        {isPaymentCompleted(paymentStatus.status) 
                          ? t('paymentCheck.paymentCompleted') 
                          : paymentFailed 
                          ? t('paymentCheck.paymentFailed') 
                          : t('paymentCheck.paymentRequired')}
                      </Text>
                      {!isPaymentCompleted(paymentStatus.status) && !paymentFailed && loading && (
                        <Text 
                          size="xs" 
                          c="#C8653D" 
                          fw={600}
                          ff="Inter, sans-serif"
                        >
                          {t('paymentCheck.processing')}
                        </Text>
                      )}
                    </Group>

                    {/* Only show amount when payment is completed or there's an amount due, not during processing */}
                    {(!loading && (isPaymentCompleted(paymentStatus.status) || paymentStatus.balance > 0)) && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <Box
                          w={40}
                          h={40}
                          radius="md"
                          bg="rgba(200, 101, 61, 0.05)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text size="lg" fw={700} c="dark.9">
                            {paymentStatus.currency === 'EUR' ? '€' : paymentStatus.currency === 'USD' ? '$' : paymentStatus.currency === 'GBP' ? '£' : paymentStatus.currency?.[0] ?? '€'}
                          </Text>
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            {paymentStatus.balance > 0 ? t('paymentCheck.amountDue') : t('paymentCheck.amountPaid')}
                          </Text>
                          <Group gap={8} align="baseline">
                            <Text size="lg" fw={700} c="dark.9" lh={1}>
                              {paymentStatus.balance > 0 
                                ? Math.abs(paymentStatus.balance).toFixed(2)
                                : (() => {
                                    const paidAmount = reservation.totalAmount ?? 0;
                                    return paidAmount > 0 ? paidAmount.toFixed(2) : '0.00';
                                  })()}
                            </Text>
                            <Text size="sm" fw={500} c="dimmed">
                              {paymentStatus.currency}
                            </Text>
                          </Group>
                          {paymentStatus.balance > 0 && (
                            <Text size="xs" c="#C8653D" fw={600} mt={4}>
                              {t('paymentCheck.paymentRequiredToProceed')}
                            </Text>
                          )}
                          {isPaymentCompleted(paymentStatus.status) && paymentStatus.balance <= 0 && (
                            <Text size="xs" c="green" fw={600} mt={4}>
                              {t('paymentCheck.paymentCompleted')}
                            </Text>
                          )}
                          {paymentStatus.failureReason && (
                            <Text size="xs" c="red" fw={600} mt={4}>
                              {paymentStatus.failureReason}
                            </Text>
                          )}
                        </Box>
                      </Group>
                    )}
                  </Stack>
                </Box>
              )}

                {/* Reservation Summary - Simplified */}
                <Box
                  p={24}
                  bg="rgba(200, 101, 61, 0.02)"
                  radius="md"
                  style={{
                    border: '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Stack gap={20}>
                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                    >
                      <IconShield size={20} color="#C8653D" />
                      <Text 
                        size="md" 
                        fw={600} 
                        c="dark.9"
                        ff="Inter, sans-serif"
                        lts={-0.2}
                        style={{ 
                          flex: 1,
                        }}
                      >
                        {t('paymentCheck.reservationDetails')}
                      </Text>
                    </Group>

                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                    >
                      <IconUser size={20} color="#666666" />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                          {t('paymentCheck.guestName')}
                        </Text>
                        <Text size="md" fw={500} c="dark.9">
                          {(() => {
                            const primaryGuest = checkInData?.primaryGuest ?? reservation?.primaryGuest;
                            if (primaryGuest) {
                              return `${primaryGuest.firstName ?? ''} ${primaryGuest.lastName ?? ''}`.trim();
                            }
                            
                            const reservationFolios = folios ?? checkInData?.folios ?? reservation?.folios;
                            if (Array.isArray(reservationFolios) && reservationFolios.length > 0) {
                              const mainFolio = reservationFolios.find(f => f.isMainFolio) ?? reservationFolios[0];
                              const debitor = mainFolio?.debitor;
                              if (debitor) {
                                return `${debitor.firstName ?? ''} ${debitor.name ?? ''}`.trim();
                              }
                            }
                            
                            const guestName = reservation?.guest_name;
                            if (guestName) {
                              const firstName = guestName.first_name ?? guestName.firstName ?? '';
                              const lastName = guestName.last_name ?? guestName.lastName ?? '';
                              return `${firstName} ${lastName}`.trim();
                            }
                            
                            return reservation?.firstName && reservation?.lastName
                              ? `${reservation.firstName} ${reservation.lastName}`
                              : t('common.notAvailable');
                          })()}
                        </Text>
                      </Box>
                    </Group>

                    {reservation.roomNumber && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <IconBed size={20} color="#666666" />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            {t('paymentCheck.room')}
                          </Text>
                          <Text size="md" fw={500} c="dark.9">
                            {reservation.roomNumber}
                          </Text>
                        </Box>
                      </Group>
                    )}

                    {reservation.roomType && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <IconBed size={20} color="#666666" />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            {t('paymentCheck.roomType')}
                          </Text>
                          <Text size="md" fw={500} c="dark.9">
                            {reservation.roomType}
                          </Text>
                        </Box>
                      </Group>
                    )}
                  </Stack>
                </Box>
            </>
          )}
        </Stack>

        {/* Action Buttons */}
        <Group justify="space-between" mt={32}>
          <BackButton onClick={handleBack} text={t('common.back')} />
          
          {paymentFailed && (
            <Button
              size="md"
              variant="light"
              leftSection={<IconPhone size={18} />}
              onClick={() => {
                // Contact support action
                window.location.href = 'tel:+1234567890';
              }}
              c="#C8653D"
              fw={600}
              radius="md"
              px={24}
              py={10}
            >
              {t('paymentCheck.contactSupport')}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};

export default PaymentCheckPage;
