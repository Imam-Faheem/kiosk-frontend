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
  Grid,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { IconWifi, IconSnowflake, IconShield, IconCoffee, IconDeviceTv } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';
import { getRoomDetails } from '../../services/roomService';

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { room, searchCriteria, guestDetails } = location.state || {};

  // Fetch room details with images if room images are missing
  useEffect(() => {
    const fetchRoomImages = async () => {
      if (room && room.roomTypeId) {
        // Check if room has images
        const hasImages = room.images && Array.isArray(room.images) && room.images.length > 0;
        
        if (!hasImages) {
          setLoading(true);
          try {
            const propertyId = process.env.REACT_APP_PROPERTY_ID || 'BER';
            const result = await getRoomDetails(room.roomTypeId, propertyId);
            
            if (result.success && result.data && result.data.images) {
              // Merge room data with fetched images
              setRoomData({
                ...room,
                images: result.data.images.length > 0 ? result.data.images : [UnoLogo],
              });
            } else {
              // Use default logo if no images found
              setRoomData({
                ...room,
                images: [UnoLogo],
              });
            }
          } catch (err) {
            // Use default logo on error
            setRoomData({
              ...room,
              images: [UnoLogo],
            });
          } finally {
            setLoading(false);
          }
        } else {
          // Room already has images, use it as is
          setRoomData(room);
        }
      } else if (room) {
        // Room exists but no roomTypeId, use it with default image
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

  // Use roomData if available, otherwise fallback to room
  const displayRoom = roomData || room;
  
  // Ensure images array exists
  const roomImages = displayRoom?.images && Array.isArray(displayRoom.images) && displayRoom.images.length > 0
    ? displayRoom.images
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

  // Amenity icons mapping
  const amenityIcons = {
    'WiFi': <IconWifi size={16} />,
    'Air Conditioning': <IconSnowflake size={16} />,
    'TV': <IconDeviceTv size={16} />,
    'Safe': <IconShield size={16} />,
    'Mini Bar': <IconCoffee size={16} />,
  };

  const handleConfirm = () => {
    navigate('/reservation/signature', {
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
            {t('roomDetail.errorMissingData') || 'Missing room or guest details. Please go back and try again.'}
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
          <Group>
            <img
              src={UnoLogo}
              alt="UNO Hotel Logo"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                marginRight: '0px',
                objectFit: 'cover',
              }}
            />
            <Title 
              order={2} 
              style={{ 
                fontSize: '30px !important',
                color: 'rgb(34, 34, 34)',
                fontWeight: '600',
                letterSpacing: '1px',
                marginLeft: '-9px'
              }}
            >
              UNO HOTELS
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl">
          {/* Room Images Gallery */}
          <Stack gap="md">
            <Text size="xl" fw={600}>{displayRoom.name}</Text>
              
              {/* Main Image */}
              {loading ? (
                <Box style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <Text c="#666666">Loading images...</Text>
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
              {!loading && roomImages.length > 1 && (
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

              {/* Room Description */}
              <Text size="md" c="#666666">{displayRoom.description}</Text>

              {/* Room Amenities */}
              <Stack gap="sm">
                <Text size="md" fw={600}>Amenities:</Text>
                <Group gap="sm">
                  {(displayRoom.amenities || []).map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="light"
                      color="blue"
                      leftSection={amenityIcons[amenity] || null}
                      size="sm"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              {/* Room Details */}
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="#666666">Capacity:</Text>
                  <Text size="md" fw={600}>{displayRoom.capacity || displayRoom.maxGuests || 1} guests</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="#666666">Max Guests:</Text>
                  <Text size="md" fw={600}>{displayRoom.maxGuests || displayRoom.capacity || 1} guests</Text>
                </Grid.Col>
              </Grid>

              {/* Booking Summary Card */}
              <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', border: '2px solid #C8653D' }}>
                <Stack gap="md">
                  <Text size="lg" fw={600} c="#C8653D">{t('roomDetail.bookingSummary')}</Text>
                  
                  {/* Guest Name */}
                  <Group justify="space-between">
                    <Text size="md" c="#666666">Guest Name:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{guestDetails.firstName} {guestDetails.lastName}</Text>
                  </Group>
                  
                  {/* Dates */}
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.checkInDate') || 'Check-In Date'}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{formatDate(searchCriteria.checkIn)}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('roomDetail.checkOutDate') || 'Check-Out Date'}:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{formatDate(searchCriteria.checkOut)}</Text>
                  </Group>
                  
                  {/* Number of Nights */}
                  <Group justify="space-between">
                    <Text size="md" c="#666666">Number of Nights:</Text>
                    <Text size="md" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>
                      {Math.ceil((new Date(searchCriteria.checkOut) - new Date(searchCriteria.checkIn)) / (1000 * 60 * 60 * 24))} {t('roomDetail.nights')}
                    </Text>
                  </Group>
                  
                  {/* Financial Summary */}
                  <Box style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="#666666">{t('roomDetail.pricePerNight')}:</Text>
                        <Text size="sm" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{displayRoom.currency || 'EUR'} {displayRoom.pricePerNight || 0}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="#666666">{t('roomDetail.taxes')}:</Text>
                        <Text size="sm" fw={600} style={{ textAlign: 'right', minWidth: '180px' }}>{displayRoom.currency || 'EUR'} {displayRoom.taxes || 0}</Text>
                      </Group>
                      <Group justify="space-between" style={{ borderTop: '2px solid #C8653D', paddingTop: '10px' }}>
                        <Text size="lg" fw={700} c="#C8653D">{t('roomDetail.total')}:</Text>
                        <Text size="xl" fw={700} c="#C8653D" style={{ textAlign: 'right', minWidth: '180px' }}>
                          {displayRoom.currency || 'EUR'} {displayRoom.totalPrice || 0}
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
          <Group gap="md">
            <Button
              size="lg"
              variant="outline"
              onClick={handleBack}
              style={{
                borderColor: '#C8653D',
                color: '#C8653D',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
            >
              {t('roomDetail.editDetails')}
            </Button>
            <Button
              size="lg"
              variant="subtle"
              color="dark"
              onClick={() => navigate('/reservation/search')}
              style={{
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {t('roomDetail.cancel')}
            </Button>
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
        </Group>
      </Paper>
    </Container>
  );
};

export default RoomDetailPage;