import React, { useState, useEffect } from 'react';
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
import { EARLY_ARRIVAL_CONFIG, BUTTON_STYLES } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';

const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const targetTime = EARLY_ARRIVAL_CONFIG.TARGET_TIME;
    const now = new Date();
    const [time, period] = targetTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const target = new Date();
    target.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours, minutes, 0, 0);
    if (now < target) {
      navigate('/checkin/early-arrival');
    }
  }, [navigate]);
  
  const validateReservation = useReservationMutation('validate', {
    onError: (err) => {
      setError(err.message ?? t('error.reservationNotFound'));
    },
  });

  const form = useForm({
    initialValues: checkinInitialValues,
    validate: {
      reservationId: (value) => (!value ? t('error.reservationIdRequired') : null),
      lastName: (value) => (!value ? t('error.lastNameRequired') : null),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await validateReservation.mutateAsync({
        reservationId: values.reservationId ?? values.reservation_id,
        lastName: values.lastName ?? values.last_name,
      });

      if (result.success && result.data) {
        const reservationId = result.data.reservation_id ?? result.data.id;
        if (!reservationId) {
          setError(t('error.invalidReservationData'));
          return;
        }

        navigate('/checkin/payment-check', {
          state: { reservation: result.data },
        });
      } else {
        setError(t('error.reservationValidationFailed'));
      }
    } catch (error) {
      setError(error.message ?? t('error.reservationNotFound'));
    } finally {
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
