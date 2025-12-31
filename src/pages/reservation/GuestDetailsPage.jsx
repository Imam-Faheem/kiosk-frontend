import React, { useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Title,
  Stack,
  TextInput,
  Select,
  Alert,
  Loader,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { guestValidationSchema, guestInitialValues } from '../../schemas/guest.schema';
import useLanguage from '../../hooks/useLanguage';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import { saveGuestDetails } from '../../services/guestService';

const GuestDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { room, searchCriteria } = location.state || {};

  const form = useForm({
    initialValues: guestInitialValues,
    validate: (values) => {
      try {
        guestValidationSchema.validateSync(values, { abortEarly: false });
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
    setLoading(true);
    setError(null);

    try {
      // Save guest details to backend
      const result = await saveGuestDetails(values);

      if (result?.success ?? result?.data) {
        navigate('/reservation/room-details', {
          state: {
            room,
            searchCriteria,
            guestDetails: values,
            savedGuest: result?.data ?? result,
          },
        });
      } else {
        setError(result?.message ?? t('error.failedToSaveGuestDetails'));
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err?.message || err?.response?.data?.message || t('error.failedToSaveGuestDetails');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/reservation/search');
  };

  if (!room) {
    navigate('/reservation/search');
    return null;
  }

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
          maxWidth: '700px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
            <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222' }}>{t('guestDetails.formTitle')}</Title>

            {error && (
              <Alert color="red" title={t('error.title') || 'Error'}>
                {error}
              </Alert>
            )}

            <TextInput
              label={t('guestDetails.firstName')}
              placeholder={t('guestDetails.firstNamePlaceholder')}
              required
              size="lg"
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label={t('guestDetails.lastName')}
              placeholder={t('guestDetails.lastNamePlaceholder')}
              required
              size="lg"
              {...form.getInputProps('lastName')}
            />
            <TextInput
              label={t('guestDetails.email')}
              placeholder={t('guestDetails.emailPlaceholder')}
              required
              size="lg"
              type="email"
              {...form.getInputProps('email')}
            />
            <Group grow>
              <Select
                label={t('guestDetails.country')}
                placeholder={t('guestDetails.countryPlaceholder')}
                required
                size="lg"
                data={[
                  { value: 'US', label: t('guestDetails.countries.us') },
                  { value: 'GB', label: t('guestDetails.countries.gb') },
                  { value: 'DE', label: t('guestDetails.countries.de') },
                  { value: 'FR', label: t('guestDetails.countries.fr') },
                  { value: 'IT', label: t('guestDetails.countries.it') },
                  { value: 'ES', label: t('guestDetails.countries.es') },
                  { value: 'PT', label: t('guestDetails.countries.pt') },
                ]}
                {...form.getInputProps('country')}
              />
              <TextInput
                label={t('guestDetails.phone')}
                placeholder={t('guestDetails.phonePlaceholder')}
                required
                size="lg"
                {...form.getInputProps('phone')}
              />
            </Group>

            <Title order={4} style={{ fontSize: '18px', fontWeight: 700, color: '#444', marginTop: '8px' }}>{t('guestDetails.addressSection')}</Title>
            <TextInput
              label={t('guestDetails.addressStreet')}
              placeholder={t('guestDetails.streetPlaceholder')}
              required
              size="lg"
              {...form.getInputProps('addressStreet')}
            />
            <Group grow>
              <TextInput
                label={t('guestDetails.addressCity')}
                placeholder={t('guestDetails.cityPlaceholder')}
                required
                size="lg"
                {...form.getInputProps('addressCity')}
              />
              <TextInput
                label={t('guestDetails.addressState')}
                placeholder={t('guestDetails.statePlaceholder')}
                required
                size="lg"
                {...form.getInputProps('addressState')}
              />
            </Group>
            <TextInput
              label={t('guestDetails.addressPostal')}
              placeholder={t('guestDetails.postalPlaceholder')}
              required
              size="lg"
              {...form.getInputProps('addressPostal')}
            />
          </Stack>

          <Group justify="space-between">
            <BackButton onClick={handleBack} text={t('guestDetails.back')} />
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={loading}
              rightSection={!loading && <span style={{ fontWeight: 800, fontSize: '18px' }}>→</span>}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#B8552F';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {t('guestDetails.continue')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default GuestDetailsPage;
