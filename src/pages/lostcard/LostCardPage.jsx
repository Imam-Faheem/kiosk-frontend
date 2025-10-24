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
import { IconArrowLeft, IconKey, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { useCardMutation } from '../../hooks/useCardMutation';
import { lostCardValidationSchema, lostCardInitialValues } from '../../schemas/lostCard.schema';

const LostCardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { validateGuest } = useCardMutation();
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: lostCardInitialValues,
    validate: (values) => {
      try {
        lostCardValidationSchema.validateSync(values, { abortEarly: false });
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
      const result = await validateGuest.mutateAsync(values);
      
      if (result.success) {
        // Navigate to regenerate card page with validated data
        navigate('/lost-card/regenerate', {
          state: {
            guestData: result.data,
            validationData: values,
          },
        });
      } else {
        setError(t('error.guestValidationFailed'));
      }
    } catch (err) {
      console.error('Guest validation error:', err);
      setError(err.message || t('error.guestValidationFailed'));
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
              {t('lostCard.title')}
            </Title>
          </Group>
        </Group>

        {/* Help Text */}
        <Alert
          icon={<IconKey size={16} />}
          title="Lost Your Card?"
          color="blue"
          variant="light"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        >
          <Text size="sm">
            {t('lostCard.helpText')}
          </Text>
        </Alert>

        {/* Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
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
              label={t('lostCard.roomNumber')}
              placeholder="Enter your room number"
              required
              size="lg"
              {...form.getInputProps('roomNumber')}
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
              label={t('lostCard.reservationNumber')}
              placeholder="Enter your reservation number"
              required
              size="lg"
              {...form.getInputProps('reservationNumber')}
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
              label={t('lostCard.lastName')}
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
              {t('lostCard.back')}
            </Button>

            <Button
              type="submit"
              size="lg"
              leftSection={<IconKey size={20} />}
              loading={validateGuest.isPending}
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
              {t('lostCard.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default LostCardPage;
