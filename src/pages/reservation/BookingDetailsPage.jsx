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
  Checkbox,
  Image,
  Badge,
  SimpleGrid,
  Alert,
  Loader,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCheck, IconEdit } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import usePropertyStore from '../../stores/propertyStore';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';
import { getRoomDetails, calculateRoomPricing } from '../../services/roomService';
import { createBooking } from '../../services/bookingService';
import { useMutation } from '@tanstack/react-query';
import UnoLogo from '../../assets/uno.jpg';

const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const { room, searchCriteria, guestDetails } = location.state || {};

  // Fetch room details with images if room images are missing
  useEffect(() => {
    const fetchRoomImages = async () => {
      if (room && room.roomTypeId) {
        const hasImages = room.images && Array.isArray(room.images) && room.images.length > 0;
        
        if (!hasImages) {
          setLoading(true);
          try {
            const propertyId = usePropertyStore.getState().propertyId;
            if (!propertyId) {
              throw new Error('Property ID is required');
            }
            const result = await getRoomDetails(room.roomTypeId, propertyId);
            
            if (result.success && result.data && result.data.images) {
              setRoomData({
                ...room,
                images: result.data.images.length > 0 ? result.data.images : [UnoLogo],
              });
            } else {
              setRoomData({
                ...room,
                images: [UnoLogo],
              });
            }
          } catch (err) {
            setRoomData({
              ...room,
              images: [UnoLogo],
            });
          } finally {
            setLoading(false);
          }
        } else {
          setRoomData(room);
        }
      } else if (room) {
        setRoomData({
          ...room,
          images: room.images && Array.isArray(room.images) && room.images.length > 0 
            ? room.images 
            : [UnoLogo],
        });
      }
    };

    fetchRoomImages();
  }, [room]);

  const displayRoom = roomData || room;

  // Calculate pricing from offer data
  useEffect(() => {
    if (displayRoom && searchCriteria?.checkIn && searchCriteria?.checkOut) {
      const calculatedPricing = calculateRoomPricing(displayRoom, searchCriteria.checkIn, searchCriteria.checkOut);
      setPricing(calculatedPricing);
    }
  }, [displayRoom, searchCriteria]);
  const baseImages = displayRoom?.images && Array.isArray(displayRoom.images) && displayRoom.images.length > 0
    ? displayRoom.images
    : [UnoLogo];
  
  const roomImages = baseImages.length >= 2 
    ? baseImages.slice(0, 3)
    : baseImages.length === 1
    ? [baseImages[0], UnoLogo]
    : [UnoLogo];

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
      // Extract reservation ID from various possible response structures
      const reservationIdSources = [
        result?.bookingId,
        result?.id,
        result?.reservationId,
        result?.reservation?.id,
        result?.reservation?.bookingId,
        result?.reservations?.[0]?.id,
        result?.reservations?.[0]?.bookingId,
        result?.data?.bookingId,
        result?.data?.id,
        result?.data?.reservationId,
      ];
      const reservationId = reservationIdSources.find(id => id != null && id !== 'BOOKING-CREATED');

      const reservation = {
        bookingId: reservationId,
        reservationId,
        id: reservationId,
        guestDetails,
        roomTypeId: displayRoom?.roomTypeId,
        checkIn: searchCriteria?.checkIn ?? '',
        checkOut: searchCriteria?.checkOut ?? '',
        guests: searchCriteria?.guests,
        totalAmount: pricing?.total ?? displayRoom?.totalPrice ?? 0,
        currency: pricing?.currency ?? displayRoom?.currency ?? 'EUR',
        status: 'confirmed',
        bookingData: result,
      };

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

    const bookingPayload = {
      unitGroupId: displayRoom?.unitGroupId || displayRoom?.roomTypeId || displayRoom?._offerData?.unitGroup?.id,
      ratePlanId: displayRoom?.ratePlanId || displayRoom?._offerData?.ratePlan?.id,
      arrival: searchCriteria?.checkIn,
      departure: searchCriteria?.checkOut,
      adults: Number(searchCriteria?.guests) || 1,
      primaryGuest: {
        firstName: guestDetails?.firstName,
        lastName: guestDetails?.lastName,
        email: guestDetails?.email,
        phone: guestDetails?.phone,
        address: {
          addressLine1: guestDetails?.addressStreet,
          city: guestDetails?.addressCity,
          postalCode: guestDetails?.addressPostal,
          countryCode: guestDetails?.country,
          ...(guestDetails?.addressState ? { region: guestDetails.addressState } : {}),
        },
      },
    };

    if (!bookingPayload.unitGroupId || !bookingPayload.ratePlanId) {
      setValidationError(t('error.missingRoomInformation') || 'Missing room information. Please go back and select a room.');
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

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1));
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
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        maxWidth: '1000px',
      }}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between" mb="md">
            <PropertyHeader />
            <BackButton onClick={handleBack} text={t('common.back')} />
          </Group>

          {/* Page Title */}
          <Title order={1} style={{ fontSize: '48px', fontWeight: 900, color: '#212121' }}>
            {t('bookingDetails.title')}
          </Title>

          {/* Image Carousel */}
          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={roomImages[selectedImageIndex] || UnoLogo}
              alt={displayRoom?.name || 'Room'}
              height={400}
              fit="cover"
              onError={(e) => {
                e.target.src = UnoLogo;
              }}
            />
            
            {/* Carousel Controls */}
            {roomImages.length > 1 && (
              <>
                <Button
                  variant="white"
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  onClick={handlePreviousImage}
                >
                  <IconChevronLeft size={32} />
                </Button>
                <Button
                  variant="white"
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                  onClick={handleNextImage}
                >
                  <IconChevronRight size={32} />
                </Button>
                
                {/* Dots Indicator */}
                <Group
                  gap="xs"
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {roomImages.map((_, index) => (
                    <Box
                      key={index}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: index === selectedImageIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </Group>
              </>
            )}
          </Box>

          {/* Content Grid */}
          <Stack gap="xl">
            {/* Room Description Section */}
            <Stack gap="md">
              <Title order={2} style={{ fontSize: '36px', fontWeight: 700, color: '#212121' }}>
                {displayRoom?.name || 'Room'}
              </Title>
              <Text size="xl" style={{ fontSize: '24px', lineHeight: 1.6, color: '#212121' }}>
                {displayRoom?.description || t('bookingDetails.noDescription')}
              </Text>

              {/* Amenities */}
              {(displayRoom?.amenities && displayRoom.amenities.length > 0) && (
                <Box>
                  <Title order={3} style={{ fontSize: '24px', fontWeight: 700, color: '#212121', marginBottom: 12 }}>
                    {t('bookingDetails.amenities')}
                  </Title>
                  <SimpleGrid cols={2} spacing="md">
                    {displayRoom.amenities.map((amenity, index) => (
                      <Group key={index} gap="sm">
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#C8653D',
                            flexShrink: 0,
                          }}
                        />
                        <Text size="xl" style={{ fontSize: '24px', color: '#212121' }}>
                          {amenity}
                        </Text>
                      </Group>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Stack>

            {/* Booking Summary Card */}
            <Card
              withBorder
              p="xl"
              radius="lg"
              style={{
                backgroundColor: '#F5F5F5',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Stack gap="lg">
                <Title order={2} style={{ fontSize: '32px', fontWeight: 700, color: '#212121', marginBottom: 8 }}>
                  {t('bookingDetails.bookingSummary')}
                </Title>

                {/* Guest and Booking Info */}
                <Stack gap="md" style={{ borderBottom: '1px solid #D1D5DB', paddingBottom: 24 }}>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575', fontWeight: 500 }}>
                      {t('bookingDetails.guestName')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#212121', fontWeight: 700, textAlign: 'right' }}>
                      {guestDetails?.firstName} {guestDetails?.lastName}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575', fontWeight: 500 }}>
                      {t('bookingDetails.dates')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#212121', fontWeight: 700, textAlign: 'right' }}>
                      {formatDateRange()}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575', fontWeight: 500 }}>
                      {t('bookingDetails.nights')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#212121', fontWeight: 700, textAlign: 'right' }}>
                      {nights} {t('bookingDetails.nightsLabel')}
                    </Text>
                  </Group>
                  <Group justify="space-between" align="flex-start">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575', fontWeight: 500 }}>
                      {t('bookingDetails.roomType')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#212121', fontWeight: 700, textAlign: 'right' }}>
                      {displayRoom?.name || t('common.room') || 'Room'}
                    </Text>
                  </Group>
                </Stack>

                {/* Pricing Breakdown */}
                <Stack gap="sm" style={{ borderBottom: '1px solid #D1D5DB', paddingBottom: 24 }}>
                  <Group justify="space-between">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {t('bookingDetails.pricePerNight')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {currency} {pricePerNight.toFixed(2)}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {t('bookingDetails.subtotal')} ({nights} {t('bookingDetails.nightsLabel')})
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {currency} {subtotal.toFixed(2)}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {t('bookingDetails.taxesFees')}
                    </Text>
                    <Text size="xl" style={{ fontSize: '24px', color: '#757575' }}>
                      {currency} {taxes.toFixed(2)}
                    </Text>
                  </Group>
                </Stack>

                {/* Total */}
                <Group justify="space-between" style={{ paddingTop: 8 }}>
                  <Text size="xl" style={{ fontSize: '32px', fontWeight: 700, color: '#212121' }}>
                    {t('bookingDetails.total')}
                  </Text>
                  <Text size="xl" style={{ fontSize: '48px', fontWeight: 700, color: '#C8653D' }}>
                    {currency} {total.toFixed(2)}
                  </Text>
                </Group>
              </Stack>
            </Card>

            {/* Terms and Actions */}
            <Stack gap="xl" style={{ paddingBottom: 40 }}>
              {/* Terms Checkbox */}
              <Checkbox
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.currentTarget.checked)}
                label={
                  <Text size="xl" style={{ fontSize: '24px', color: '#212121', lineHeight: 1.5 }}>
                    {t('bookingDetails.termsText')}
                    <Text
                      component="a"
                      href="#"
                      style={{
                        color: '#C8653D',
                        textDecoration: 'underline',
                        textUnderlineOffset: 4,
                        textDecorationThickness: 2,
                        fontWeight: 500,
                      }}
                    >
                      {t('bookingDetails.termsLink')}
                    </Text>
                    {t('bookingDetails.termsTextEnd')}
                  </Text>
                }
                size="lg"
                style={{
                  alignItems: 'flex-start',
                }}
                styles={{
                  body: {
                    alignItems: 'flex-start',
                  },
                  label: {
                    paddingLeft: 16,
                  },
                }}
              />

              {/* Error Alerts */}
              {validationError && (
                <Alert color="red" variant="light" onClose={() => setValidationError(null)} withCloseButton>
                  {validationError}
                </Alert>
              )}
              {bookingMutation.isError && (
                <Alert color="red" variant="light" onClose={() => bookingMutation.reset()} withCloseButton>
                  {bookingMutation.error?.response?.data?.message || 
                   bookingMutation.error?.message || 
                   t('error.failedToCreateBooking') || 
                   'Failed to create booking. Please try again.'}
                </Alert>
              )}

              {/* Action Buttons */}
              <Stack gap="md">
                {/* Primary Button - Confirm Booking */}
                <Button
                  size="xl"
                  loading={bookingMutation.isPending}
                  disabled={!termsAccepted || bookingMutation.isPending}
                  onClick={handleConfirmBooking}
                  leftSection={!bookingMutation.isPending && <IconCheck size={32} />}
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '12px',
                    backgroundColor: '#C8653D',
                    color: '#FFFFFF',
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#B8552F';
                      e.currentTarget.style.transform = 'scale(0.99)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#C8653D';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {bookingMutation.isPending 
                    ? t('bookingDetails.processing')
                    : t('bookingDetails.confirmBooking')}
                </Button>

                {/* Secondary Button - Edit Details */}
                <Button
                  size="xl"
                  variant="outline"
                  onClick={handleEditDetails}
                  leftSection={<IconEdit size={32} />}
                  style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '12px',
                    borderWidth: 3,
                    borderColor: '#C8653D',
                    color: '#C8653D',
                    backgroundColor: 'transparent',
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(200, 101, 61, 0.05)';
                    e.currentTarget.style.transform = 'scale(0.99)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {t('bookingDetails.editDetails')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default BookingDetailsPage;

