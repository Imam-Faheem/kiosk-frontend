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
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import BackButton from '../../components/BackButton';
import { useForm } from '@mantine/form';
import { apiClient } from '../../services/api/apiClient';
import UnoLogo from '../../assets/uno.jpg';
import { BUTTON_STYLES } from '../../config/constants';

const LostCardPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      roomType: '',
      reservationNumber: '',
      lastName: ''
    },
    validate: {
      roomType: (value) => (!value ? 'Room type is required' : null),
      reservationNumber: (value) => (!value ? 'Reservation number is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Call backend API to validate guest with Apaleo
      const response = await apiClient.post('/lost-card/validate', {
        reservationNumber: values.reservationNumber,
        roomType: values.roomType,
        lastName: values.lastName,
      });
      
      if (response.data.success) {
        const guestData = response.data.data;
        
        // Navigate to regenerate card page with validated data
        navigate('/lost-card/regenerate', {
          state: {
            guestData: guestData,
            validationData: values,
          },
        });
      } else {
        throw new Error(response.data.message || 'Validation failed');
      }
    } catch (err) {
      console.error('Guest validation error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || t('error.guestValidationFailed');
      setError(errorMessage);
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
          borderRadius: '10px',
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
          <Stack gap="xl" mb="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Validation Failed"
                color="red"
                variant="light"
                style={{ borderRadius: '8px' }}
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('lostCard.roomType') || 'Room Type'}
              placeholder="Enter room type (e.g., Double, Single, Suite)"
              required
              size="lg"
              {...form.getInputProps('roomType')}
              description="Room type from your reservation (e.g., Double, Single, Suite)"
              styles={{
                label: {
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '10px',
                },
                required: {
                  marginLeft: '2px',
                  transform: 'translateY(-1px)',
                },
                input: {
                  height: '48px',
                  minHeight: '48px',
                  borderRadius: '8px',
                  border: '2px solid #E0E0E0',
                  '&:focus': {
                    borderColor: '#C8653D',
                  }
                }
              }}
            />

            <TextInput
              label={t('lostCard.reservationNumber')}
              placeholder="Enter your reservation number"
              required
              size="lg"
              {...form.getInputProps('reservationNumber')}
              styles={{
                label: {
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '10px',
                },
                required: {
                  marginLeft: '2px',
                  transform: 'translateY(-1px)',
                },
                input: {
                  height: '48px',
                  minHeight: '48px',
                  borderRadius: '8px',
                  border: '2px solid #E0E0E0',
                  '&:focus': {
                    borderColor: '#C8653D',
                  }
                }
              }}
            />

            <TextInput
              label={t('lostCard.lastName')}
              placeholder="Enter your last name"
              required
              size="lg"
              {...form.getInputProps('lastName')}
              styles={{
                label: {
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '10px',
                },
                required: {
                  marginLeft: '2px',
                  transform: 'translateY(-1px)',
                },
                input: {
                  height: '48px',
                  minHeight: '48px',
                  borderRadius: '8px',
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
            <BackButton onClick={handleBack} text={t('lostCard.back')} />

            <Button
              type="submit"
              size="lg"
              leftSection={<IconCheck size={20} />}
              loading={isLoading}
              styles={BUTTON_STYLES.primarySmall}
              radius="md"
            >
              {isLoading ? 'Validating...' : t('lostCard.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default LostCardPage;
