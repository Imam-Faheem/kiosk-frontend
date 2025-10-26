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
  Card,
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

        {/* Booking Summary Display */}
        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
          <Stack gap="md">
            <Text size="lg" fw={600} c="#C8653D">{t('newResPayment.bookingSummary')}</Text>
            <Group justify="space-between">
              <Text size="md" c="#666666">Room:</Text>
              <Text size="md" fw={600}>{room.name}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">Guest:</Text>
              <Text size="md" fw={600}>{guestDetails.firstName} {guestDetails.lastName}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">Check-in:</Text>
              <Text size="md" fw={600}>{new Date(searchCriteria.checkIn).toLocaleDateString()}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">Check-out:</Text>
              <Text size="md" fw={600}>{new Date(searchCriteria.checkOut).toLocaleDateString()}</Text>
            </Group>
          </Stack>
        </Card>

        {/* Total Amount Display */}
        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', marginBottom: '20px' }}>
          <Stack gap="sm" align="center">
            <Text size="md" fw={500}>Total Amount</Text>
            <Text size="3xl" fw={700} style={{ fontSize: '48px' }}>
              ${room.totalPrice} {room.currency}
            </Text>
          </Stack>
        </Card>

        {/* Payment Terminal Status */}
        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          {paymentStatus === 'processing' && <Loader size="lg" color="#C8653D" />}
          <Text size="xl" fw={600} ta="center">
            {paymentStatus === 'processing' && t('newResPayment.swipeCard')}
            {paymentStatus === 'success' && 'Payment Successful!'}
            {paymentStatus === 'failed' && 'Payment Failed'}
          </Text>
          {paymentStatus === 'processing' && (
            <Text size="md" c="#666666" ta="center">
              {t('newResPayment.processing')}
            </Text>
          )}
          {error && (
            <Text size="md" c="red" ta="center">
              {error}
            </Text>
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
          
          <Button
            variant="outline"
            onClick={() => navigate('/reservation/search')}
            style={{
              borderColor: '#dc3545',
              color: '#dc3545',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc3545';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#dc3545';
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
