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
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { createBooking } from '../../services/bookingService';
import { updateApaleoReservationWithGuest } from '../../services/guestService';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const hasProcessed = useRef(false);

  const { room, searchCriteria, guestDetails, savedGuest, signature } = location.state || {};

  const processPayment = async () => {
      try {
        hasProcessed.current = true;
        setPaymentStatus('processing');
        
        const propertyId = process.env.REACT_APP_PROPERTY_ID || 'BER';
        const hotelId = propertyId; // Use propertyId as hotelId for the endpoint
        
        // Prepare booking data for Apaleo
        const bookingPayload = {
          propertyId,
          unitGroupId: room.unitGroupId || room.roomTypeId || room._offerData?.unitGroupId,
          ratePlanId: room.ratePlanId || room._offerData?.ratePlanId,
          arrival: searchCriteria.checkIn,
          departure: searchCriteria.checkOut,
          adults: Number(searchCriteria.guests) || 1,
          primaryGuest: {
            firstName: guestDetails.firstName,
            lastName: guestDetails.lastName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            address: {
              addressLine1: guestDetails.addressStreet,
              city: guestDetails.addressCity,
              postalCode: guestDetails.addressPostal,
              countryCode: guestDetails.country,
              ...(guestDetails.addressState ? { region: guestDetails.addressState } : {}),
            },
          },
        };

        if (!bookingPayload.unitGroupId || !bookingPayload.ratePlanId) {
          throw new Error('Missing room information. Please select a room again.');
        }

        // Create booking in Apaleo
        const bookingResult = await createBooking(bookingPayload, hotelId);
        
        // Extract reservation ID from booking response
        const reservationId = bookingResult?.id || bookingResult?.reservationId || bookingResult?.reservation?.id;
        
        if (!reservationId) {
          throw new Error('Booking created but no reservation ID returned');
        }

        // Update Apaleo reservation with additional guest info (if needed)
        try {
          await updateApaleoReservationWithGuest(reservationId, guestDetails, propertyId);
        } catch (updateErr) {
          console.warn('Failed to update reservation with guest info:', updateErr);
          // Continue even if update fails
        }

        setPaymentStatus('success');
        
        // Prepare reservation data
        const reservation = {
          reservationId,
          id: reservationId,
          guestDetails,
          roomTypeId: room.roomTypeId,
          checkIn: searchCriteria.checkIn,
          checkOut: searchCriteria.checkOut,
          guests: searchCriteria.guests,
          totalAmount: room.totalPrice,
          currency: room.currency,
          status: 'confirmed',
          bookingData: bookingResult,
        };

        setBookingData(reservation);

        // Navigate to completion page after a short delay to show success
        setTimeout(() => {
          navigate('/reservation/complete', {
            state: {
              reservation,
              room,
              guestDetails,
            },
          });
        }, 1500);
        
      } catch (err) {
        console.error('Payment/Booking error:', err);
        setPaymentStatus('failed');
        const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to create booking';
        setError(errorMessage);
        hasProcessed.current = false; // Allow retry
      }
  };

  useEffect(() => {
    if (!room || !guestDetails) {
      navigate('/reservation/search');
      return;
    }

    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    // Only auto-process if we have all required data
    if (room && guestDetails && searchCriteria && !hasProcessed.current) {
      processPayment();
    }
  }, [room, guestDetails, searchCriteria, navigate]);

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
            {paymentStatus === 'idle' && 'Ready to process payment'}
            {paymentStatus === 'processing' && (t('newResPayment.swipeCard') || 'Processing booking...')}
            {paymentStatus === 'success' && 'Booking Successful!'}
            {paymentStatus === 'failed' && 'Booking Failed'}
          </Text>
          {paymentStatus === 'processing' && (
            <Text size="md" c="#666666" ta="center">
              {t('newResPayment.processing') || 'Creating your reservation...'}
            </Text>
          )}
          {paymentStatus === 'success' && (
            <Text size="md" c="green" ta="center" fw={600}>
              Redirecting to confirmation...
            </Text>
          )}
          {error && (
            <Alert color="red" variant="light" style={{ width: '100%' }}>
              <Text size="md" c="red" ta="center">
                {error}
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
          
          {paymentStatus === 'failed' && (
            <Button
              variant="outline"
              onClick={() => {
                hasProcessed.current = false;
                setPaymentStatus('idle');
                setError(null);
                processPayment();
              }}
              style={{
                borderColor: '#C8653D',
                color: '#C8653D',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              Retry Booking
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/reservation/search')}
            disabled={paymentStatus === 'processing'}
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
            {t('newResPayment.cancelBooking') || 'Cancel'}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default NewResPaymentPage;
