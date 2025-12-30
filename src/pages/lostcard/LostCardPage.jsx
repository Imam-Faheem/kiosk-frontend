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
import { useForm } from '@mantine/form';
import { validateLostCardGuest } from '../../services/lostCardService';
import PropertyHeader from '../../components/PropertyHeader';
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
      roomType: (value) => (!value ? t('error.roomTypeRequired') : null),
      reservationNumber: (value) => (!value ? t('error.reservationNumberRequired') : null),
      lastName: (value) => (!value ? t('error.lastNameRequired') : null),
    },
  });

  const hasValidGuestData = (data) => {
    if (!data) return false;
    
    const primaryGuest = data?.primaryGuest;
    if (primaryGuest) {
      const firstName = primaryGuest.firstName ?? '';
      const lastName = primaryGuest.lastName ?? '';
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    
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
    
    const guestName = data?.guest_name;
    if (guestName) {
      const firstName = guestName.first_name ?? guestName.firstName ?? '';
      const lastName = guestName.last_name ?? guestName.lastName ?? '';
      return firstName.trim().length > 0 && lastName.trim().length > 0;
    }
    
    return false;
  };

  const extractLastNameFromResponse = (data) => {
    if (!data) return null;
    
    const primaryGuest = data?.primaryGuest;
    if (primaryGuest?.lastName) {
      return primaryGuest.lastName.trim().toLowerCase();
    }
    
    const folios = data?.folios;
    if (Array.isArray(folios) && folios.length > 0) {
      const mainFolio = folios.find(f => f.isMainFolio) ?? folios[0];
      const debitor = mainFolio?.debitor;
      if (debitor?.name) {
        return debitor.name.trim().toLowerCase();
      }
    }
    
    const guestName = data?.guest_name;
    if (guestName) {
      const lastName = guestName.last_name ?? guestName.lastName;
      if (lastName) {
        return lastName.trim().toLowerCase();
      }
    }
    
    return null;
  };

  const validateLastNameMatch = (submittedLastName, apiData) => {
    const submittedLastNameLower = submittedLastName?.trim().toLowerCase();
    if (!submittedLastNameLower) {
      return false;
    }

    const responseLastName = extractLastNameFromResponse(apiData);
    if (!responseLastName) {
      return false;
    }

    return submittedLastNameLower === responseLastName;
  };

  const handleSubmit = async (values) => {
    setError(null);
    form.clearErrors();
    setIsLoading(true);
    
    try {
      const submittedLastName = values.lastName?.trim();
      
      const result = await validateLostCardGuest({
        reservationNumber: values.reservationNumber,
        roomNumber: values.roomType,
        lastName: submittedLastName,
      });
      
      if (!result.success) {
        throw new Error(result.message ?? t('error.validationFailed'));
      }

      if (!result.data) {
        throw new Error(t('error.reservationNotFound'));
      }

      const guestData = result.data;
      
      if (!hasValidGuestData(guestData)) {
        throw new Error(t('error.reservationNotFound'));
      }

      if (!validateLastNameMatch(submittedLastName, guestData)) {
        form.setFieldError('lastName', t('error.lastNameMismatch'));
        throw new Error(t('error.lastNameMismatch'));
      }

      const hasValidRoomData = guestData?.unit?.name ?? guestData?.unit?.id;
      if (!hasValidRoomData) {
        throw new Error(t('error.reservationNotFound'));
      }
      
      navigate('/lost-card/regenerate', {
        state: {
          guestData: guestData,
          validationData: values,
        },
      });
    } catch (err) {
      const errorStatus = err?.response?.status;
      const errorMessage = err?.message ?? t('error.guestValidationFailed');
      
      const isReservationError = errorStatus === 404 || 
                                 errorStatus === 500 ||
                                 errorMessage.includes('reservation') || 
                                 errorMessage.includes('Reservation') ||
                                 errorMessage.includes('status code 500') ||
                                 errorMessage.includes('Request failed');
      const isLastNameError = errorStatus === 403 || 
                             errorMessage.includes('last name') || 
                             errorMessage.includes('Last name') ||
                             errorMessage.includes('lastName');
      
      if (isReservationError) {
        form.setFieldError('reservationNumber', t('error.reservationNotFound'));
      } else if (isLastNameError) {
        form.setFieldError('lastName', t('error.lastNameMismatch'));
      } else {
        form.setFieldError('reservationNumber', t('error.reservationNotFound'));
      }
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


        {/* Form */}
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
              label={t('lostCard.roomType')}
              placeholder={t('lostCard.roomTypePlaceholder')}
              required
              size="lg"
              {...form.getInputProps('roomType')}
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

            <TextInput
              label={t('lostCard.lastName')}
              placeholder={t('lostCard.lastNamePlaceholder')}
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
              {isLoading ? t('lostCard.validating') : t('lostCard.submit')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default LostCardPage;
