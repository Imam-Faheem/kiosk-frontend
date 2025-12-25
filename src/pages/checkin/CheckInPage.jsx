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
} from '@mantine/core';
import { IconAlertCircle, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useReservationMutation } from '../../hooks/useReservationMutation';
import { checkinInitialValues } from '../../schemas/checkin.schema';
import { EARLY_ARRIVAL_CONFIG, BUTTON_STYLES } from '../../config/constants';
import useLanguage from '../../hooks/useLanguage';
import { mockData, shouldUseMock, simulateApiDelay } from '../../services/mockData';
import UnoLogo from '../../assets/uno.jpg';
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
      // Don't set error here if we'll use mock data
      if (!shouldUseMock(err)) {
        setError(err.message ?? t('error.reservationNotFound'));
      }
    },
  });

  const form = useForm({
    initialValues: checkinInitialValues,
    validate: {
      reservationId: (value) => (!value ? 'Reservation ID is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await validateReservation.mutateAsync(values);

      if (result.success && result.data) {
        const reservationId = result.data.reservation_id ?? result.data.id;
        if (!reservationId) {
          setError('Invalid reservation data. Please try again.');
          return;
        }

        navigate('/checkin/payment-check', {
          state: { reservation: result.data },
        });
      } else {
        setError('Reservation validation failed. Please check your credentials.');
      }
    } catch (error) {
      if (shouldUseMock(error)) {
        try {
          await simulateApiDelay(600);
          const mockResult = mockData.reservation(values);

          if (mockResult.success && mockResult.data) {
            const reservationId = mockResult.data.reservation_id ?? mockResult.data.id;
            if (reservationId) {
              navigate('/checkin/payment-check', {
                state: { reservation: mockResult.data },
              });
              return;
            }
          }
        } catch {
          setError('Failed to load reservation data. Please try again.');
          return;
        }
      }

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
        {/* Header */}
        <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
              fz={30}
              c="rgb(34, 34, 34)"
              fw={600}
              lts={1}
              ml={-9}
            >
              UNO HOTELS
            </Title>
          </Group>
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
          Find Your Reservation
        </Title>

        {/* Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('checkIn.reservationId')}
              placeholder="Enter your 10-digit reservation number"
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
              placeholder="Enter your last name"
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
              rightSection={<IconArrowRight size={20} />}
              loading={isLoading}
              disabled={isLoading}
              styles={BUTTON_STYLES.primary}
              radius="md"
            >
              {isLoading ? 'Validating...' : t('checkIn.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default CheckInPage;
