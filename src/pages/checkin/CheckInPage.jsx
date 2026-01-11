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

      // Next step: check if payment is required (or already completed)
      navigate('/checkin/payment-check', {
        state: {
          reservation: reservationData,
          reservationId,
          checkInData: reservationData,
          folios: reservationData?.folios,
        },
      });

      setIsLoading(false);
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

  const handleSubmit = async (values) => {
    setError(null);
    form.clearErrors();
    setIsLoading(true);

    const reservationId = values.reservationId?.trim();
    const lastName = values.lastName?.trim() || null; // Optional for UI only

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
