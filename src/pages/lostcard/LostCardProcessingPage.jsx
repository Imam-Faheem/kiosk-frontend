import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Stack,
  Text,
  Loader,
  Alert,
  Stepper,
  Box,
} from '@mantine/core';
import { IconX, IconCircleCheck, IconLoader2 } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import { useValidateLostCard, useIssueCardForLostCard } from '../../hooks/useLostCardFlow';
import '../../styles/animations.css';

/**
 * Lost card flow with real API calls + animated steps:
 * Validate reservation -> Issue card (hardware/backend) -> Card dispensing animation -> Issued screen
 */
const LostCardProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const reservationNumber = useMemo(() => {
    const raw = location.state?.reservationNumber ?? '';
    return typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
  }, [location.state]);

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const validatedReservationRef = useRef(null);

  const issueCard = useIssueCardForLostCard({
    onSuccess: (result) => {
      const reservationData = validatedReservationRef.current;
      const reservationId =
        reservationData?.id ??
        reservationData?.bookingId ??
        reservationNumber;

      const cardData = result?.data ?? result;

      // Reuse the existing dispensing UI (Stepper + animations) and then route to /lost-card/issued
      navigate('/checkin/card-dispensing', {
        state: {
          reservation: reservationData,
          reservationId,
          cardData,
          completionPath: '/lost-card/issued',
          completionState: {
            guestData: reservationData,
            cardData,
          },
        },
        replace: true,
      });
    },
    onError: (err) => {
      setError(err?.message ?? t('error.cardRegenerationFailed') ?? 'Failed to issue card');
    },
  });

  const validateLostCard = useValidateLostCard({
    onSuccess: (result) => {
      const reservationData = result?.data ?? result;
      validatedReservationRef.current = reservationData;
      setCurrentStep(1);
      issueCard.mutate({ reservationId: reservationNumber });
    },
    onError: (err) => {
      setError(err?.message ?? t('error.validationFailed') ?? 'Failed to validate lost card request');
    },
  });

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!reservationNumber) {
      navigate('/lost-card', { replace: true });
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Start: validate reservation number
    setError(null);
    setCurrentStep(0);
    validateLostCard.mutate({ reservationId: reservationNumber });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationNumber, navigate]);

  const isLoading = validateLostCard.isPending || issueCard.isPending;

  const steps = useMemo(() => [
    { key: 'validate', label: t('lostCard.validating') ?? 'Validating details' },
    { key: 'issue', label: t('checkIn.issuingCard') ?? 'Issuing card' },
  ], [t]);

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
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Group>

        <Stack gap="lg">
          {error ? (
            <Alert
              icon={<IconX size={20} />}
              title={t('error.title')}
              color="red"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              {error}
            </Alert>
          ) : (
            <>
              <Box>
                <Stepper
                  active={currentStep}
                  size="lg"
                  color="#C8653D"
                  radius="md"
                  iconSize={42}
                  orientation="vertical"
                  styles={{
                    stepBody: { marginTop: 12 },
                    stepLabel: {
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#222222',
                    },
                    separator: {
                      backgroundColor: '#C8653D',
                      transition: 'background-color 0.4s ease',
                    },
                    step: { paddingBottom: 24 },
                  }}
                >
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    return (
                      <Stepper.Step
                        key={step.key}
                        label={step.label}
                        icon={
                          isCompleted ? (
                            <IconCircleCheck size={22} stroke={2.5} />
                          ) : isActive ? (
                            <IconLoader2 size={22} className="spin-animation" style={{ color: '#C8653D' }} />
                          ) : (
                            <IconLoader2 size={20} />
                          )
                        }
                        styles={{
                          stepIcon: {
                            borderColor: isActive ? '#C8653D' : isCompleted ? '#C8653D' : '#e0e0e0',
                            backgroundColor: isActive
                              ? 'rgba(200, 101, 61, 0.1)'
                              : isCompleted
                                ? '#C8653D'
                                : '#f5f5f5',
                            transition: 'all 0.3s ease',
                          },
                          stepLabel: {
                            fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                            color: isActive ? '#C8653D' : isCompleted ? '#22c55e' : '#666666',
                          },
                        }}
                      />
                    );
                  })}
                </Stepper>
              </Box>

              <Stack align="center" gap="md">
                <Loader size="lg" color="#C8653D" />
                <Text size="md" c="dimmed">
                  {isLoading ? (steps[currentStep]?.label ?? t('common.loading')) : t('common.loading')}
                </Text>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default LostCardProcessingPage;

