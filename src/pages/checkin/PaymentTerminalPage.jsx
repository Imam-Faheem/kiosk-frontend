import React, { useState, useEffect } from 'react';
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
  Loader,
  Alert,
  Progress,
} from '@mantine/core';
import { IconCreditCard, IconX, IconCheck } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentByTerminal } from '../../hooks/useCheckInFlow';
import { EARLY_ARRIVAL_CONFIG } from '../../config/constants';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';

const PaymentTerminalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [error, setError] = useState(null);

  const { reservation, reservationId, payableAmount, currency } = location.state || {};

  // Process payment by terminal
  // POST /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/payments/by-terminal
  const processPayment = usePaymentByTerminal({
    onSuccess: (result) => {
      setPaymentStatus('completed');
      
      // After successful payment, navigate to process check-in
      setTimeout(() => {
        navigate('/checkin/process', {
          state: {
            reservation,
            reservationId,
            paymentData: result,
          },
        });
      }, 1500);
    },
    onError: (err) => {
      console.error('[PaymentTerminalPage] Payment error:', err);
      setPaymentStatus('error');
      setError(err?.message ?? t('error.paymentFailed') ?? 'Payment failed');
    },
  });

  useEffect(() => {
    if (!reservation || !reservationId) {
      navigate('/checkin');
      return;
    }

    // Start payment processing
    processPayment.mutate({
      reservationId,
      paymentData: {},
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timeout after 3 minutes
    const timeout = setTimeout(() => {
      if (paymentStatus === 'processing') {
        setPaymentStatus('timeout');
        setError(t('paymentTerminal.timeout') ?? 'Payment timeout');
      }
    }, 180000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(timeout);
    };
  }, [reservation, reservationId, navigate]);

  const handleBack = () => {
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
                  value={(180 - timeRemaining) / 180 * 100}
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
