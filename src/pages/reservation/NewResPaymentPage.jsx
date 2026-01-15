import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Card,
  Alert,
  Loader,
  Progress,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard, IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentByTerminal, useCheckIn } from '../../hooks/useCheckInFlow';
import { EARLY_ARRIVAL_CONFIG } from '../../config/constants';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const countdownIntervalRef = useRef(null);
  const hasStartedPaymentRef = useRef(false); // Track if payment already started
  const TOTAL_SECONDS = 120;

  const {
    reservationId,
    amount,
    currency: currencyFromState,
    reservation,
    reservationDetails,
    room,
    guestDetails,
  } = location.state ?? {};

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | completed | timeout | error
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS);
  const [error, setError] = useState(null);
  const [checkInError, setCheckInError] = useState(null);

  const payableAmount = useMemo(() => {
    const numeric = Number(amount ?? 0);
    if (Number.isNaN(numeric)) return 0;
    return Math.max(0, Math.round(numeric * 100) / 100);
  }, [amount]);

  const currency = useMemo(() => {
    return currencyFromState ?? reservationDetails?.balance?.currency ?? reservation?.currency ?? 'EUR';
  }, [currencyFromState, reservationDetails, reservation]);

  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const paymentMutation = usePaymentByTerminal({
    onSuccess: () => {
      clearCountdown();
      setPaymentStatus('completed');
    
      // After successful payment, process check-in
      checkInMutation.mutate({ reservationId, checkInData: {} });
    },
    onError: (err) => {
      clearCountdown();
      setPaymentStatus('error');
      setError(err?.message ?? t('error.paymentFailed') ?? 'Payment failed');
    },
  });

  const checkInMutation = useCheckIn({
    onSuccess: () => {
      const targetHour = typeof EARLY_ARRIVAL_CONFIG.CHECKIN_TIME === 'number'
        ? EARLY_ARRIVAL_CONFIG.CHECKIN_TIME
        : parseInt(EARLY_ARRIVAL_CONFIG.CHECKIN_TIME.split(':')[0], 10);
      const now = new Date();
      const isBeforeTargetTime = now.getHours() < targetHour;

      if (isBeforeTargetTime) {
        navigate('/reservation/early-arrival', {
          state: {
            reservationId,
            reservation: reservationDetails ?? reservation,
            room,
            guestDetails,
            payment: { status: 'paid', amount: payableAmount, currency },
          },
          replace: true,
        });
      return;
    }

      navigate('/reservation/complete', {
              state: {
          reservation: {
            ...(reservation ?? {}),
            reservationId,
          },
                  room,
                  guestDetails,
                },
        replace: true,
            });
        },
        onError: (err) => {
      setCheckInError(err?.message ?? 'Failed to process check-in');
        },
  });

  useEffect(() => {
    if (!reservationId) {
      navigate('/reservation/search', { replace: true });
      return;
    }

    // Prevent re-triggering payment on re-renders (fixes infinite loop)
    if (hasStartedPaymentRef.current) {
      return;
    }
    hasStartedPaymentRef.current = true;
    
    // Auto-start payment (this is the "payment component" after user clicks proceed)
    setPaymentStatus('processing');
    setTimeRemaining(TOTAL_SECONDS);
    setError(null);
    setCheckInError(null);

    paymentMutation.mutate({
      reservationId,
      paymentData: { amount: payableAmount, currency },
    });

    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearCountdown();
          setPaymentStatus(current => (current === 'processing' ? 'timeout' : current));
          setError('Payment timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId]);

  const handleBack = () => {
    clearCountdown();
    navigate('/reservation/complete', {
      state: {
        reservation: { ...(reservation ?? {}), reservationId },
        room,
        guestDetails,
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container
      size="lg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Group>
            <Box
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#C8653D',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '0px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('newResPayment.title')}
            </Title>
          </Group>
        </Group>

        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
          <Stack gap="md">
            <Text size="lg" fw={600} c="#C8653D">{t('newResPayment.bookingSummary')}</Text>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.room')}:</Text>
              <Text size="md" fw={600}>{room?.name ?? ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.guest')}:</Text>
              <Text size="md" fw={600}>{guestDetails?.firstName ?? ''} {guestDetails?.lastName ?? ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('reservationComplete.reservationNumber') ?? 'Reservation'}:</Text>
              <Text size="md" fw={700} c="#C8653D">{reservationId}</Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', marginBottom: '20px' }}>
          <Stack gap="sm" align="center">
            <Text size="md" fw={500}>{t('newResPayment.totalAmount')}</Text>
            <Text size="3xl" fw={700} style={{ fontSize: '48px' }}>
              {currency} {payableAmount > 0 ? payableAmount.toFixed(2) : '0.00'}
            </Text>
          </Stack>
        </Card>

        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          {(paymentStatus === 'processing' || checkInMutation.isPending) && <Loader size="lg" color="#C8653D" />}
          <Text size="xl" fw={600} ta="center">
            {paymentStatus === 'processing' && (t('paymentTerminal.swipeCard') ?? 'Please insert or swipe your card')}
            {paymentStatus === 'completed' && (t('paymentTerminal.paymentSuccessful') ?? 'Payment successful')}
            {paymentStatus === 'timeout' && (t('paymentTerminal.paymentTimeout') ?? 'Payment timeout')}
            {paymentStatus === 'error' && (t('paymentTerminal.paymentError') ?? 'Payment error')}
            {checkInMutation.isPending && (t('checkIn.processingCheckIn') ?? 'Processing check-in...')}
          </Text>
          {paymentStatus === 'processing' && (
            <Text size="md" c="#666666" ta="center">
              {t('paymentTerminal.timeRemaining') ?? 'Time remaining'}: {formatTime(timeRemaining)}
            </Text>
          )}
          {paymentStatus === 'processing' && (
            <Box style={{ width: '100%' }}>
              <Progress
                value={((TOTAL_SECONDS - timeRemaining) / TOTAL_SECONDS) * 100}
                color="#C8653D"
                size="lg"
                radius="md"
              />
            </Box>
          )}

          {paymentStatus === 'completed' && checkInError && (
            <Alert color="red" variant="light" style={{ width: '100%' }}>
              <Text size="md" c="red" ta="center">
                {checkInError}
              </Text>
            </Alert>
          )}

          {(paymentStatus === 'error' || paymentStatus === 'timeout') && error && (
            <Alert
              color={paymentStatus === 'timeout' ? 'orange' : 'red'}
              variant="light"
              style={{ width: '100%' }}
              icon={paymentStatus === 'timeout' ? <IconX size={18} /> : <IconX size={18} />}
              title={t('error.title') ?? 'Payment issue'}
            >
              <Text size="md" ta="center">
                {error}
              </Text>
              <Text size="sm" c="dimmed" ta="center" mt={6}>
                {t('paymentCheck.pleaseTryAgainOrContact') ?? 'Please try again. If it keeps failing, ask reception for help.'}
              </Text>
            </Alert>
          )}
        </Stack>

        <Group justify="space-between">
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            style={{
              borderColor: '#C8653D',
              color: '#C8653D',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C8653D';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#C8653D';
            }}
          >
            {t('common.back')}
          </Button>
          
          {(paymentStatus === 'error' || paymentStatus === 'timeout') && (
            <Button
              variant="outline"
              onClick={() => {
                // retry payment
                clearCountdown();
                setPaymentStatus('processing');
                setTimeRemaining(TOTAL_SECONDS);
                setError(null);
                setCheckInError(null);
                paymentMutation.mutate({
                  reservationId,
                  paymentData: { amount: payableAmount, currency },
                });
                countdownIntervalRef.current = setInterval(() => {
                  setTimeRemaining(prev => {
                    if (prev <= 1) {
                      clearCountdown();
                      setPaymentStatus(current => (current === 'processing' ? 'timeout' : current));
                      setError('Payment timeout');
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
              }}
              style={{
                borderColor: '#C8653D',
                color: '#C8653D',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
              leftSection={<IconCheck size={16} />}
            >
              {t('common.retry') ?? 'Retry'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/reservation/search')}
            disabled={paymentStatus === 'processing' || checkInMutation.isPending}
            style={{
              borderColor: '#dc3545',
              color: '#dc3545',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#dc3545';
              }
            }}
          >
            {t('newResPayment.cancelBooking')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default NewResPaymentPage;
