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
import { useReservationMutation } from '../../hooks/useReservationMutation';
import { checkinInitialValues } from '../../schemas/checkin.schema';
import { BUTTON_STYLES } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import { performCheckIn } from '../../services/checkinService';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';

const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateReservation = useReservationMutation('validate');

  const form = useForm({
    initialValues: checkinInitialValues,
    validate: {
      reservationId: (value) => (!value ? t('error.reservationIdRequired') : null),
      lastName: (value) => (!value ? t('error.lastNameRequired') : null),
    },
  });

  const getFormValue = (values, ...keys) => {
    return keys.map(key => values[key]).find(val => val != null);
  };

  const extractReservationId = (result, formValues) => {
    const data = result?.data;
    const sources = [
      data?.bookingId,
      data?.reservation_id,
      data?.id,
      data?.reservation?.id,
      data?.reservation?.bookingId,
      data?.folios?.[0]?.bookingId,
      data?.folios?.[0]?.reservation?.bookingId,
      data?.reservations?.[0]?.id,
      formValues?.reservationId,
      formValues?.reservation_id,
    ];
    return sources.find(id => id != null);
  };

  const getCheckInData = async (reservationData, reservationId) => {
    const hasFolios = Array.isArray(reservationData.folios) && reservationData.folios.length > 0;
    return hasFolios ? reservationData : (await performCheckIn(reservationId)).data;
  };

  const navigateToPaymentCheck = (reservationData, checkInData) => {
    navigate('/checkin/payment-check', {
      state: {
        reservation: reservationData,
        checkInData: checkInData ?? reservationData,
        folios: checkInData?.folios ?? reservationData?.folios,
      },
    });
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

  const handleSubmit = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await validateReservation.mutateAsync({
        reservationId: getFormValue(values, 'reservationId', 'reservation_id'),
        lastName: getFormValue(values, 'lastName', 'last_name'),
      });

      const apiData = result.data;
      
      if (!apiData || !hasValidGuestData(apiData)) {
        throw new Error(t('error.reservationNotFound'));
      }

      const reservationId = extractReservationId(result, values);
      const checkInData = await getCheckInData(apiData, reservationId);

      if (!checkInData || !hasValidGuestData(checkInData)) {
        throw new Error(t('error.reservationNotFound'));
      }

      navigateToPaymentCheck(apiData, checkInData);
    } catch (error) {
      const errorMessage = error?.message ?? t('error.reservationNotFound');
      setError(errorMessage);
      setIsLoading(false);
    }
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

        {/* Form */}
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
              required
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

          {/* Action Buttons */}
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
        {isLoading && (
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
