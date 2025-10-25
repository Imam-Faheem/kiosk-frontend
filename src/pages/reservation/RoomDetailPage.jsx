import React, { useState } from 'react';
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

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { room, searchCriteria, guestDetails } = location.state || {};

  // Amenity icons mapping
  const amenityIcons = {
    'WiFi': <IconWifi size={16} />,
    'Air Conditioning': <IconSnowflake size={16} />,
    'TV': <IconDeviceTv size={16} />,
    'Safe': <IconShield size={16} />,
    'Mini Bar': <IconCoffee size={16} />,
  };

  const handleConfirm = () => {
    navigate('/reservation/payment', {
      state: {
        room,
        searchCriteria,
        guestDetails,
      },
    });
  };

  const handleBack = () => {
    navigate('/reservation/guest-details', {
      state: { room, searchCriteria },
    });
  };

  // Handle missing data without immediate redirect
  if (!room || !guestDetails) {
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
        <Group justify="space-between" mb="xl">
          <Group>
            <img
              src={UnoLogo}
              alt="UNO Hotel Logo"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                marginRight: '15px',
                objectFit: 'cover',
              }}
            />
            <Title 
              order={2} 
              style={{ 
                fontSize: '24px',
                color: 'rgb(34, 34, 34)',
                fontWeight: '600',
                letterSpacing: '1px'
              }}
            >
              UNO HOTELS
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl">
          {/* Room Images Gallery */}
          <Card withBorder p="lg" radius="md">
            <Stack gap="md">
              <Text size="xl" fw={600}>{room.name}</Text>
              
              {/* Main Image */}
              <Box style={{ position: 'relative' }}>
                <Image
                  src={room.images[selectedImageIndex]}
                  alt={`${room.name} - Image ${selectedImageIndex + 1}`}
                  height={300}
                  radius="md"
                  style={{ objectFit: 'cover', width: '100%' }}
                />
                <Badge
                  size="sm"
                  color="orange"
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {selectedImageIndex + 1} / {room.images.length}
                </Badge>
              </Box>

              {/* Thumbnail Images */}
              <SimpleGrid cols={3} spacing="sm">
                {room.images.map((image, index) => (
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
                      src={image}
                      alt={`${room.name} - Thumbnail ${index + 1}`}
                      height={80}
                      style={{ objectFit: 'cover', width: '100%' }}
                    />
                  </Box>
                ))}
              </SimpleGrid>

              {/* Room Description */}
              <Text size="md" c="#666666">{room.description}</Text>

              {/* Room Amenities */}
              <Stack gap="sm">
                <Text size="md" fw={600}>Amenities:</Text>
                <Group gap="sm">
                  {room.amenities.map((amenity, index) => (
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
                  <Text size="md" fw={600}>{room.capacity} guests</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="#666666">Max Guests:</Text>
                  <Text size="md" fw={600}>{room.maxGuests} guests</Text>
                </Grid.Col>
              </Grid>

              {/* Pricing */}
              <Card withBorder p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
                <Group justify="space-between">
                  <Text size="lg" fw={600}>Total Price:</Text>
                  <Text size="xl" fw={700} c="#C8653D">
                    ${room.totalPrice} {room.currency}
                  </Text>
                </Group>
              </Card>
            </Stack>
          </Card>

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