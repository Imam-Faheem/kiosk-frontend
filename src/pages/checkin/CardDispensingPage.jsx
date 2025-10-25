import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Stepper,
  Alert,
  Loader,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard, IconCheck, IconMail } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardMutation } from '../../hooks/useCardMutation';

const CardDispensingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const issueCard = useCardMutation('issue', {
    onSuccess: (result) => {
      if (result.success) {
        setCardData(result.data);
        setCardStatus('completed');
        setCurrentStep(3);
      }
    },
    onError: (err) => {
      console.error('Card issuance error:', err);
      setError(err.message || t('error.cardIssuanceFailed'));
      setCardStatus('error');
    }
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('preparing');
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);

  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;

  const steps = [
    { label: t('cardDispensing.steps.preparing'), description: 'Preparing your card' },
    { label: t('cardDispensing.steps.encoding'), description: 'Encoding access credentials' },
    { label: t('cardDispensing.steps.sending'), description: 'Sending details to your email' },
  ];

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    const processCard = async () => {
      try {
        // Step 1: Preparing card
        setCurrentStep(0);
        setCardStatus('preparing');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Encoding card
        setCurrentStep(1);
        setCardStatus('encoding');
        
        const result = await issueCard.mutateAsync({
          reservationId: reservation.reservationId,
          roomNumber: reservation.roomNumber,
          guestName: reservation.guestName,
          email: reservation.email
        });

        if (result.success) {
          setCardData(result.data);
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Step 3: Sending details
          setCurrentStep(2);
          setCardStatus('sending');
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Complete
          setCardStatus('completed');
          
          // Navigate to completion page after 5 seconds
          setTimeout(() => {
            navigate('/checkin/complete', {
              state: { 
                reservation, 
                paymentStatus,
                cardData: result.data
              }
            });
          }, 5000);
        } else {
          setError(t('error.cardDispenserError'));
        }
      } catch (err) {
        console.error('Card issuance error:', err);
        setError(err.message || t('error.cardDispenserError'));
      }
    };

    processCard();
  }, [reservation, navigate, issueCard, t, paymentStatus]);

  const handleBack = () => {
    navigate('/checkin');
  };

  if (!reservation) {
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
                marginRight: '0px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('cardDispensing.title')}
            </Title>
          </Group>
        </Group>

        {/* Content */}
        <Stack gap="lg" mb="xl">
          {error ? (
            <Alert
              icon={<IconCreditCard size={20} />}
              title="Card Dispenser Error"
              color="red"
              variant="light"
              style={{ borderRadius: '8px' }}
            >
              <Text size="lg" fw={500}>
                {error}
              </Text>
            </Alert>
          ) : (
            <>
              {/* Progress Stepper */}
              <Stepper
                active={currentStep}
                size="lg"
                color="#C8653D"
                radius="md"
                style={{ marginBottom: '20px' }}
              >
                {steps.map((step, index) => (
                  <Stepper.Step
                    key={index}
                    label={step.label}
                    description={step.description}
                    icon={
                      index < currentStep ? (
                        <IconCheck size={16} />
                      ) : index === currentStep ? (
                        <Loader size={16} color="#C8653D" />
                      ) : (
                        <IconCreditCard size={16} />
                      )
                    }
                  />
                ))}
              </Stepper>

              {/* Card Animation */}
              <Stack align="center" gap="md">
                <Box
                  style={{
                    width: '120px',
                    height: '80px',
                    backgroundColor: '#C8653D',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    animation: cardStatus === 'completed' ? 'none' : 'pulse 2s infinite',
                    transform: cardStatus === 'completed' ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <IconCreditCard size={32} />
                </Box>

                {cardStatus === 'preparing' && (
                  <Text size="lg" c="#666666" ta="center">
                    {t('cardDispensing.loading')}
                  </Text>
                )}

                {cardStatus === 'encoding' && (
                  <Text size="lg" c="#666666" ta="center">
                    Encoding your access credentials...
                  </Text>
                )}

                {cardStatus === 'sending' && (
                  <Stack align="center" gap="sm">
                    <IconMail size={32} color="#C8653D" />
                    <Text size="lg" c="#666666" ta="center">
                      Sending digital key to your email...
                    </Text>
                  </Stack>
                )}

                {cardStatus === 'completed' && (
                  <Stack align="center" gap="sm">
                    <IconCheck size={32} color="green" />
                    <Text size="lg" fw={600} c="#0B152A" ta="center">
                      {t('cardDispensing.takeCard')}
                    </Text>
                    <Text size="md" c="#666666" ta="center">
                      Your card is ready! Please take it from the slot.
                    </Text>
                  </Stack>
                )}
              </Stack>

              {/* Card Details */}
              {cardData && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Card Details"
                  color="green"
                  variant="light"
                  style={{ borderRadius: '8px' }}
                >
                  <Stack gap="xs">
                    <Text size="sm">
                      <strong>Access Code:</strong> {cardData.accessCode}
                    </Text>
                    <Text size="sm">
                      <strong>Room:</strong> {reservation.roomNumber}
                    </Text>
                    <Text size="sm">
                      <strong>Valid Until:</strong> {reservation.checkOut}
                    </Text>
                  </Stack>
                </Alert>
              )}
            </>
          )}
        </Stack>

        {/* Back Button */}
        <Group justify="flex-start">
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
            {t('common.back')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default CardDispensingPage;
