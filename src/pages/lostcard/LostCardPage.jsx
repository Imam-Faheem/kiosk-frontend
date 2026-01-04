import React, { useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Stack,
  TextInput,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import { useForm } from '@mantine/form';
import { regenerateLostCard } from '../../services/lostCardService';
import { BUTTON_STYLES } from '../../config/constants';

const LostCardPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      reservationNumber: '',
    },
    validate: {
      reservationNumber: (value) => (!value ? t('error.reservationNumberRequired') : null),
    },
  });

  const handleSubmit = async (values) => {
    setError(null);
    form.clearErrors();
    setIsLoading(true);
    
    try {
      const reservationNumber = values.reservationNumber?.trim();
      
      if (!reservationNumber) {
        throw new Error(t('error.reservationNumberRequired'));
      }

      // Directly call the POST endpoint to regenerate the lost card
      // This hits: /organizations/:organization_id/properties/:property_id/reservations/:reservation_id/lost-card
      const regenerateData = {
        reservation_id: reservationNumber,
        reservationId: reservationNumber,
        id: reservationNumber,
      };

      console.log('[LostCardPage] Directly calling regenerate lost card endpoint with:', regenerateData);

      const regenerateResult = await regenerateLostCard(regenerateData);

      // Navigate to regenerate page with the result
      navigate('/lost-card/regenerate', {
        state: {
          guestData: null,
          validationData: values,
          cardData: regenerateResult?.data ?? regenerateResult,
        },
      });
    } catch (err) {
      console.error('[LostCardPage] Error:', err);
      
      const errorStatus = err?.response?.status;
      const errorMessage = err?.message ?? t('error.cardRegenerationFailed') ?? 'Failed to regenerate card';
      
      // Display the actual error message from the API
      form.setFieldError('reservationNumber', errorMessage);
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
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl" mb="xl">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('error.title')}
                color="red"
                variant="light"
                style={{ borderRadius: '8px' }}
              >
                {error}
              </Alert>
            )}

            <TextInput
              label={t('lostCard.reservationNumber')}
              placeholder={t('lostCard.reservationNumberPlaceholder')}
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
          </Stack>

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
              {isLoading ? t('lostCard.validating') : t('lostCard.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default LostCardPage;
