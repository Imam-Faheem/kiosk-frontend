import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { useBookingMutation } from '../../hooks/useBookingMutation';
import { buildBookingPayload, getBookingErrorMessage } from '../../utils/booking.utils';
import usePropertyStore from '../../stores/propertyStore';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [hasProcessed, setHasProcessed] = useState(false);
  const bookingMutation = useBookingMutation();
  const hasInitialized = useRef(false);

  const { room, searchCriteria, guestDetails } = location.state ?? {};

  const totalAmount = useMemo(() => {
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut || !room) {
      return { amount: 0, currency: 'EUR' };
    }

    const offerData = room?._offerData ?? room;
    const totalGrossAmount = offerData?.totalGrossAmount?.amount 
      ?? room?.totalGrossAmount?.amount 
      ?? room?.totalPrice 
      ?? 0;
    const currency = offerData?.totalGrossAmount?.currency 
      ?? room?.totalGrossAmount?.currency 
      ?? room?.currency 
      ?? 'EUR';
    
    return {
      amount: Math.round(totalGrossAmount * 100) / 100,
      currency,
    };
  }, [searchCriteria, room]);

  const roomIds = useMemo(() => {
    if (!room) return { unitGroupId: null, ratePlanId: null };
    
    return {
      unitGroupId: room.unitGroupId,
      ratePlanId: room.ratePlanId,
    };
  }, [room]);

  const formatDateForAPI = useCallback((dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  }, []);

  const navigateToCompletion = useCallback((reservation) => {
    navigate('/reservation/complete', {
      state: { reservation, room, guestDetails },
    });
  }, [navigate, room, guestDetails]);

  const processPayment = useCallback(() => {
    if (hasProcessed) return;
    
    setHasProcessed(true);
    
    const propertyId = usePropertyStore.getState().propertyId;
    if (!propertyId) {
      setHasProcessed(false);
      return;
    }

    const { unitGroupId, ratePlanId } = roomIds;
    
    if (!unitGroupId || !ratePlanId) {
      setHasProcessed(false);
      return;
    }

    const bookingPayload = buildBookingPayload(searchCriteria, guestDetails, ratePlanId, formatDateForAPI);

    bookingMutation.mutate(
      { bookingPayload, propertyId },
      {
        onSuccess: (bookingResult) => {
          const reservationId = bookingResult?.data?.reservations?.[0]?.id;

          const reservation = {
            reservationId,
            guestDetails,
            roomTypeId: room.unitGroupId || room.unitGroup?.id,
            checkIn: searchCriteria.checkIn,
            checkOut: searchCriteria.checkOut,
            guests: searchCriteria.guests,
            totalAmount: totalAmount.amount,
            currency: totalAmount.currency,
            status: 'confirmed',
            bookingData: bookingResult,
          };

          setTimeout(() => navigateToCompletion(reservation), 1500);
        },
        onError: (err) => {
          setHasProcessed(false);
        },
      }
    );
  }, [hasProcessed, roomIds, formatDateForAPI, navigateToCompletion, totalAmount, guestDetails, searchCriteria, room, bookingMutation]);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    if (!room || !guestDetails) {
      navigate('/reservation/search');
      return;
    }

    if (!roomIds.unitGroupId || !roomIds.ratePlanId) {
      setTimeout(() => {
        navigate('/reservation/search', { replace: true });
      }, 3000);
      return;
    }
    
    hasInitialized.current = true;
    processPayment();
  }, [room, guestDetails, roomIds.unitGroupId, roomIds.ratePlanId, navigate, processPayment]);

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
              <Text size="md" c="#666666">{t('newResPayment.checkIn')}:</Text>
              <Text size="md" fw={600}>{searchCriteria?.checkIn ? new Date(searchCriteria.checkIn).toLocaleDateString() : ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.checkOut')}:</Text>
              <Text size="md" fw={600}>{searchCriteria?.checkOut ? new Date(searchCriteria.checkOut).toLocaleDateString() : ''}</Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', marginBottom: '20px' }}>
          <Stack gap="sm" align="center">
            <Text size="md" fw={500}>{t('newResPayment.totalAmount')}</Text>
            <Text size="3xl" fw={700} style={{ fontSize: '48px' }}>
              {totalAmount.currency} {totalAmount.amount > 0 ? totalAmount.amount.toFixed(2) : '0.00'}
            </Text>
          </Stack>
        </Card>

        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          {bookingMutation.isPending && <Loader size="lg" color="#C8653D" />}
          <Text size="xl" fw={600} ta="center">
            {!bookingMutation.isPending && !bookingMutation.isSuccess && !bookingMutation.isError && t('newResPayment.readyToProcessPayment')}
            {bookingMutation.isPending && t('newResPayment.swipeCard')}
            {bookingMutation.isSuccess && t('newResPayment.bookingSuccessful')}
            {bookingMutation.isError && t('newResPayment.bookingFailed')}
          </Text>
          {bookingMutation.isPending && (
            <Text size="md" c="#666666" ta="center">
              {t('newResPayment.processing')}
            </Text>
          )}
          {bookingMutation.isSuccess && (
            <Text size="md" c="green" ta="center" fw={600}>
              {t('newResPayment.redirectingToConfirmation')}
            </Text>
          )}
          {bookingMutation.isError && (
            <Alert color="red" variant="light" style={{ width: '100%' }}>
              <Text size="md" c="red" ta="center">
                {getBookingErrorMessage(bookingMutation.error)}
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
          
          {bookingMutation.isError && (
            <Button
              variant="outline"
              onClick={() => {
                setHasProcessed(false);
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
            disabled={bookingMutation.isPending}
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
