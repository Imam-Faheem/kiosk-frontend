import React, { useState, useEffect } from 'react';
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
  Textarea,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { guestInitialValues, guestValidationSchema } from '../../schemas/guest.schema';
import useLanguage from '../../hooks/useLanguage';
import usePropertyStore from '../../stores/propertyStore';
import { useGuestMutation } from '../../hooks/useGuestMutation';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import { GUEST_DETAILS_OPTIONS } from '../../config/constants';

const GuestDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [error, setError] = useState(null);
  const [isAvailabilityError, setIsAvailabilityError] = useState(false);

  const { room, searchCriteria } = location.state ?? {};

  const form = useForm({
    initialValues: guestInitialValues,
    validate: (values) => {
      try {
        guestValidationSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (err) {
        const errors = {};
        if (err.inner) {
          err.inner.forEach((error) => {
            errors[error.path] = error.message;
          });
        }
        return errors;
      }
    },
  });

  const saveGuestMutation = useGuestMutation({
    onError: (err) => {
      console.warn('[GuestDetailsPage] Failed to save guest details to backend:', err);
      setError(t('error.failedToSaveGuestDetails'));
    },
  });

  const handleSubmit = async (values) => {
    setError(null);

    const guestData = {
      ...values,
      propertyId: usePropertyStore.getState().propertyId,
    };

    saveGuestMutation.mutate(guestData, {
      onSuccess: (result) => {
        const savedGuest = result?.data ?? result;
        navigate('/reservation/room-details', {
          state: {
            room,
            searchCriteria,
            guestDetails: values,
            savedGuest,
          },
        });
      },
      onError: () => {
        navigate('/reservation/room-details', {
          state: {
            room,
            searchCriteria,
            guestDetails: values,
            savedGuest: null,
          },
        });
      },
    });
  };

  const handleBack = () => {
    navigate('/reservation/search');
  };

  useEffect(() => {
    if (!room || !searchCriteria) {
      navigate('/reservation/search', { replace: true });
      return;
    }
  }, [room, searchCriteria, navigate]);

  if (!room || !searchCriteria) {
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
            <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222' }}>
              {t('guestDetails.pleaseFillYourDetails') ?? 'Please fill your details'}
            </Title>

            {error && (
              <Alert 
                color="red" 
                variant="light" 
                onClose={() => {
                  setError(null);
                  setIsAvailabilityError(false);
                }} 
                withCloseButton
                title={isAvailabilityError ? 'Room No Longer Available' : 'Error'}
              >
                {error}
                {isAvailabilityError && (
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    mt="md"
                    onClick={() => navigate('/reservation/search', { replace: true })}
                  >
                    Search for Rooms Again
                  </Button>
                )}
              </Alert>
            )}

            <Group grow>
              <Select
                label={t('guestDetails.titleField')}
                placeholder={t('guestDetails.titlePlaceholder')}
                required
                size="lg"
                data={GUEST_DETAILS_OPTIONS.TITLES.map(opt => ({
                  ...opt,
                  label: t(`guestDetails.titleOptions.${opt.value.toLowerCase()}`),
                }))}
                {...form.getInputProps('title')}
              />
              <Select
                label={t('guestDetails.gender')}
                placeholder={t('guestDetails.genderPlaceholder')}
                required
                size="lg"
                data={GUEST_DETAILS_OPTIONS.GENDERS.map(opt => ({
                  ...opt,
                  label: t(`guestDetails.genderOptions.${opt.value.toLowerCase()}`),
                }))}
                {...form.getInputProps('gender')}
              />
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.firstName')}
                  placeholder={t('guestDetails.firstNamePlaceholder')}
                  required
                  size="lg"
                  {...form.getInputProps('firstName')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.lastName')}
                  placeholder={t('guestDetails.lastNamePlaceholder')}
                  required
                  size="lg"
                  {...form.getInputProps('lastName')}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label={t('guestDetails.email')}
              placeholder={t('guestDetails.emailPlaceholder')}
              required
              size="lg"
              type="email"
              {...form.getInputProps('email')}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.phone')}
                  placeholder={t('guestDetails.phonePlaceholder')}
                  required
                  size="lg"
                  {...form.getInputProps('phone')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={t('guestDetails.birthDate')}
                  placeholder="09/04/2014"
                  required
                  size="lg"
                  value={form.values.birthDate ? new Date(form.values.birthDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const dateObj = date instanceof Date ? date : new Date(date);
                      if (!isNaN(dateObj.getTime())) {
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        form.setFieldValue('birthDate', formattedDate);
                      }
                    } else {
                      form.setFieldValue('birthDate', '');
                    }
                  }}
                  dateFormatter={(value) => {
                    if (!value) return '';
                    const date = value instanceof Date ? value : new Date(value);
                    if (isNaN(date.getTime())) return '';
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                  }}
                  maxDate={new Date()}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t('guestDetails.documentType')}
                  placeholder={t('guestDetails.documentTypePlaceholder')}
                  required
                  size="lg"
                  data={GUEST_DETAILS_OPTIONS.DOCUMENT_TYPES.map(opt => {
                    const translationKeys = {
                      'Passport': 'passport',
                      'IdCard': 'id',
                      'DriverLicense': 'driverlicense',
                    };
                    const translationKey = translationKeys[opt.value] ?? opt.value.toLowerCase();
                    const translatedLabel = t(`guestDetails.documentTypes.${translationKey}`);
                    return {
                      ...opt,
                      label: translatedLabel !== `guestDetails.documentTypes.${translationKey}` ? translatedLabel : opt.label,
                    };
                  })}
                  {...form.getInputProps('documentType')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.documentNumber')}
                  placeholder={t('guestDetails.documentNumberPlaceholder')}
                  required
                  size="lg"
                  {...form.getInputProps('documentNumber')}
                />
              </Grid.Col>
            </Grid>
            
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.birthPlace')}
                  placeholder={t('guestDetails.birthPlacePlaceholder')}
                  size="lg"
                  {...form.getInputProps('birthPlace')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t('guestDetails.nationality')}
                  placeholder={t('guestDetails.nationalityPlaceholder')}
                  size="lg"
                  data={GUEST_DETAILS_OPTIONS.COUNTRIES.map(opt => ({
                    ...opt,
                    label: t(`guestDetails.countries.${opt.value.toLowerCase()}`),
                  }))}
                  {...form.getInputProps('nationalityCountryCode')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label={t('guestDetails.addressStreet')}
              placeholder={t('guestDetails.streetPlaceholder')}
              required
              size="lg"
              {...form.getInputProps('addressStreet')}
            />
            <TextInput
              label={t('guestDetails.addressCity')}
              placeholder={t('guestDetails.cityPlaceholder')}
              required
              size="lg"
              {...form.getInputProps('addressCity')}
            />
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('guestDetails.addressPostal')}
                  placeholder={t('guestDetails.postalPlaceholder')}
                  required
                  size="lg"
                  {...form.getInputProps('addressPostal')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t('guestDetails.country')}
                  placeholder={t('guestDetails.countryPlaceholder')}
                  required
                  size="lg"
                  data={GUEST_DETAILS_OPTIONS.COUNTRIES.map(opt => ({
                    ...opt,
                    label: t(`guestDetails.countries.${opt.value.toLowerCase()}`),
                  }))}
                  {...form.getInputProps('country')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label={t('guestDetails.travelPurpose')}
              placeholder={t('guestDetails.travelPurposePlaceholder')}
              size="lg"
              data={[
                { value: 'Business', label: t('guestDetails.travelPurposes.business') },
                { value: 'Leisure', label: t('guestDetails.travelPurposes.leisure') },
                { value: 'Other', label: t('guestDetails.travelPurposes.other') },
              ]}
              {...form.getInputProps('travelPurpose')}
            />
            
            <Textarea
              label={t('guestDetails.guestComment')}
              placeholder={t('guestDetails.guestCommentPlaceholder')}
              size="lg"
              minRows={3}
              maxRows={5}
              {...form.getInputProps('guestComment')}
            />
          </Stack>

          <Group justify="space-between">
            <BackButton onClick={handleBack} text={t('guestDetails.back')} />
            <Button
              type="button"
              size="lg"
              loading={saveGuestMutation.isPending}
              rightSection={!saveGuestMutation.isPending && <span style={{ fontWeight: 800, fontSize: '18px' }}>→</span>}
              disabled={saveGuestMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                const validation = form.validate();
                if (!validation.hasErrors) {
                  handleSubmit(form.values);
                } else {
                  console.log('Form validation errors:', validation.errors);
                  // Still navigate even if there are validation errors
                  handleSubmit(form.values);
                }
              }}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!saveGuestMutation.isPending) {
                  e.currentTarget.style.backgroundColor = '#B8552F';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saveGuestMutation.isPending) {
                  e.currentTarget.style.backgroundColor = '#C8653D';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {saveGuestMutation.isPending ? t('common.saving') : t('guestDetails.continue')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default GuestDetailsPage;
