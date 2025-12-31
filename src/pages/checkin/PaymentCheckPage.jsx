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
  Badge,
  Loader,
  Alert,
} from '@mantine/core';
import { IconCreditCard, IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentMutation } from '../../hooks/usePaymentMutation';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';

const PaymentCheckPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const checkPaymentStatus = usePaymentMutation('checkStatus', {
    onSuccess: (result) => {
      if (result.success) {
        setPaymentStatus(result.data);
        
        // Navigate based on payment status
        if (result.data.status === 'completed' || result.data.status === 'paid') {
          // Already paid, go to card dispensing
          setTimeout(() => {
            navigate('/checkin/card-dispensing', {
              state: { reservation, paymentStatus: result.data }
            });
          }, 2000);
        } else {
          // Not paid, go to payment terminal
          setTimeout(() => {
            navigate('/checkin/payment', {
              state: { reservation, paymentStatus: result.data }
            });
          }, 2000);
        }
      } else {
        setError(t('error.paymentFailed'));
      }
    },
    onError: (err) => {
      console.error('Payment status check error:', err);
      setError(err.message || t('error.paymentFailed'));
    }
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reservation = location.state?.reservation;

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        
        // Payment status is already in reservation data from Apaleo
        // Check balance to determine payment status
        const paymentStatusData = {
          status: reservation.paymentStatus || (reservation.balance <= 0 ? 'paid' : 'pending'),
          amount: reservation.totalAmount || Math.abs(reservation.balance || 0),
          currency: reservation.currency || 'EUR',
          balance: reservation.balance || 0,
          transactionId: reservation.id || `TXN-${Date.now()}`
        };
        
        setPaymentStatus(paymentStatusData);
        
        // Small delay for UI
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate based on payment status
        if (paymentStatusData.status === 'paid' || paymentStatusData.balance <= 0) {
          // Already paid, go to card dispensing (which will trigger Apaleo check-in)
          setTimeout(() => {
            navigate('/checkin/card-dispensing', {
              state: { reservation, paymentStatus: paymentStatusData }
            });
          }, 500);
        } else {
          // Not paid, go to payment terminal
          setTimeout(() => {
            navigate('/checkin/payment', {
              state: { reservation, paymentStatus: paymentStatusData }
            });
          }, 500);
        }
      } catch (err) {
        console.error('Payment status check error:', err);
        setError(err.message || t('error.paymentFailed'));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [reservation, navigate, t]);

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
          {loading ? (
            <Stack align="center" gap="md">
              <Loader size="lg" color="#C8653D" />
              <Text size="lg" c="#666666">
                {t('paymentCheck.loading')}
              </Text>
            </Stack>
          ) : error ? (
            <Alert
              icon={<IconX size={16} />}
              title="Error"
              color="red"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              {error}
            </Alert>
          ) : (
            <>
              {/* Reservation Summary */}
              <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
                <Stack gap="sm">
                  <Text size="lg" fw={600} c="#0B152A">
                    {t('paymentCheck.reservationSummary')}
                  </Text>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('paymentCheck.guestName')}:</Text>
                    <Text size="md" fw={500}>{reservation.firstName} {reservation.lastName}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('paymentCheck.roomType')}:</Text>
                    <Text size="md" fw={500}>{reservation.roomType}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">Room Number:</Text>
                    <Text size="md" fw={500}>{reservation.roomNumber}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('paymentCheck.checkIn')}:</Text>
                    <Text size="md" fw={500}>{new Date(reservation.checkIn).toLocaleDateString()}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('paymentCheck.checkOut')}:</Text>
                    <Text size="md" fw={500}>{new Date(reservation.checkOut).toLocaleDateString()}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">Total Amount:</Text>
                    <Text size="md" fw={500}>${reservation.totalAmount} {reservation.currency}</Text>
                  </Group>
                </Stack>
              </Card>

              {/* Payment Status */}
              {paymentStatus && (
                <Card withBorder p="lg" radius="md">
                  <Group justify="space-between" align="center">
                    <Group>
                      <IconCreditCard size={24} color="#C8653D" />
                      <Text size="lg" fw={600}>
                        {t('paymentCheck.paymentStatus')}
                      </Text>
                    </Group>
                    <Badge
                      size="lg"
                      color={paymentStatus.status === 'completed' || paymentStatus.status === 'paid' ? 'green' : 'orange'}
                      leftSection={
                        paymentStatus.status === 'completed' || paymentStatus.status === 'paid' ? 
                        <IconCheck size={12} /> : 
                        <IconX size={12} />
                      }
                    >
                      {paymentStatus.status === 'completed' || paymentStatus.status === 'paid' ? 
                        t('paymentCheck.paid') : 
                        t('paymentCheck.pending')
                      }
                    </Badge>
                  </Group>
                  
                  {paymentStatus.amount && (
                    <Text size="xl" fw={700} c="#0B152A" mt="sm">
                      ${paymentStatus.amount} {paymentStatus.currency}
                    </Text>
                  )}
                </Card>
              )}
            </>
          )}
        </Stack>

        {/* Back Button */}
        <Group justify="flex-start">
          <BackButton onClick={handleBack} text={t('common.back')} />
        </Group>
      </Paper>
    </Container>
  );
};

export default PaymentCheckPage;
