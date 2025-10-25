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
import { IconArrowLeft, IconCreditCard, IconX, IconCheck } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentMutation } from '../../hooks/usePaymentMutation';

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
        navigate('/checkin/card-dispensing', {
          state: { reservation, paymentData: result.data }
        });
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

  const reservation = location.state?.reservation;
  const existingPaymentStatus = location.state?.paymentStatus;

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    const startPayment = async () => {
      try {
        setPaymentStatus('initiating');
        
        const result = await initiatePayment.mutateAsync({
          reservationId: reservation.reservationId,
          amount: reservation.totalAmount || 320.00,
          currency: reservation.currency || 'USD'
        });

        if (result.success) {
          setTransactionId(result.data.transactionId);
          setPaymentStatus('processing');
          
          // Start polling for payment status
          const interval = setInterval(async () => {
            try {
              const statusResult = await pollPaymentStatus.mutateAsync(result.data.transactionId);
              
              if (statusResult.success && statusResult.data.status === 'completed') {
                setPaymentStatus('completed');
                clearInterval(interval);
                setPollInterval(null);
                
                // Navigate to card dispensing after success
                setTimeout(() => {
                  navigate('/checkin/card-dispensing', {
                    state: { 
                      reservation, 
                      paymentStatus: statusResult.data,
                      transactionId: result.data.transactionId
                    }
                  });
                }, 2000);
              }
            } catch (err) {
              console.error('Payment polling error:', err);
            }
          }, 2000); // Poll every 2 seconds
          
          setPollInterval(interval);
        } else {
          setPaymentStatus('failed');
        }
      } catch (err) {
        console.error('Payment initiation error:', err);
        setPaymentStatus('failed');
      }
    };

    startPayment();

    // 3-minute timeout
    const timeout = setTimeout(() => {
      if (paymentStatus === 'processing') {
        setPaymentStatus('timeout');
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
      }
    }, 180000); // 3 minutes

    setTimeoutId(timeout);

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

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      clearInterval(countdownInterval);
    };
  }, [reservation, navigate, initiatePayment, pollPaymentStatus, paymentStatus, pollInterval]);

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
              {t('paymentTerminal.title')}
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
                Please insert or swipe your card at the terminal
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
                  Time remaining: {formatTime(timeRemaining)}
                </Text>
              </Box>
            </Stack>
          )}

          {paymentStatus === 'completed' && (
            <Alert
              icon={<IconCheck size={20} />}
              title="Payment Successful"
              color="green"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                Payment completed successfully! Preparing your card...
              </Text>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert
              icon={<IconX size={20} />}
              title="Payment Failed"
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
              title="Payment Timeout"
              color="orange"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {t('paymentTerminal.timeout')}
              </Text>
            </Alert>
          )}
        </Stack>

        {/* Action Buttons */}
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
