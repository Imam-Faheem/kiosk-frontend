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
import { usePaymentMutation } from '../../hooks/usePaymentMutation';
import { EARLY_ARRIVAL_CONFIG } from '../../config/constants';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const PaymentTerminalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const initiatePayment = usePaymentMutation('initiate', {
    onSuccess: (result) => {
      if (result.success) {
        setTransactionId(result.data.transactionId);
        setPaymentStatus('processing');
        // Start polling for payment status
        const interval = setInterval(() => {
          pollPaymentStatus.mutate(result.data.transactionId);
        }, 2000);
        setPollInterval(interval);
        
        // Set timeout for payment
        const timeout = setTimeout(() => {
          setPaymentStatus('timeout');
          clearInterval(interval);
        }, 30000);
        setTimeoutId(timeout);
      }
    },
    onError: (err) => {
      console.error('Payment initiation error:', err);
      setPaymentStatus('error');
    }
  });
  
  const pollPaymentStatus = usePaymentMutation('poll', {
    onSuccess: (result) => {
      if (result.success && result.data.status === 'completed') {
        setPaymentStatus('completed');
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
        
        const targetTime = EARLY_ARRIVAL_CONFIG.TARGET_TIME;
        const now = new Date();
        const [time, period] = targetTime.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const target = new Date();
        target.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours, minutes, 0, 0);
        
        if (now < target) {
          navigate('/checkin/early-arrival', {
            state: { reservation, paymentData: result.data }
          });
        } else {
          navigate('/checkin/card-dispensing', {
            state: { reservation, paymentData: result.data }
          });
        }
      }
    },
    onError: (err) => {
      console.error('Payment polling error:', err);
      setPaymentStatus('error');
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    }
  });
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [transactionId, setTransactionId] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [error, setError] = useState(null);

  const reservation = location.state?.reservation;
  const existingPaymentStatus = location.state?.paymentStatus;

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    if (!existingPaymentStatus || !existingPaymentStatus.transactionId) {
      setError(t('error.paymentDataMissing'));
      setPaymentStatus('error');
      return;
    }

    const transactionId = existingPaymentStatus.transactionId;
    setTransactionId(transactionId);
    setPaymentStatus('processing');

    let interval = null;
    let timeout = null;
    let countdownInterval = null;

    const startPaymentPolling = () => {
      interval = setInterval(() => {
        pollPaymentStatus.mutate(transactionId);
      }, 2000);
      setPollInterval(interval);
    };

    startPaymentPolling();

    timeout = setTimeout(() => {
      setPaymentStatus('timeout');
      if (interval) {
        clearInterval(interval);
      }
    }, 180000);

    setTimeoutId(timeout);

    countdownInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (interval) {
        clearInterval(interval);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [reservation, existingPaymentStatus, navigate, pollPaymentStatus, t]);

  const handleCancel = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    navigate('/checkin');
  };

  const handleBack = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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
        <Group justify="space-between" mb="xl">
          <Group>
            <img
              src={UnoLogo}
              alt={t('common.unoHotelLogo')}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                marginRight: '0px',
                objectFit: 'cover',
              }}
            />
            <Title 
              order={2} 
              style={{ 
                fontSize: '30px !important',
                color: 'rgb(34, 34, 34)',
                fontWeight: '600',
                letterSpacing: '1px',
                marginLeft: '-9px',
                textTransform: 'uppercase'
              }}
            >
              {t('mainMenu.title')}
            </Title>
          </Group>
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
                ${reservation.totalAmount || 320.00} {reservation.currency || 'USD'}
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
              onClick={handleCancel}
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
