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
  TextInput,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconLogin, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { useReservationMutation } from '../../hooks/useReservationMutation';
import { checkinValidationSchema, checkinInitialValues } from '../../schemas/checkin.schema';

const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { validateReservation } = useReservationMutation();
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: checkinInitialValues,
    validate: (values) => {
      try {
        checkinValidationSchema.validateSync(values, { abortEarly: false });
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

  const handleSubmit = async (values) => {
    setError(null);
    
    try {
      const result = await validateReservation.mutateAsync(values);
      
      if (result.success) {
        // Navigate to payment check page with reservation data
        navigate('/checkin/payment-check', {
          state: {
            reservation: result.data,
          },
        });
      } else {
        setError(t('error.reservationNotFound'));
      }
    } catch (err) {
      console.error('Reservation validation error:', err);
      setError(err.message || t('error.reservationNotFound'));
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
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Group>
            <Box
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#C8653D',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '15px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('checkIn.title')}
            </Title>
          </Group>
        </Group>

        {/* Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
                style={{ borderRadius: '8px' }}
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('checkIn.reservationId')}
              placeholder="Enter your reservation ID"
              required
              size="lg"
              {...form.getInputProps('reservationId')}
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
                  '&:focus': {
                    borderColor: '#C8653D',
                  }
                }
              }}
            />
          </Stack>

          {/* Action Buttons */}
          <Group justify="space-between">
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
              style={{
                borderColor: '#C8653D',
                color: '#C8653D',
                borderRadius: '12px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#C8653D';
              }}
            >
              {t('checkIn.back')}
            </Button>

            <Button
              type="submit"
              size="lg"
              leftSection={<IconLogin size={20} />}
              loading={validateReservation.isPending}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B8552F';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {validateReservation.isPending ? t('checkIn.loading') : t('checkIn.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default CheckInPage;
