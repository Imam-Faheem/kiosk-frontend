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
  Loader,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReservationMutation } from '../../hooks/useReservationMutation';
import { usePaymentMutation } from '../../hooks/usePaymentMutation';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState('idle');

  const { room, searchCriteria, guestDetails } = location.state || {};

  const createReservation = useReservationMutation('create');
  const initiatePayment = usePaymentMutation('initiate');

  useEffect(() => {
    if (!room || !guestDetails) {
      navigate('/reservation/search');
      return;
    }

    const processPayment = async () => {
      try {
        setPaymentStatus('processing');
        
        // Create reservation first
        const resResult = await createReservation.mutateAsync({
          ...guestDetails,
          roomTypeId: room.roomTypeId,
          checkIn: searchCriteria.checkIn,
          checkOut: searchCriteria.checkOut,
          guests: searchCriteria.guests,
        });

        if (resResult.success) {
          // Initiate payment
          const payResult = await initiatePayment.mutateAsync({
            reservationId: resResult.data.reservationId,
            amount: room.totalPrice,
            currency: room.currency,
          });

          if (payResult.success) {
            setTimeout(() => {
              navigate('/reservation/card', {
                state: {
                  reservation: resResult.data,
                  room,
                },
              });
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Payment error:', err);
        setPaymentStatus('failed');
      }
    };

    processPayment();
  }, [room, guestDetails, searchCriteria, navigate, createReservation, initiatePayment]);

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
                marginRight: '15px',
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
          <Loader size="lg" color="#C8653D" />
          <Text size="lg">{t('newResPayment.processing')}</Text>
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
