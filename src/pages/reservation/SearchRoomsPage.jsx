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
import { EARLY_ARRIVAL_CONFIG, BUTTON_STYLES, FORM_INPUT_STYLES, API_CONFIG } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import usePropertyStore from '../../stores/propertyStore';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';
import { createApiError, createNetworkError, handleCredentialError } from '../../utils/errorHandlers';

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

  const { selectedProperty } = usePropertyStore();
  
  const searchOffers = useRoomMutation('searchOffers', {
    onSuccess: (result) => {
      const success = result?.success ?? false;
      setSearchResults(success ? result : null);
      setErrorMessage(success ? null : t('error.requestFailed'));
    },
    onError: (err) => {
      const apiError = err?.response ? createApiError(err) : createNetworkError(err);
      const credentialResponse = handleCredentialError(apiError);
      
      const handleError = credentialResponse
        ? () => {
            setSearchResults(credentialResponse);
            setErrorMessage(null);
          }
        : () => setErrorMessage(apiError.message);
      
      handleError();
    }
  });

  const isSearching = loading || searchOffers.isPending;

  const formatDate = (date) => date instanceof Date ? date.toISOString().split('T')[0] : date;

  const form = useForm({
    initialValues: {
      ...roomSearchInitialValues,
      guests: roomSearchInitialValues.guests ?? '1',
    },
    validate: (values) => {
      try {
        roomSearchValidationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err) {
        return err.inner.reduce((acc, error) => ({ ...acc, [error.path]: error.message }), {});
      }
    },
  });

  const validateDates = (checkInDate, checkOutDate) => {
    if (!checkInDate ? true : !checkOutDate ? true : false) return t('error.invalidDates');
    
    const arrivalDate = new Date(checkInDate);
    const departureDate = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (arrivalDate < today) return 'Arrival date must be today or in the future';
    if (departureDate <= arrivalDate) return 'Departure date must be after arrival date';
    return null;
  };

  const handleSearch = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    setSearchResults(null);

    const checkInDate = values.checkIn ? formatDate(values.checkIn) : null;
    const checkOutDate = values.checkOut ? formatDate(values.checkOut) : null;
    const adults = Number(values.guests) ?? 1;

    const dateError = validateDates(checkInDate, checkOutDate);
    if (dateError) {
      setErrorMessage(dateError);
      setLoading(false);
      return;
    }

    const propertyId = selectedProperty?.property_id ?? usePropertyStore.getState().propertyId ?? '37KSbwUJKAvulzjtuQ0inmQMJhr';
    const organizationId = API_CONFIG.ORGANIZATION_ID;
    const apaleoPropertyId = selectedProperty?.apaleo_external_property_id ?? 'STERN';

    if (!propertyId ? true : !organizationId ? true : !apaleoPropertyId ? true : false) {
      setErrorMessage('Missing property configuration. Please select a property first.');
      setLoading(false);
      return;
    }

    try {
      await searchOffers.mutateAsync({
        organizationId,
        propertyId,
        searchParams: { apaleoPropertyId, arrival: checkInDate, departure: checkOutDate, adults, children: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    const selectedProperty = usePropertyStore.getState().selectedProperty;
    const apaleoPropertyId = selectedProperty?.apaleo_external_property_id ?? 'STERN';
    
    navigate('/reservation/guest-details', {
      state: {
        room,
        searchCriteria: {
          ...form.values,
          checkIn: form.values.checkIn ? formatDate(form.values.checkIn) : null,
          checkOut: form.values.checkOut ? formatDate(form.values.checkOut) : null,
        },
        apaleoPropertyId,
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '20px',
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
          },
        }}
      >
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        {/* Search Form */}
        <form onSubmit={form.onSubmit(handleSearch)}>
          <Stack gap="lg" mb="xl">
            <Grid>
              <Grid.Col span={4}>
                <DateInput
                  label={t('searchRooms.checkIn')}
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
              disabled={searchResults ? true : isSearching ? true : false}
              styles={BUTTON_STYLES.primary}
              radius="md"
            >
              {t('searchRooms.search')}
            </Button>
          </Stack>
        </form>

        {/* Search Results Loader */}
        {isSearching && (
          <Stack align="center" gap="md">
            <Loader size="lg" color="#C8653D" />
            <Text size="lg" c="#666666">
              {t('searchRooms.loading')}
            </Text>
          </Stack>
        )}

        {/* Error message from backend */}
        {errorMessage && !isSearching && (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        )}

        {/* No offers available message */}
        {searchResults && Array.isArray(searchResults.offers) && searchResults.offers.length === 0 && !isSearching && (
          <Alert color="yellow" variant="light">
            {t('searchRooms.noRooms')}
          </Alert>
        )}

        {searchResults && Array.isArray(searchResults.offers) && searchResults.offers.length > 0 && (
          <Stack gap="lg" mb="xl">
            <Text size="xl" fw={600} c="#0B152A">
              {t('searchRooms.availableRooms')} ({searchResults.offers.length})
            </Text>
            
            <Grid>
              {searchResults.offers.map((offer, index) => {
                const unitGroup = offer.unitGroup ?? {};
                const ratePlan = offer.ratePlan ?? {};
                const totalAmount = offer.totalGrossAmount ?? {};
                const availableUnits = offer.availableUnits ?? 0;
                
                return (
                  <Grid.Col span={6} key={`${unitGroup.id}-${ratePlan.id}-${index}`}>
                    <Card
                      withBorder
                      p="lg"
                      radius="md"
                      style={{ cursor: 'pointer' }}
                      styles={{
                        root: {
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' },
                        },
                      }}
                      onClick={() => handleSelectRoom(offer)}
                    >
                      <Stack gap="md">
                        <Image src={UnoLogo} alt={unitGroup.name} h={200} radius="md" fit="cover" />
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text size="lg" fw={600} c="#0B152A">{unitGroup.name}</Text>
                            <Badge color="green" size="lg">{t('searchRooms.available')}</Badge>
                          </Group>
                          <Text size="sm" c="#666666">{unitGroup.description ?? ratePlan.description}</Text>
                          <Group gap="xs">
                            <IconUsers size={16} color="#666666" />
                            <Text size="sm" c="#666666">{unitGroup.maxPersons ?? 2} {t('common.guests')}</Text>
                          </Group>
                          <Group gap="xs" wrap="wrap">
                            <Badge size="sm" variant="light">{ratePlan.name}</Badge>
                            {availableUnits > 0 && (
                              <Badge size="sm" variant="light" color="blue">
                                {availableUnits} {availableUnits === 1 ? 'unit' : 'units'}
                              </Badge>
                            )}
                          </Group>
                          <Group justify="space-between" align="center">
                            <Stack gap="xs">
                              <Text size="sm" c="#666666">{ratePlan.name}</Text>
                              <Text size="xl" fw={700} c="#0B152A">
                                {totalAmount.currency ?? 'EUR'} {totalAmount.amount ?? 0} {t('searchRooms.total')}
                              </Text>
                            </Stack>
                            <Button size="md" bg="#C8653D" c="white" radius="md">{t('common.select')}</Button>
                          </Group>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
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
