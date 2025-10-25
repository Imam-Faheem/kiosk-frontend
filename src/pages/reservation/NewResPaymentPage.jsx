import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Loader,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  const { room, searchCriteria, guestDetails } = location.state || {};

  useEffect(() => {
    if (!room || !guestDetails) {
      navigate('/reservation/search');
      return;
    }

    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    const processPayment = async () => {
      try {
        hasProcessed.current = true;
        setPaymentStatus('processing');
        
        // Immediate success
        setPaymentStatus('success');
        
        // Mock reservation data
        const mockReservation = {
          reservationId: `RES-${Date.now()}`,
          guestDetails,
          roomTypeId: room.roomTypeId,
          checkIn: searchCriteria.checkIn,
          checkOut: searchCriteria.checkOut,
          guests: searchCriteria.guests,
          totalAmount: room.totalPrice,
          currency: room.currency,
          status: 'confirmed'
        };

        // Navigate to card page after success
        navigate('/reservation/card', {
          state: {
            reservation: mockReservation,
            room,
            paymentData: {
              paymentId: `PAY-${Date.now()}`,
              amount: room.totalPrice,
              currency: room.currency,
              status: 'initiated'
            }
          },
        });
        
      } catch (err) {
        console.error('Payment error:', err);
        setPaymentStatus('failed');
        setError(err.message || t('error.paymentFailed'));
      }
    };

    processPayment();
  }, [room, guestDetails, searchCriteria, navigate, t]);

  const handleBack = () => {
    navigate('/reservation/room-details', {
      state: { room, searchCriteria, guestDetails },
    });
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
              {t('newResPayment.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          {paymentStatus === 'processing' && <Loader size="lg" color="#C8653D" />}
          <Text size="lg">
            {paymentStatus === 'processing' && t('newResPayment.processing')}
            {paymentStatus === 'success' && t('newResPayment.success')}
            {paymentStatus === 'failed' && t('newResPayment.failed')}
            {error && error}
          </Text>
        </Stack>

        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
          style={{
            borderColor: '#C8653D',
            color: '#C8653D',
            borderRadius: '12px',
          }}
        >
          {t('common.back')}
        </Button>
      </Paper>
    </Container>
  );
};

export default NewResPaymentPage;
