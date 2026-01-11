import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Stack,
  Box,
  Card,
  Loader,
  Alert,
  Progress,
} from '@mantine/core';
import { IconCreditCard, IconX, IconCheck } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentByTerminal } from '../../hooks/useCheckInFlow';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';

const PaymentTerminalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const countdownIntervalRef = useRef(null);
  const TOTAL_SECONDS = 120;
  const [paymentStatus, setPaymentStatus] = useState('initiating');
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SECONDS);
  const [error, setError] = useState(null);

  const {
    reservation,
    checkInData,
    paymentStatus: existingPaymentStatus,
    folios,
    reservationId: reservationIdFromState,
    payableAmount: payableAmountFromState,
    currency: currencyFromState,
  } = location.state || {};

  const reservationId =
    reservationIdFromState ??
    checkInData?.bookingId ??
    reservation?.id ??
    reservation?.bookingId;

  const payableAmount =
    payableAmountFromState ??
    existingPaymentStatus?.amount ??
    reservation?.payableAmount?.guest?.amount ??
    0;

  const currency =
    currencyFromState ??
    existingPaymentStatus?.currency ??
    reservation?.payableAmount?.guest?.currency ??
    'EUR';

  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Process payment by terminal
  // POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/payments/by-terminal
  const processPayment = usePaymentByTerminal({
    onSuccess: (result) => {
      clearCountdown();
      setPaymentStatus('completed');
      
      // After successful payment, navigate to process check-in
      setTimeout(() => {
        navigate('/checkin/process', {
          state: {
            reservation,
            reservationId,
            checkInData,
            folios,
            paymentData: result,
          },
        });
      }, 1500);
    },
    onError: (err) => {
      console.error('[PaymentTerminalPage] Payment error:', err);
      clearCountdown();
      setPaymentStatus('error');
      setError(err?.message ?? t('error.paymentFailed') ?? 'Payment failed');
    },
  });

  useEffect(() => {
    if (!reservation || !reservationId) {
      navigate('/checkin');
      return;
    }

    setPaymentStatus('processing');
    setTimeRemaining(TOTAL_SECONDS);
    setError(null);

    // Start payment processing
    processPayment.mutate({
      reservationId,
      paymentData: { amount: payableAmount, currency },
    });

    // Countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearCountdown();
          setPaymentStatus(current => (current === 'processing' ? 'timeout' : current));
          setError(t('paymentTerminal.timeout') ?? 'Payment timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearCountdown();
  }, [reservation, reservationId, navigate, processPayment, payableAmount, currency, t]);

  const handleBack = () => {
    clearCountdown();
    navigate('/checkin');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        {/* Header */}
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        {/* Content */}
        <Stack gap="lg" mb="xl">
          {/* Amount Display */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack align="center" gap="sm">
              <Text size="lg" c="#666666">
                {t('paymentTerminal.amount')}
              </Text>
              <Text size="3xl" fw={700} c="#0B152A">
                {currency || 'EUR'} {payableAmount || reservation?.payableAmount?.guest?.amount || 0}
              </Text>
            </Stack>
          </Card>

          {/* Payment Status */}
          {paymentStatus === 'initiating' && (
            <Stack align="center" gap="md">
              <Loader size="lg" color="#C8653D" />
              <Text size="lg" c="#666666">
                {t('paymentTerminal.processing')}
              </Text>
            </Stack>
          )}

          {paymentStatus === 'processing' && (
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#C8653D',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                }}
              >
                <IconCreditCard size={40} color="white" />
              </Box>
              <Text size="xl" fw={600} c="#0B152A" ta="center">
                {t('paymentTerminal.swipeCard')}
              </Text>
              <Text size="md" c="#666666" ta="center">
                {t('paymentTerminal.insertOrSwipeCard')}
              </Text>
              
              {/* Progress bar */}
              <Box style={{ width: '100%' }}>
                <Progress
                  value={((TOTAL_SECONDS - timeRemaining) / TOTAL_SECONDS) * 100}
                  color="#C8653D"
                  size="lg"
                  radius="md"
                />
                <Text size="sm" c="#666666" ta="center" mt="xs">
                  {t('paymentTerminal.timeRemaining')}: {formatTime(timeRemaining)}
                </Text>
              </Box>
            </Stack>
          )}

          {paymentStatus === 'completed' && (
            <Alert
              icon={<IconCheck size={20} />}
              title={t('paymentTerminal.paymentSuccessful')}
              color="green"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {t('paymentTerminal.paymentCompletedMessage')}
              </Text>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert
              icon={<IconX size={20} />}
              title={t('paymentTerminal.paymentFailed')}
              color="red"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {t('error.paymentFailed')}
              </Text>
            </Alert>
          )}

          {paymentStatus === 'timeout' && (
            <Alert
              icon={<IconX size={20} />}
              title={t('paymentTerminal.paymentTimeout')}
              color="orange"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {t('paymentTerminal.timeout')}
              </Text>
            </Alert>
          )}

          {paymentStatus === 'error' && error && (
            <Alert
              icon={<IconX size={20} />}
              title={t('paymentTerminal.paymentError')}
              color="red"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {error}
              </Text>
            </Alert>
          )}
        </Stack>

        {/* Action Buttons */}
        <Group justify="space-between">
          <BackButton onClick={handleBack} text={t('common.back')} />

          {(paymentStatus === 'failed' || paymentStatus === 'timeout') && (
            <Button
              size="lg"
              leftSection={<IconX size={16} />}
              onClick={handleBack}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B8552F';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {t('paymentTerminal.cancel')}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};

export default PaymentTerminalPage;
