import React, { useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Card,
  Checkbox,
  Alert,
} from '@mantine/core';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import usePropertyStore from '../../stores/propertyStore';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';
import { calculateRoomPricing } from '../../services/roomService';
import { createBooking } from '../../services/bookingService';
import { buildBookingPayload, getBookingErrorMessage } from '../../utils/booking.utils';
import { useMutation } from '@tanstack/react-query';
import { BUTTON_STYLES, CONTAINER_STYLES, PAPER_STYLES } from '../../config/constants';

const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const { room, searchCriteria, guestDetails } = location.state || {};
  const displayRoom = room;

  // Calculate pricing from offer data
  useMemo(() => {
    if (!displayRoom || !searchCriteria?.checkIn || !searchCriteria?.checkOut) return;
    const calculatedPricing = calculateRoomPricing(displayRoom, searchCriteria.checkIn, searchCriteria.checkOut);
    setPricing(calculatedPricing);
  }, [displayRoom, searchCriteria?.checkIn, searchCriteria?.checkOut]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = () => {
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut) return '';
    const checkIn = formatDate(searchCriteria.checkIn);
    const checkOut = formatDate(searchCriteria.checkOut);
    return `${checkIn} - ${checkOut}`;
  };

  const calculateNights = () => {
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut) return 0;
    return Math.ceil((new Date(searchCriteria.checkOut) - new Date(searchCriteria.checkIn)) / (1000 * 60 * 60 * 24));
  };

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (result) => {
      // Support multiple API response shapes:
      // Primary: { success: true, data: { booking: { reservationIds: [{ id }] }, assignedRoom: { timeSlices: [{ unit }] } } }
      // Fallback: { success: true, data: { reservations: [{ id }] } }
      // Fallback: { data: { id } } or { id }
      const data = result?.data ?? result;

      // Extract reservation ID - try multiple paths
      const reservationId =
        data?.booking?.reservationIds?.[0]?.id ??  // Primary: booking.reservationIds[0].id
        data?.booking?.id ??                        // Fallback: booking.id
        data?.reservations?.[0]?.id ??              // Fallback: reservations[0].id
        data?.data?.reservations?.[0]?.id ??
        data?.reservation?.id ??
        data?.data?.reservation?.id ??
        data?.id ??
        data?.reservationId ??
        null;

      // Extract booking ID (parent booking)
      const bookingId = data?.booking?.id ?? reservationId;

      // Extract assigned room info if available
      const assignedUnit = data?.assignedRoom?.timeSlices?.[0]?.unit ?? null;

      const reservation = {
        reservationId,
        id: reservationId,
        bookingId,
        guestDetails,
        roomTypeId: displayRoom?.roomTypeId,
        checkIn: searchCriteria?.checkIn ?? '',
        checkOut: searchCriteria?.checkOut ?? '',
        guests: searchCriteria?.guests,
        totalAmount: pricing?.total ?? displayRoom?.totalPrice ?? 0,
        currency: pricing?.currency ?? displayRoom?.currency ?? 'EUR',
        status: 'confirmed',
        bookingData: result,
        // Include assigned room info
        assignedUnit,
        roomNumber: assignedUnit?.name ?? null,
      };

      console.log('[BookingDetailsPage] Booking success, extracted:', {
        reservationId,
        bookingId,
        assignedUnit,
        fullResult: result,
      });

      navigate('/reservation/complete', {
        state: {
          reservation,
          room: displayRoom,
          guestDetails,
        },
      });
    },
    onError: (error) => {
      console.error('Booking creation failed:', error);
      const errorMessage = getBookingErrorMessage(error);
      setValidationError(errorMessage);
    },
  });

  const handleConfirmBooking = () => {
    setValidationError(null);

    if (!termsAccepted) {
      setValidationError(t('bookingDetails.termsRequired'));
      return;
    }

    const propertyId = usePropertyStore.getState().propertyId;
    if (!propertyId) {
      setValidationError(t('error.propertyNotSelected') || 'Property ID is required. Please select a property first.');
      return;
    }

    // Extract unitGroup and ratePlan IDs from offer data
    const offerData = displayRoom?._offerData;
    const unitGroup = offerData?.unitGroup || {};
    const ratePlan = offerData?.ratePlan || {};
    
    const unitGroupId = displayRoom?.unitGroupId || displayRoom?.roomTypeId || unitGroup.id || unitGroup.code;
    const ratePlanId = displayRoom?.ratePlanId || ratePlan.id || ratePlan.code;

    if (!unitGroupId || !ratePlanId) {
      setValidationError(t('error.missingRoomInformation') || 'Missing room information. Please go back and select a room.');
      return;
    }

    // Validate required fields before building payload
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut) {
      setValidationError(t('error.missingDates') || 'Check-in and check-out dates are required.');
      return;
    }

    if (!guestDetails?.firstName || !guestDetails?.lastName) {
      setValidationError(t('error.missingGuestInfo') || 'Guest first name and last name are required.');
      return;
    }

    // Format dates to YYYY-MM-DD
    const formatDateForAPI = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    // Build the booking payload using utility function
    const bookingPayload = buildBookingPayload(searchCriteria, guestDetails, ratePlanId, formatDateForAPI);

    console.log('[BookingDetailsPage] Booking payload before mutation:', {
      bookingPayload,
      hasReservations: !!bookingPayload.reservations,
      reservationsLength: bookingPayload.reservations?.length,
      firstReservation: bookingPayload.reservations?.[0],
      payloadStringified: JSON.stringify(bookingPayload, null, 2),
    });

    // Validate payload before mutation
    if (!bookingPayload.reservations || !Array.isArray(bookingPayload.reservations) || bookingPayload.reservations.length === 0) {
      const errorMsg = 'Invalid booking payload: reservations array is missing or empty';
      console.error('[BookingDetailsPage]', errorMsg, bookingPayload);
      setValidationError(errorMsg);
      return;
    }

    // Ensure the payload is exactly what we expect
    if (!bookingPayload.reservations[0]?.arrival || !bookingPayload.reservations[0]?.departure) {
      const errorMsg = 'Invalid booking payload: arrival and departure dates are required';
      console.error('[BookingDetailsPage]', errorMsg, bookingPayload);
      setValidationError(errorMsg);
      return;
    }

    bookingMutation.mutate(bookingPayload);
  };

  const handleBack = () => {
    navigate('/reservation/guest-details', {
      state: { room: displayRoom, searchCriteria },
    });
  };

  const handleEditDetails = () => {
    navigate('/reservation/guest-details', {
      state: { room: displayRoom, searchCriteria },
    });
  };


  if (!displayRoom || !guestDetails || !searchCriteria) {
    navigate('/reservation/search');
    return null;
  }

  const nights = calculateNights();
  // Use pricing from offer data if available, otherwise fallback to room data
  const pricePerNight = pricing?.pricePerNight ?? displayRoom?.pricePerNight ?? 0;
  const subtotal = pricing?.subtotal ?? (pricePerNight * nights);
  const taxes = pricing?.taxes ?? 0;
  const total = pricing?.total ?? displayRoom?.totalPrice ?? displayRoom?._offerData?.totalGrossAmount?.amount ?? (subtotal + taxes);
  const currency = pricing?.currency ?? displayRoom?.currency ?? displayRoom?._offerData?.totalGrossAmount?.currency ?? 'EUR';

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
        <Stack gap="lg">
          <Group justify="space-between" mb="sm" pb="md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
            <BackButton onClick={handleBack} text={t('common.back')} />
          </Group>

          <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
            {t('bookingDetails.title') ?? 'Booking Summary'}
          </Title>

          <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>{t('bookingDetails.guestName') ?? 'Guest'}:</Text>
                <Text fw={700}>{guestDetails?.firstName} {guestDetails?.lastName}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>{t('bookingDetails.roomType') ?? 'Room'}:</Text>
                <Text fw={700}>{displayRoom?.name ?? t('common.notAvailable')}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>{t('bookingDetails.dates') ?? 'Dates'}:</Text>
                <Text fw={700}>{formatDateRange()}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={600}>{t('bookingDetails.nights') ?? 'Nights'}:</Text>
                <Text fw={700}>{nights}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={700}>{t('bookingDetails.total') ?? 'Total'}:</Text>
                <Text fw={800} c="#C8653D">
                  {currency} {total.toFixed(2)}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Checkbox
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.currentTarget.checked)}
            label={t('bookingDetails.termsText') ?? 'I accept the terms and conditions'}
          />

          {validationError && (
            <Alert color="red" variant="light" onClose={() => setValidationError(null)} withCloseButton>
              {validationError}
            </Alert>
          )}
          {bookingMutation.isError && (
            <Alert color="red" variant="light" onClose={() => bookingMutation.reset()} withCloseButton>
              {getBookingErrorMessage(bookingMutation.error)}
            </Alert>
          )}

          <Stack gap="md">
            <Button
              size="lg"
              loading={bookingMutation.isPending}
              disabled={!termsAccepted || bookingMutation.isPending}
              onClick={handleConfirmBooking}
              leftSection={!bookingMutation.isPending && <IconCheck size={20} />}
              styles={BUTTON_STYLES.primary}
              radius="md"
              fullWidth
            >
              {bookingMutation.isPending
                ? (t('bookingDetails.processing') ?? 'Processing...')
                : (t('bookingDetails.confirmBooking') ?? 'Confirm Booking')}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleEditDetails}
              leftSection={<IconEdit size={20} />}
              radius="md"
              fullWidth
              style={{ borderColor: '#C8653D', color: '#C8653D' }}
            >
              {t('bookingDetails.editDetails') ?? 'Edit Details'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default BookingDetailsPage;

