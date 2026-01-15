import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Stack,
  Box,
  Card,
  Checkbox,
  Image,
  Grid,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { IconWifi, IconSnowflake, IconShield, IconCoffee, IconDeviceTv } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';
import { useRoomQuery } from '../../hooks/useRoomQuery';
import UnoLogo from '../../assets/uno.jpg';

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { room, searchCriteria, guestDetails } = location.state || {};

  const hasImages = room?.images && Array.isArray(room.images) && room.images.length > 0;
  const shouldFetchDetails = room?.roomTypeId && !hasImages;

  const { data: roomDetailsResult, isLoading: isLoadingRoomDetails } = useRoomQuery(
    room?.roomTypeId,
    { enabled: shouldFetchDetails }
  );

  const roomData = useMemo(() => {
    if (!room) return null;

    if (hasImages) {
      return room;
    }

    if (roomDetailsResult?.data?.images && roomDetailsResult.data.images.length > 0) {
      return {
        ...room,
        images: roomDetailsResult.data.images,
      };
    }

    return {
      ...room,
      images: room.images && Array.isArray(room.images) && room.images.length > 0
        ? room.images
        : [UnoLogo],
    };
  }, [room, hasImages, roomDetailsResult]);

  // Use roomData if available, otherwise fallback to room
  const displayRoom = roomData || room;
  
  // Ensure images array exists
  const baseImages = displayRoom?.images && Array.isArray(displayRoom.images) && displayRoom.images.length > 0
    ? displayRoom.images
    : [UnoLogo];
  
  // Use available images or default logo
  const roomImages = baseImages.length >= 2 
    ? baseImages.slice(0, 3)
    : baseImages.length === 1
    ? [baseImages[0], UnoLogo]
    : [UnoLogo];
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

  const amenityIcons = {
    'WiFi': <IconWifi size={16} />,
    'Air Conditioning': <IconSnowflake size={16} />,
    'TV': <IconDeviceTv size={16} />,
    'Safe': <IconShield size={16} />,
    'Mini Bar': <IconCoffee size={16} />,
  };

  const getAmenityTranslation = (amenity) => {
    const amenityMap = {
      'WiFi': t('roomDetail.amenities.wifi'),
      'Air Conditioning': t('roomDetail.amenities.airConditioning'),
      'TV': t('roomDetail.amenities.tv'),
      'Safe': t('roomDetail.amenities.safe'),
      'Mini Bar': t('roomDetail.amenities.miniBar'),
    };
    return amenityMap[amenity] || amenity;
  };

  // Calculate pricing information
  const pricing = React.useMemo(() => {
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut || !displayRoom) {
      return { nights: 0, pricePerNight: 0, subtotal: 0, taxes: 0, total: 0, currency: 'EUR' };
    }

    const checkIn = new Date(searchCriteria.checkIn);
    const checkOut = new Date(searchCriteria.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    // Get amounts from offer data or room data
    const offerData = displayRoom?._offerData ?? displayRoom;
    const totalGrossAmount = offerData?.totalGrossAmount?.amount ?? displayRoom?.totalGrossAmount?.amount ?? displayRoom?.totalPrice ?? 0;
    const totalNetAmount = offerData?.totalNetAmount?.amount ?? displayRoom?.totalNetAmount?.amount ?? 0;
    const currency = offerData?.totalGrossAmount?.currency ?? displayRoom?.totalGrossAmount?.currency ?? displayRoom?.currency ?? 'EUR';
    
    // Calculate tax from multiple possible sources
    let taxes = 0;
    
    // Method 1: Calculate from timeSlices if available (sum of all tax amounts)
    if (offerData?.timeSlices && Array.isArray(offerData.timeSlices) && offerData.timeSlices.length > 0) {
      const totalTaxFromSlices = offerData.timeSlices.reduce((sum, slice) => {
        const sliceTax = slice.totalTaxAmount?.amount ?? 
                        (slice.totalGrossAmount?.amount && slice.totalNetAmount?.amount 
                          ? slice.totalGrossAmount.amount - slice.totalNetAmount.amount 
                          : 0);
        return sum + (sliceTax || 0);
      }, 0);
      if (totalTaxFromSlices > 0) {
        taxes = totalTaxFromSlices;
      }
    }
    
    // Method 2: Calculate from gross - net if available
    if (taxes === 0 && totalNetAmount > 0 && totalGrossAmount > totalNetAmount) {
      taxes = totalGrossAmount - totalNetAmount;
    }
    
    // Method 3: Get tax amount directly from offer
    if (taxes === 0) {
      taxes = offerData?.totalTaxAmount?.amount ?? 
              displayRoom?.totalTaxAmount?.amount ?? 
              displayRoom?.taxes ?? 
              0;
    }
    
    // Method 4: If still 0, calculate as percentage (typical VAT is 10-20%, using 10% as default)
    if (taxes === 0 && totalGrossAmount > 0) {
      // Calculate tax as 10% of gross (this is a fallback, should ideally come from API)
      taxes = totalGrossAmount * 0.1;
    }
    
    // Calculate subtotal (net amount or gross - taxes)
    const subtotal = totalNetAmount > 0 ? totalNetAmount : (totalGrossAmount - taxes);
    
    // Calculate price per night from subtotal (before taxes)
    const pricePerNight = nights > 0 ? subtotal / nights : 0;
    
    // Total should always be the gross amount (subtotal + taxes)
    const total = totalGrossAmount;

    return {
      nights,
      pricePerNight: Math.round(pricePerNight * 100) / 100, // Round to 2 decimal places
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      taxes: Math.round(taxes * 100) / 100, // Round to 2 decimal places
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      currency,
    };
  }, [searchCriteria, displayRoom]);

  const handleConfirm = () => {
    // Reservation flow must always create the booking first, then payment,
    // and only then (if early) show early-arrival before check-in.
    navigate('/reservation/payment', {
      state: {
        room: displayRoom,
        searchCriteria,
        guestDetails,
      },
    });
  };

  const handleBack = () => {
    navigate('/reservation/guest-details', {
      state: { room: displayRoom, searchCriteria },
    });
  };

  // Handle missing data without immediate redirect
  if (!displayRoom || !guestDetails) {
    return (
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <Text size="lg" c="red">
            {t('roomDetail.errorMissingData')}
          </Text>
          <Button
            variant="outline"
            mt="md"
            onClick={() => navigate('/reservation/search')}
            style={{ borderColor: '#C8653D', color: '#C8653D', borderRadius: '12px' }}
          >
            {t('common.backToSearch')}
          </Button>
        </Paper>
      </Container>
    );
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
          maxWidth: '700px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        <Stack gap="lg" mb="xl">
          {/* Room Images Gallery */}
          <Stack gap="md">
            <Text size="xl" fw={600}>{displayRoom.name}</Text>
              
            {/* Main Image */}
            {isLoadingRoomDetails ? (
                <Box style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <Text c="#666666">{t('common.loading')}</Text>
                </Box>
              ) : (
                <Box style={{ position: 'relative' }}>
                  <Image
                    src={roomImages[selectedImageIndex] || UnoLogo}
                    alt={`${displayRoom.name} - Image ${selectedImageIndex + 1}`}
                    height={300}
                    radius="md"
                    style={{ objectFit: 'cover', width: '100%' }}
                    onError={(e) => {
                      e.target.src = UnoLogo;
                    }}
                  />
                  {roomImages.length > 1 && (
                    <Badge
                      size="sm"
                      color="orange"
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    >
                      {selectedImageIndex + 1} / {roomImages.length}
                    </Badge>
                  )}
                </Box>
              )}

            {/* Thumbnail Images */}
            {!isLoadingRoomDetails && roomImages.length > 1 && (
                <SimpleGrid cols={3} spacing="sm">
                  {roomImages.map((image, index) => (
                  <Box
                    key={index}
                    style={{
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid #C8653D' : '2px solid transparent',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || UnoLogo}
                      alt={`${displayRoom.name} - Thumbnail ${index + 1}`}
                      height={80}
                      style={{ objectFit: 'cover', width: '100%' }}
                      onError={(e) => {
                        e.target.src = UnoLogo;
                      }}
                    />
                  </Box>
                  ))}
                </SimpleGrid>
              )}

              <Text size="md" c="#666666">{displayRoom.description}</Text>

              <Stack gap="sm">
                <Text size="md" fw={600}>{t('roomDetail.amenities.title')}:</Text>
                <Group gap="sm">
                  {(displayRoom.amenities || []).map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="light"
                      color="blue"
                      leftSection={amenityIcons[amenity] || null}
                      size="sm"
                    >
                      {getAmenityTranslation(amenity)}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="#666666">{t('roomDetail.capacity')}:</Text>
                  <Text size="md" fw={600}>{displayRoom.capacity || displayRoom.maxGuests || 1} {t('common.guests')}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="#666666">{t('roomDetail.maxGuests')}:</Text>
                  <Text size="md" fw={600}>{displayRoom.maxGuests || displayRoom.capacity || 1} {t('common.guests')}</Text>
                </Grid.Col>
              </Grid>

              <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', border: '2px solid #C8653D' }}>
                <Stack gap="md">
                  <Text size="lg" fw={600} c="#C8653D">{t('roomDetail.bookingSummary')}</Text>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.guestName')}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{guestDetails.firstName} {guestDetails.lastName}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.checkInDate')}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{formatDate(searchCriteria.checkIn)}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.checkOutDate')}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{formatDate(searchCriteria.checkOut)}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.numberOfNights')}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>
                      {Math.ceil((new Date(searchCriteria.checkOut) - new Date(searchCriteria.checkIn)) / (1000 * 60 * 60 * 24))} {t('roomDetail.nights')}
                    </Text>
                  </Group>
                  
                  <Box style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="#666666">{t('roomDetail.pricePerNight')}:</Text>
                        <Text size="sm" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>
                          {pricing.currency} {pricing.pricePerNight > 0 ? pricing.pricePerNight.toFixed(2) : '0.00'}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="#666666">{t('roomDetail.tax')}:</Text>
                        <Text size="sm" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>
                          {pricing.currency} {pricing.taxes > 0 ? pricing.taxes.toFixed(2) : '0.00'}
                        </Text>
                      </Group>
                      <Group justify="space-between" style={{ borderTop: '2px solid #C8653D', paddingTop: '10px' }}>
                        <Text size="lg" fw={700} c="#C8653D">{t('roomDetail.total')}:</Text>
                        <Text size="xl" fw={700} c="#C8653D" style={{ textAlign: 'right', minWidth: '180px' }}>
                          {pricing.currency} {pricing.total > 0 ? pricing.total.toFixed(2) : '0.00'}
                        </Text>
                      </Group>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            </Stack>

          <Checkbox
            label={t('roomDetail.terms')}
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.currentTarget.checked)}
          />
        </Stack>

        <Group justify="space-between">
          <BackButton onClick={handleBack} text={t('common.back')} />
          <Button
            size="lg"
            disabled={!termsAccepted}
            onClick={handleConfirm}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#B8552F';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {t('roomDetail.confirmBooking')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default RoomDetailPage;