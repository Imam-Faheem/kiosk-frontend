import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  Divider,
  Alert,
  Loader,
} from '@mantine/core';
import { IconHome, IconCalendar, IconUser, IconCreditCard, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useLanguage from '../../hooks/useLanguage';
import '../../styles/animations.css';
import { BUTTON_STYLES, CONTAINER_STYLES, PAPER_STYLES } from '../../config/constants';
import PropertyHeader from '../../components/PropertyHeader';
import { getReservationDetails } from '../../services/checkinService';

const ReservationCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);

  const { reservation, room, guestDetails } = location.state || {};

  useEffect(() => {
    if (!reservation) {
      navigate('/reservation/search');
      return;
    }
  }, [reservation, navigate]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const reservationNumber = useMemo(() => {
    if (!reservation) return t('common.notAvailable');
    
    // Check direct property set in BookingDetailsPage
    if (reservation.reservationId) return String(reservation.reservationId);
    if (reservation.id) return String(reservation.id);
    
    // Check bookingData structure: { success: true, data: { booking: { reservationIds: [{ id }] } } }
    const bookingResId = reservation.bookingData?.data?.booking?.reservationIds?.[0]?.id;
    if (bookingResId) return String(bookingResId);

    // Fallback: { success: true, data: { reservations: [...] } }
    const reservationId = reservation.bookingData?.data?.reservations?.[0]?.id;
    if (reservationId) return String(reservationId);

    // Other fallbacks
    if (reservation.bookingId) return String(reservation.bookingId);
    
    return t('common.notAvailable');
  }, [reservation, t]);

  const reservationIdForQuery = useMemo(() => {
    if (!reservation) return null;
    return reservation.reservationId
      ?? reservation.id
      ?? reservation.bookingData?.data?.booking?.reservationIds?.[0]?.id  // Primary path
      ?? reservation.bookingData?.data?.reservations?.[0]?.id              // Fallback
      ?? reservation.bookingId
      ?? null;
  }, [reservation]);

  const { data: reservationDetailsResult, isLoading: isLoadingReservationDetails, error: reservationDetailsError } = useQuery({
    queryKey: ['reservationDetails', reservationIdForQuery],
    queryFn: async () => {
      const res = await getReservationDetails(reservationIdForQuery);
      // checkinService returns { success: true, data: apiData }
      return res?.data ?? res;
    },
    enabled: !!reservationIdForQuery,
    retry: false,
  });

  // Extract payable amount - prefer payableAmount.guest (positive) over balance (can be negative)
  const payableAmountData = useMemo(() => {
    // Primary: from reservation details API -> payableAmount.guest
    const payableGuest = reservationDetailsResult?.payableAmount?.guest;
    if (payableGuest?.amount != null) return payableGuest;

    // Fallback: from folios
    const folios = reservationDetailsResult?.folios;
    if (Array.isArray(folios) && folios.length > 0) {
      const mainFolio = folios.find(f => f.isMainFolio) ?? folios[0];
      if (mainFolio?.balance) return mainFolio.balance;
    }

    // Fallback: balance (use absolute value)
    const directBalance = reservationDetailsResult?.balance;
    if (directBalance?.amount != null) return directBalance;

    // Fallback from reservation state
    const fallback = reservation?.payableAmount?.guest ?? reservation?.balance;
    if (fallback?.amount != null) return fallback;

    return null;
  }, [reservationDetailsResult, reservation]);

  const dueAmount = useMemo(() => {
    const amt = payableAmountData?.amount;
    if (amt == null) return null;
    const n = Number(amt);
    if (Number.isNaN(n)) return null;
    // Use absolute value since balance can be negative
    return Math.round(Math.abs(n) * 100) / 100;
  }, [payableAmountData]);

  const currency = useMemo(() => {
    return payableAmountData?.currency ?? reservation?.currency ?? 'EUR';
  }, [payableAmountData, reservation]);

  const roomName = useMemo(() => {
    if (!room) return null;
    
    // Try multiple possible locations for room name
    return room.name 
      ?? room.unitGroup?.name 
      ?? room._offerData?.unitGroup?.name
      ?? room.roomTypeName
      ?? room.roomType?.name
      ?? t('common.notAvailable');
  }, [room, t]);

  const roomNumber = useMemo(() => {
    // From reservation details API
    if (reservationDetailsResult?.unit?.name) return reservationDetailsResult.unit.name;
    if (reservationDetailsResult?.unit?.id) return reservationDetailsResult.unit.id;
    if (reservationDetailsResult?.roomNumber) return reservationDetailsResult.roomNumber;
    // From booking response (assignedUnit stored in reservation state)
    if (reservation?.assignedUnit?.name) return reservation.assignedUnit.name;
    if (reservation?.roomNumber) return reservation.roomNumber;
    return null;
  }, [reservationDetailsResult, reservation]);

  const handleReturnHome = () => {
    navigate('/home');
  };

  const handleProceedToPayment = () => {
    if (!reservationIdForQuery) return;
    const fallbackAmount = Number(reservation?.totalAmount ?? 0);
    const amountToPay = dueAmount ?? (Number.isNaN(fallbackAmount) ? 0 : fallbackAmount);
    navigate('/reservation/payment', {
      state: {
        reservationId: reservationIdForQuery,
        amount: amountToPay,
        currency,
        reservation,
        reservationDetails: reservationDetailsResult,
        room,
        guestDetails,
      },
    });
  };

  // Trigger celebration animation on mount
  useEffect(() => {
    if (reservation) {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [reservation]);

  if (!reservation) {
    return null;
  }

  // If we can't read balance yet, default to showing the payment button for new reservations.
  const showPaymentPending = !!reservationIdForQuery && (dueAmount == null || dueAmount > 0);

  return (
    <Container
      size="lg"
      style={CONTAINER_STYLES.centered}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={PAPER_STYLES.medium}
      >
      

        <Stack gap="lg" mb="xl" align="center">
          {/* Animated Success Checkmark */}
        
          <Title order={1} c="#0B152A" fw={700} ta="center">
            {t('reservationComplete.success')}
          </Title>

          <Text size="lg" fw={600} c="#C8653D">
            {t('reservationComplete.reservationNumber')}: {reservationNumber}
          </Text>

          {/* Reservation Details Card */}
          {(room || guestDetails || reservation.checkIn) && (
            <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
              <Stack gap="md">
                {isLoadingReservationDetails && (
                  <Group justify="center">
                    <Loader size="sm" color="#C8653D" />
                    <Text size="sm" c="dimmed">
                      {t('common.loading')}
                    </Text>
                  </Group>
                )}

                {reservationDetailsError && (
                  <Alert
                    icon={<IconAlertCircle size={18} />}
                    color="orange"
                    variant="light"
                    radius="md"
                    title={t('error.title') ?? 'Notice'}
                  >
                    <Text size="sm">
                      {reservationDetailsError?.message ?? t('error.generic') ?? 'Unable to load full reservation details yet.'}
                    </Text>
                  </Alert>
                )}

                {guestDetails && (
                  <Group gap="sm">
                    <IconUser size={20} color="#C8653D" />
                    <Text size="md" fw={600}>{t('reservationComplete.guest')}:</Text>
                    <Text size="md">{guestDetails.firstName} {guestDetails.lastName}</Text>
                  </Group>
                )}
                
                {(room || reservation.roomTypeId) && roomName && (
                  <Group gap="sm">
                    <IconCreditCard size={20} color="#C8653D" />
                    <Text size="md" fw={600}>{t('reservationComplete.room')}:</Text>
                    <Text size="md">{roomName}</Text>
                  </Group>
                )}

                {roomNumber && (
                  <Group gap="sm">
                    <IconCreditCard size={20} color="#C8653D" />
                    <Text size="md" fw={600}>{t('reservationComplete.roomNumber') ?? 'Room number'}:</Text>
                    <Text size="md">{roomNumber}</Text>
                  </Group>
                )}
                
                {reservation.checkIn && (
                  <>
                    <Divider />
                    <Group gap="sm">
                      <IconCalendar size={20} color="#C8653D" />
                      <Text size="md" fw={600}>{t('reservationComplete.checkIn')}:</Text>
                      <Text size="md">{formatDate(reservation.checkIn)}</Text>
                    </Group>
                    {reservation.checkOut && (
                      <Group gap="sm">
                        <IconCalendar size={20} color="#C8653D" />
                        <Text size="md" fw={600}>{t('reservationComplete.checkOut')}:</Text>
                        <Text size="md">{formatDate(reservation.checkOut)}</Text>
                      </Group>
                    )}
                  </>
                )}
                
                {reservation.totalAmount && (
                  <>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="md" fw={600}>{t('reservationComplete.totalAmount')}:</Text>
                      <Text size="lg" fw={700} c="#C8653D">
                        {reservation.currency || 'EUR'} {reservation.totalAmount}
                      </Text>
                    </Group>
                  </>
                )}

                <Divider />
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    {showPaymentPending
                      ? (t('paymentCheck.amountDue') ?? 'Amount due')
                      : (t('paymentCheck.amountPaid') ?? 'Payment')}
                    :
                  </Text>
                  <Text size="lg" fw={800} c={showPaymentPending ? '#C8653D' : 'green'}>
                    {currency} {showPaymentPending ? (dueAmount ?? Number(reservation?.totalAmount ?? 0)).toFixed(2) : '0.00'}
                  </Text>
                </Group>
                {showPaymentPending && (
                  <Text size="sm" c="dimmed">
                    {t('paymentCheck.paymentRequiredToProceed') ?? 'Payment is required to proceed.'}
                  </Text>
                )}
                {!isLoadingReservationDetails && reservationDetailsError && (
                  <Text size="xs" c="dimmed">
                    {t('paymentCheck.unableToVerifyPayment') ?? 'Unable to verify payment. You can still proceed to payment.'}
                  </Text>
                )}
              </Stack>
            </Card>
          )}

        </Stack>

        <Group justify="center" gap="md">
        
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={handleReturnHome}
            styles={BUTTON_STYLES.primary}
            radius="md"
          >
            {t('reservationComplete.returnHome')}
          </Button>
          {showPaymentPending && (
            <Button
              size="lg"
              onClick={handleProceedToPayment}
              styles={BUTTON_STYLES.primary}
              radius="md"
            >
              {t('common.proceedToPayment') ?? 'Proceed to Payment'}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};

export default ReservationCompletePage;
