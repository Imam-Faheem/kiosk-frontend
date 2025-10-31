import React from 'react';
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
  Select,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { guestValidationSchema, guestInitialValues } from '../../schemas/guest.schema';
import useLanguage from '../../hooks/useLanguage';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';

const GuestDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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

  const handleSubmit = (values) => {
    navigate('/reservation/room-details', {
      state: {
        room,
        searchCriteria,
        guestDetails: values,
      },
    });
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

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" mb="xl">
            <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222' }}>{t('guestDetails.formTitle')}</Title>

            <TextInput
              label={t('guestDetails.firstName')}
              placeholder="Enter your first name"
              required
              size="lg"
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label={t('guestDetails.lastName')}
              placeholder="Enter your last name"
              required
              size="lg"
              {...form.getInputProps('lastName')}
            />
            <TextInput
              label={t('guestDetails.email')}
              placeholder="Enter your email"
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
                  { value: 'US', label: 'United States (+1)' },
                  { value: 'GB', label: 'United Kingdom (+44)' },
                  { value: 'DE', label: 'Germany (+49)' },
                  { value: 'FR', label: 'France (+33)' },
                  { value: 'IT', label: 'Italy (+39)' },
                  { value: 'ES', label: 'Spain (+34)' },
                  { value: 'PT', label: 'Portugal (+351)' },
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
              rightSection={<span style={{ fontWeight: 800, fontSize: '18px' }}>→</span>}
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
              {t('guestDetails.continue')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default GuestDetailsPage;
