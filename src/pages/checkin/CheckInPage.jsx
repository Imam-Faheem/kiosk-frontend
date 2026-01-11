import React, { useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Title,
  Stack,
  TextInput,
  Alert,
  Box,
  Loader,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useReservationDetails } from '../../hooks/useCheckInFlow';
import { checkinInitialValues } from '../../schemas/checkin.schema';
import { BUTTON_STYLES } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';

const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: checkinInitialValues,
    validate: {
      reservationId: (value) => (!value ? t('error.reservationIdRequired') : null),
      // lastName is optional for UI only
    },
  });

  // Get reservation details
  const getReservationDetails = useReservationDetails({
    onSuccess: (result) => {
      const reservationData = result?.data ?? result;
      const reservationId = reservationData?.id ?? reservationData?.bookingId ?? form.values.reservationId;
      
      // Check if payment is required
      const payableAmount = reservationData?.payableAmount?.guest?.amount ?? 0;
      
      if (payableAmount > 0) {
        // Navigate to payment page
        navigate('/checkin/payment', {
          state: {
            reservation: reservationData,
            reservationId,
            payableAmount,
            currency: reservationData?.payableAmount?.guest?.currency ?? 'EUR',
          },
        });
      } else {
        // No payment required, proceed directly to check-in
        navigate('/checkin/process', {
          state: {
            reservation: reservationData,
            reservationId,
          },
        });
      }
    },
    onError: (err) => {
      const errorStatus = err?.response?.status;
      const errorMessage = err?.message ?? t('error.reservationNotFound');
      
      const isLastNameError = errorStatus === 403 || 
                             errorMessage.toLowerCase().includes('lastname') ||
                             errorMessage.toLowerCase().includes('last name');
      
      form.setFieldError(
        isLastNameError ? 'lastName' : 'reservationId',
        isLastNameError ? t('error.lastNameMismatch') : errorMessage
      );
      setError(errorMessage);
      setIsLoading(false);
    },
  });

  const getFormValue = (values, ...keys) => {
    return keys.map(key => values[key]).find(val => val != null);
  };


  const hasValidGuestData = (data) => {
    if (!data) return false;
    
    // Check for primaryGuest format
    const primaryGuest = data?.primaryGuest;
    if (primaryGuest) {
      const firstName = primaryGuest.firstName ?? '';
      const lastName = primaryGuest.lastName ?? '';
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    
    // Check for folios format with debitor
    const folios = data?.folios;
    if (Array.isArray(folios) && folios.length > 0) {
      const mainFolio = folios.find(f => f.isMainFolio) ?? folios[0];
      const debitor = mainFolio?.debitor;
      if (debitor) {
        const firstName = debitor.firstName ?? '';
        const lastName = debitor.name ?? '';
        return firstName.trim().length > 0 && lastName.trim().length > 0;
      }
    }
    
    // Legacy format: guest_name
    const guestName = data?.guest_name;
    if (guestName) {
      const firstName = guestName.first_name ?? guestName.firstName ?? '';
      const lastName = guestName.last_name ?? guestName.lastName ?? '';
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    
    return false;
  };

  const extractLastNameFromResponse = (data) => {
    if (!data) return null;
    
    const primaryGuest = data?.primaryGuest;
    if (primaryGuest?.lastName) {
      return primaryGuest.lastName.trim().toLowerCase();
    }
    
    const folios = data?.folios;
    if (Array.isArray(folios) && folios.length > 0) {
      const mainFolio = folios.find(f => f.isMainFolio) ?? folios[0];
      const debitor = mainFolio?.debitor;
      if (debitor?.name) {
        return debitor.name.trim().toLowerCase();
      }
    }
    
    const guestName = data?.guest_name;
    if (guestName) {
      const lastName = guestName.last_name ?? guestName.lastName;
      if (lastName) {
        return lastName.trim().toLowerCase();
      }
    }
    
    return null;
  };

  const validateLastNameMatch = (submittedLastName, apiData) => {
    const submittedLastNameLower = submittedLastName?.trim().toLowerCase();
    if (!submittedLastNameLower) {
      return false;
    }

    const responseLastName = extractLastNameFromResponse(apiData);
    if (!responseLastName) {
      return false;
    }

    return submittedLastNameLower === responseLastName;
  };

  const extractReservationIdFromResponse = (data) => {
    if (!data) return null;
    
    const sources = [
      data?.bookingId,
      data?.reservation_id,
      data?.id,
      data?.reservation?.id,
      data?.reservation?.bookingId,
      data?.folios?.[0]?.bookingId,
      data?.folios?.[0]?.reservation?.bookingId,
      data?.reservations?.[0]?.id,
    ];
    return sources.find(id => id != null);
  };

  const validateReservationIdMatch = (submittedReservationId, apiData) => {
    const submittedId = submittedReservationId?.trim().toUpperCase();
    if (!submittedId) {
      return false;
    }

    const responseId = extractReservationIdFromResponse(apiData);
    if (!responseId) {
      return false;
    }

    return submittedId === responseId.toString().toUpperCase();
  };

  const handleSubmit = async (values) => {
    setError(null);
    form.clearErrors();
    setIsLoading(true);

    const reservationId = getFormValue(values, 'reservationId', 'reservation_id');
    const lastName = getFormValue(values, 'lastName', 'last_name'); // Optional for UI only

    if (!reservationId) {
      form.setFieldError('reservationId', t('error.reservationIdRequired'));
      setIsLoading(false);
      return;
    }

    // GET reservation details
    // GET /api/kiosk/v1/organizations/:organization_id/properties/:property_id/reservations/:reservation_id/details
    getReservationDetails.mutate({
      reservationId,
      lastName, // Optional, for UI validation only
    });
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <Container
      size="lg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      p={20}
      bg="#FFFFFF"
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        w="100%"
        maw={600}
        bg="#ffffff"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        {/* Context Title */}
        <Title 
          order={3}
          fz={26}
          fw={800}
          c="#222"
          mb={16}
          lts={0.5}
        >
          {t('checkIn.title')}
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('error.title')}
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('checkIn.reservationId')}
              placeholder={t('checkIn.enterReservationNumber')}
              required
              size="lg"
              {...form.getInputProps('reservationId')}
              styles={{
                input: {
                  borderRadius: '12px',
                  border: '2px solid #E0E0E0',
                  outline: 'none',
                  transition: 'box-shadow 150ms ease, border-color 150ms ease',
                },
                inputFocused: {
                  borderColor: '#C8653D',
                  boxShadow: '0 0 0 3px rgba(200, 101, 61, 0.15)'
                }
              }}
            />

            <TextInput
              label={t('checkIn.lastName')}
              placeholder={t('checkIn.enterLastName')}
              size="lg"
              {...form.getInputProps('lastName')}
              styles={{
                input: {
                  borderRadius: '12px',
                  border: '2px solid #E0E0E0',
                  outline: 'none',
                  transition: 'box-shadow 150ms ease, border-color 150ms ease',
                },
                inputFocused: {
                  borderColor: '#C8653D',
                  boxShadow: '0 0 0 3px rgba(200, 101, 61, 0.15)'
                }
              }}
            />
          </Stack>

          <Group justify="space-between">
            <BackButton onClick={handleBack} text={t('checkIn.back')} />

            <Button
              type="submit"
              size="lg"
              leftSection={<IconCheck size={20} />}
              disabled={isLoading}
              styles={BUTTON_STYLES.primarySmall}
              radius="md"
            >
              {t('checkIn.submit')}
            </Button>
          </Group>
        </form>

        {/* Loader */}
        {(isLoading || getReservationDetails.isPending) && (
          <Stack align="center" gap="md" mt="xl">
            <Loader size="lg" color="#C8653D" />
            <Text size="lg" c="#666666">
              {t('checkIn.loading')}
            </Text>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default CheckInPage;
