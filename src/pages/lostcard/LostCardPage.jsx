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
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import { useForm } from '@mantine/form';
import { useValidateLostCard, useIssueCardForLostCard } from '../../hooks/useLostCardFlow';
import { BUTTON_STYLES } from '../../config/constants';

const LostCardPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      reservationNumber: '',
    },
    validate: {
      reservationNumber: (value) => (!value ? t('error.reservationNumberRequired') : null),
    },
  });

  // Step 2: Issue card
  const issueCard = useIssueCardForLostCard({
    onSuccess: (result) => {
      // Navigate to regenerate page with the result
      navigate('/lost-card/regenerate', {
        state: {
          guestData: null,
          validationData: form.values,
          cardData: result?.data ?? result,
        },
      });
    },
    onError: (err) => {
      const errorMessage = err?.message ?? t('error.cardRegenerationFailed') ?? 'Failed to issue card';
      form.setFieldError('reservationNumber', errorMessage);
      setError(errorMessage);
    },
  });

  // Step 1: Validate lost card
  const validateLostCard = useValidateLostCard({
    onSuccess: (result) => {
      // Step 2: Issue card after validation
      issueCard.mutate({ reservationId: form.values.reservationNumber });
    },
    onError: (err) => {
      const errorMessage = err?.message ?? t('error.validationFailed') ?? 'Failed to validate lost card request';
      form.setFieldError('reservationNumber', errorMessage);
      setError(errorMessage);
    },
  });

  const isLoading = validateLostCard.isPending || issueCard.isPending;

  const handleSubmit = async (values) => {
    setError(null);
    form.clearErrors();
    
    const reservationNumber = values.reservationNumber?.trim();
    
    if (!reservationNumber) {
      form.setFieldError('reservationNumber', t('error.reservationNumberRequired'));
      return;
    }

    // Step 1: Validate lost card first
    validateLostCard.mutate({ reservationId: reservationNumber });
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
