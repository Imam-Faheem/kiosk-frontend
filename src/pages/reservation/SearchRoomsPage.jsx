import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Select,
  Grid,
  Card,
  Image,
  Badge,
  Alert,
  Loader,
  Box,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useRoomMutation } from '../../hooks/useRoomMutation';
import { roomSearchValidationSchema, roomSearchInitialValues } from '../../schemas/reservation.schema';
import { EARLY_ARRIVAL_CONFIG, BUTTON_STYLES, FORM_INPUT_STYLES } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import usePropertyStore from '../../stores/propertyStore';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';

const SearchRoomsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const targetTime = EARLY_ARRIVAL_CONFIG.TARGET_TIME;
    const now = new Date();
    const [time, period] = targetTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date();
    target.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours, minutes, 0, 0);
    if (now < target) {
      navigate('/reservation/early-arrival');
    }
  }, [navigate]);

  const searchAvailability = useRoomMutation('searchAvailability', {
    onSuccess: (result) => {
      // The service returns the transformed data directly
      setSearchResults(result || null);
      setErrorMessage(null);
    },
    onError: (err) => {
      const details = err?.response?.data;
      const msg = (details && (details.message || details.error)) || err?.message || t('error.requestFailed');
      setErrorMessage(msg);
    }
  });

  const isSearching = loading || searchAvailability.isPending;

  const form = useForm({
    initialValues: roomSearchInitialValues,
    validate: (values) => {
      try {
        roomSearchValidationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err) {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        return errors;
      }
    },
  });

  const handleSearch = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    setSearchResults(null);

    // Check if property is configured
    const propertyId = usePropertyStore.getState().propertyId;
    if (!propertyId) {
      setErrorMessage(t('error.propertyNotSelected') || 'Please select a property first. Go to property selection page.');
      setLoading(false);
      return;
    }

    const checkInDate = values.checkIn ? (values.checkIn instanceof Date ? values.checkIn.toISOString().split('T')[0] : values.checkIn) : null;
    const checkOutDate = values.checkOut ? (values.checkOut instanceof Date ? values.checkOut.toISOString().split('T')[0] : values.checkOut) : null;
    const adults = values.guests ? Number(values.guests) : 1;

    const searchData = {
      propertyId: propertyId,
      arrival: checkInDate,
      departure: checkOutDate,
      adults: adults || 1,
    };

    try {
      await searchAvailability.mutateAsync(searchData);
    } catch (err) {
      // Error is already handled by onError callback, but ensure loading is stopped
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    const searchCriteria = {
      ...form.values,
      checkIn: form.values.checkIn ? (form.values.checkIn instanceof Date ? form.values.checkIn.toISOString().split('T')[0] : form.values.checkIn) : null,
      checkOut: form.values.checkOut ? (form.values.checkOut instanceof Date ? form.values.checkOut.toISOString().split('T')[0] : form.values.checkOut) : null,
    };

    navigate('/reservation/guest-details', {
      state: {
        room,
        searchCriteria,
      },
    });
  };

  const handleBack = () => {
    navigate('/home');
  };

  const guestOptions = Array.from({ length: 8 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1} ${i === 0 ? t('common.guest') : t('common.guests')}`,
  }));

  return (
    <Container
      size="lg"
      style={{ 
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '20px',
        overflow: 'hidden',
      }}
      bg="white"
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        w="100%"
        maw={1000}
        h="100%"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        bg="white"
        styles={{
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
          },
        }}
      >
        <Box style={{ flexShrink: 0 }}>
          <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>
        </Box>

        <Box style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Search Form */}
          <form onSubmit={form.onSubmit(handleSearch)}>
            <Stack gap="lg" mb="xl">
            <Grid>
              <Grid.Col span={4}>
                <DateInput
                  label={t('searchRooms.checkIn')}
                  placeholder={t('searchRooms.selectCheckInDate')}
                  required
                  size="lg"
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps('checkIn')}
                  minDate={new Date()}
                  popoverProps={{ withinPortal: true, position: 'bottom-start', shadow: 'md', zIndex: 300 }}
                  styles={FORM_INPUT_STYLES.dateInput}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <DateInput
                  label={t('searchRooms.checkOut')}
                  placeholder={t('searchRooms.selectCheckOutDate')}
                  required
                  size="lg"
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps('checkOut')}
                  minDate={form.values.checkIn ? new Date(form.values.checkIn) : new Date()}
                  popoverProps={{ withinPortal: true, position: 'bottom-start', shadow: 'md', zIndex: 300 }}
                  styles={FORM_INPUT_STYLES.dateInput}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label={t('searchRooms.guests')}
                  placeholder={t('searchRooms.selectGuests') || 'Select number of guests'}
                  data={guestOptions}
                  required
                  size="lg"
                  {...form.getInputProps('guests')}
                  styles={FORM_INPUT_STYLES.select}
                />
              </Grid.Col>
            </Grid>

            <Button
              type="submit"
              size="lg"
              leftSection={<IconSearch size={20} />}
              disabled={!!searchResults || isSearching}
              styles={BUTTON_STYLES.primary}
              radius="md"
            >
              {t('searchRooms.search')}
            </Button>
            </Stack>
          </form>

          {/* Search Results Loader */}
          {isSearching && (
            <Stack align="center" gap="md" mb="xl">
              <Loader size="lg" color="#C8653D" />
              <Text size="lg" c="#666666">
                {t('searchRooms.loading')}
              </Text>
            </Stack>
          )}

          {/* Error message from backend */}
          {errorMessage && !isSearching && (
            <Alert color="red" variant="light" mb="xl">
              {errorMessage}
            </Alert>
          )}

          {/* No rooms available message */}
          {searchResults && Array.isArray(searchResults.availableRooms) && searchResults.availableRooms.length === 0 && !isSearching && (
            <Alert color="yellow" variant="light" mb="xl">
              {t('searchRooms.noRooms')}
            </Alert>
          )}

          {searchResults && Array.isArray(searchResults.availableRooms) && searchResults.availableRooms.length > 0 && (
            <Stack gap="lg" mb="xl">
              <Text size="xl" fw={600} c="#0B152A">
                {t('searchRooms.availableRooms')} ({typeof searchResults.totalAvailable === 'number' ? searchResults.totalAvailable : (Array.isArray(searchResults.availableRooms) ? searchResults.availableRooms.length : 0)})
              </Text>
              
              <Grid>
                {searchResults.availableRooms.map((room) => (
                  <Grid.Col span={6} key={room.roomTypeId}>
                    <Card
                      withBorder
                      p="lg"
                      radius="md"
                      style={{ cursor: 'pointer' }}
                      styles={{
                        root: {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          },
                        },
                      }}
                      onClick={() => handleSelectRoom(room)}
                    >
                      <Stack gap="md">
                        <Image
                          src={(room.images && room.images[0]) || UnoLogo}
                          alt={room.name}
                          h={200}
                          radius="md"
                          fit="cover"
                        />
                        
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text size="lg" fw={600} c="#0B152A">
                              {room.name}
                            </Text>
                            <Badge color="green" size="lg">
                              {t('searchRooms.available')}
                            </Badge>
                          </Group>
                          
                          <Text size="sm" c="#666666">
                            {room.description}
                          </Text>
                          
                          <Group gap="xs">
                            <IconUsers size={16} color="#666666" />
                            <Text size="sm" c="#666666">
                              {room.capacity} {t('common.guests')}
                            </Text>
                          </Group>
                          
                          <Group gap="xs" wrap="wrap">
                            {room.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} size="sm" variant="light">
                                {amenity}
                              </Badge>
                            ))}
                          </Group>
                          
                          <Group justify="space-between" align="center">
                            <Stack gap="xs">
                              <Text size="sm" c="#666666">
                                {room.currency} {room.pricePerNight} {t('searchRooms.perNight')}
                              </Text>
                              <Text size="xl" fw={700} c="#0B152A">
                                {room.currency} {room.totalPrice} {t('searchRooms.total')}
                              </Text>
                            </Stack>
                            
                            <Button
                              size="md"
                              bg="#C8653D"
                              c="white"
                              radius="md"
                            >
                              {t('common.select')}
                            </Button>
                          </Group>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          )}

          {/* Back Button */}
          <Group justify="flex-start" mb="md">
            <BackButton onClick={handleBack} text={t('searchRooms.back')} />
          </Group>
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchRoomsPage;
