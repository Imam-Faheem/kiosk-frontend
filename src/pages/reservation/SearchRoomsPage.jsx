import React, { useState } from 'react';
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
import useLanguage from '../../hooks/useLanguage';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const SearchRoomsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
    
    // Convert Date objects to ISO string format for API and coerce guests to number
    const searchData = {
      ...values,
      checkIn: values.checkIn ? (values.checkIn instanceof Date ? values.checkIn.toISOString().split('T')[0] : values.checkIn) : null,
      checkOut: values.checkOut ? (values.checkOut instanceof Date ? values.checkOut.toISOString().split('T')[0] : values.checkOut) : null,
      guests: values.guests ? Number(values.guests) : null,
    };
    await searchAvailability.mutateAsync(searchData);
    setLoading(false);
  };

  const handleSelectRoom = (room) => {
    // Convert Date objects to ISO string format for navigation state
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
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
      }}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: '100%',
          maxWidth: '1000px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        {/* Header */}
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
                  popoverProps={{ 
                    withinPortal: true, 
                    position: 'bottom-start', 
                    shadow: 'md', 
                    zIndex: 1000,
                  }}
                  styles={{
                    input: {
                      borderRadius: '12px',
                      border: '2px solid #E0E0E0',
                      '&:focus': {
                        borderColor: '#C8653D',
                      }
                    }
                  }}
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
                  popoverProps={{ 
                    withinPortal: true, 
                    position: 'bottom-start', 
                    shadow: 'md', 
                    zIndex: 1000,
                  }}
                  styles={{
                    input: {
                      borderRadius: '12px',
                      border: '2px solid #E0E0E0',
                      '&:focus': {
                        borderColor: '#C8653D',
                      }
                    }
                  }}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label={t('searchRooms.guests')}
                  data={guestOptions}
                  required
                  size="lg"
                  {...form.getInputProps('guests')}
                  styles={{
                    input: {
                      borderRadius: '12px',
                      border: '2px solid #E0E0E0',
                      '&:focus': {
                        borderColor: '#C8653D',
                      }
                    }
                  }}
                />
              </Grid.Col>
            </Grid>

            <Button
              type="submit"
              size="lg"
              leftSection={<IconSearch size={20} />}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#E0E0E0' : '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#B8552F';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#C8653D';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
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
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      }
                    }}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <Stack gap="md">
                      <Image
                        src={(room.images && room.images[0]) || UnoLogo}
                        alt={room.name}
                        height={200}
                        radius="md"
                        style={{ objectFit: 'cover' }}
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
                            style={{
                              backgroundColor: '#C8653D',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                            }}
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
