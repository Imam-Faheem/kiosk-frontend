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
import { IconLogin, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useReservationMutation } from '../../hooks/useReservationMutation';
import { checkinValidationSchema, checkinInitialValues } from '../../schemas/checkin.schema';
import useLanguage from '../../hooks/useLanguage';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const CheckInPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  
  const validateReservation = useReservationMutation('validate', {
    onSuccess: (result) => {
      if (result.success) {
        navigate('/checkin/payment-check', {
          state: { reservation: result.data },
        });
      }
    },
    onError: (err) => {
      setError(err.message || t('error.reservationNotFound'));
    },
  });

  const form = useForm({
    initialValues: {
      reservationId: 'RES-2024-789456',
      lastName: 'Johnson'
    },
    validate: {
      reservationId: (value) => (!value ? 'Reservation ID is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    
    try {
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock reservation data
      const mockReservation = {
        reservationId: values.reservationId,
        lastName: values.lastName,
        firstName: 'Michael',
        roomNumber: '312',
        roomType: 'Deluxe Suite',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        guests: 2,
        paymentStatus: 'pending', // or 'paid' to test different flows
        totalAmount: 450.00,
        currency: 'USD'
      };
      
      // Navigate to payment check page
      navigate('/checkin/payment-check', {
        state: { reservation: mockReservation },
      });
    } catch (err) {
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
            <BackButton onClick={handleBack} text={t('checkIn.back')} />

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
