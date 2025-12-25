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
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

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
      setSearchResults(result?.data || null);
      setErrorMessage(null);
    },
    onError: (err) => {
      const details = err?.response?.data;
      const msg = (details && (details.message || details.error)) || err?.message || 'Request failed';
      setErrorMessage(msg);
    }
  });

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

    const searchData = {
      ...values,
      checkIn: values.checkIn ? (values.checkIn instanceof Date ? values.checkIn.toISOString().split('T')[0] : values.checkIn) : null,
      checkOut: values.checkOut ? (values.checkOut instanceof Date ? values.checkOut.toISOString().split('T')[0] : values.checkOut) : null,
      guests: values.guests ? Number(values.guests) : null,
    };

    try {
      await searchAvailability.mutateAsync(searchData);
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
    label: `${i + 1} ${i === 0 ? 'Guest' : 'Guests'}`,
  }));

  return (
    <Container
      size="lg"
      h="100vh"
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
      }}
      bg="white"
      p="20px"
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        w="100%"
        maw={1000}
        bg="white"
        styles={{
          root: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
            overflow: 'visible',
          },
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Group>
            <Box
              component="img"
              src={UnoLogo}
              alt="UNO Hotel Logo"
              w={50}
              h={50}
              style={{ borderRadius: '8px', marginRight: '0px', objectFit: 'cover' }}
            />
            <Title 
              order={2}
              fz={30}
              c="rgb(34, 34, 34)"
              fw={600}
              lts={1}
              ml="-9px"
            >
              UNO HOTELS
            </Title>
          </Group>
        </Group>

        {/* Search Form */}
        <form onSubmit={form.onSubmit(handleSearch)}>
          <Stack gap="lg" mb="xl">
            <Grid>
              <Grid.Col span={4}>
                <DateInput
                  label={t('searchRooms.checkIn')}
                  placeholder="Select check-in date"
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
                  placeholder="Select check-out date"
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
              loading={loading}
              styles={BUTTON_STYLES.primary}
              radius="md"
            >
              {t('searchRooms.search')}
            </Button>
          </Stack>
        </form>

        {/* Search Results */}
        {loading && (
          <Stack align="center" gap="md">
            <Loader size="lg" color="#C8653D" />
            <Text size="lg" c="#666666">
              Searching available rooms
            </Text>
          </Stack>
        )}

        {/* Error message from backend */}
        {errorMessage && !loading && (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        )}

        {/* No rooms available message */}
        {searchResults && Array.isArray(searchResults.availableRooms) && searchResults.availableRooms.length === 0 && !loading && (
          <Alert color="yellow" variant="light">
            {t('searchRooms.noRooms')}
          </Alert>
        )}

        {searchResults && Array.isArray(searchResults.availableRooms) && searchResults.availableRooms.length > 0 && (
          <Stack gap="lg" mb="xl">
            <Text size="xl" fw={600} c="#0B152A">
              Available Rooms ({typeof searchResults.totalAvailable === 'number' ? searchResults.totalAvailable : (Array.isArray(searchResults.availableRooms) ? searchResults.availableRooms.length : 0)})
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
                            Available
                          </Badge>
                        </Group>
                        
                        <Text size="sm" c="#666666">
                          {room.description}
                        </Text>
                        
                        <Group gap="xs">
                          <IconUsers size={16} color="#666666" />
                          <Text size="sm" c="#666666">
                            {room.capacity} guests
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
                              {room.currency} {room.pricePerNight} per night
                            </Text>
                            <Text size="xl" fw={700} c="#0B152A">
                              {room.currency} {room.totalPrice} total
                            </Text>
                          </Stack>
                          
                          <Button
                            size="md"
                            bg="#C8653D"
                            c="white"
                            radius="md"
                          >
                            Select
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
        <Group justify="flex-start">
          <BackButton onClick={handleBack} text={t('searchRooms.back')} />
        </Group>
      </Paper>
    </Container>
  );
};

export default SearchRoomsPage;
