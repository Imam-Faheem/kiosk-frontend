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
  Progress,
  Alert,
  Loader,
} from '@mantine/core';
import { IconArrowLeft, IconKey, IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCardMutation } from '../../hooks/useCardMutation';

const RegenerateCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const regenerateCard = useCardMutation('regenerate', {
    onSuccess: (result) => {
      if (result.success) {
        setCardData(result.data);
        setCardStatus('completed');
        setCurrentStep(3);
      }
    },
    onError: (err) => {
      console.error('Card regeneration error:', err);
      setError(err.message || t('error.cardRegenerationFailed'));
      setCardStatus('error');
    }
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('deactivating');
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);

  const guestData = location.state?.guestData;
  const validationData = location.state?.validationData;

  const steps = [
    { label: t('regenerateCard.steps.deactivating'), description: 'Deactivating old card' },
    { label: t('regenerateCard.steps.generating'), description: 'Generating new credentials' },
    { label: t('regenerateCard.steps.programming'), description: 'Programming new card' },
  ];

  useEffect(() => {
    if (!guestData || !validationData) {
      navigate('/lost-card');
      return;
    }

    const processCardRegeneration = async () => {
      try {
        // Step 1: Deactivating old card
        setCurrentStep(0);
        setCardStatus('deactivating');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Generating new credentials
        setCurrentStep(1);
        setCardStatus('generating');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Programming new card
        setCurrentStep(2);
        setCardStatus('programming');
        
        const result = await regenerateCard.mutateAsync({
          reservationId: guestData.reservationId,
          roomNumber: guestData.roomNumber,
          guestName: guestData.guestName,
        });

        if (result.success) {
          setCardData(result.data);
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Complete
          setCardStatus('completed');
          
          // Navigate to card issued page after 3 seconds
          setTimeout(() => {
            navigate('/lost-card/issued', {
              state: { 
                guestData,
                cardData: result.data
              }
            });
          }, 3000);
        } else {
          setError(t('error.cardDispenserError'));
        }
      } catch (err) {
        console.error('Card regeneration error:', err);
        setError(err.message || t('error.cardDispenserError'));
      }
    };

    processCardRegeneration();
  }, [guestData, validationData, navigate, regenerateCard, t]);

  const handleBack = () => {
    navigate('/lost-card');
  };

  if (!guestData || !validationData) {
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
                marginRight: '15px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('regenerateCard.title')}
            </Title>
          </Group>
        </Group>

        {/* Content */}
        <Stack gap="lg" mb="xl">
          {error ? (
            <Alert
              icon={<IconX size={20} />}
              title="Card Regeneration Error"
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
              {/* Progress Steps */}
              <Stack gap="md">
                {steps.map((step, index) => (
                  <Box key={index}>
                    <Group justify="space-between" mb="xs">
                      <Text size="md" fw={500} c={index <= currentStep ? '#0B152A' : '#666666'}>
                        {step.label}
                      </Text>
                      {index < currentStep ? (
                        <IconCheck size={20} color="green" />
                      ) : index === currentStep ? (
                        <Loader size={20} color="#C8653D" />
                      ) : (
                        <IconKey size={20} color="#666666" />
                      )}
                    </Group>
                    <Text size="sm" c="#666666">
                      {step.description}
                    </Text>
                    {index === currentStep && (
                      <Progress
                        value={100}
                        color="#C8653D"
                        size="sm"
                        radius="md"
                        style={{ marginTop: '8px' }}
                        animated
                      />
                    )}
                  </Box>
                ))}
              </Stack>

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
                  <IconKey size={32} />
                </Box>

                {cardStatus === 'deactivating' && (
                  <Text size="lg" c="#666666" ta="center">
                    {t('regenerateCard.pleaseWait')}
                  </Text>
                )}

                {cardStatus === 'generating' && (
                  <Text size="lg" c="#666666" ta="center">
                    Generating new access credentials...
                  </Text>
                )}

                {cardStatus === 'programming' && (
                  <Text size="lg" c="#666666" ta="center">
                    Programming your new card...
                  </Text>
                )}

                {cardStatus === 'completed' && (
                  <Stack align="center" gap="sm">
                    <IconCheck size={32} color="green" />
                    <Text size="lg" fw={600} c="#0B152A" ta="center">
                      Card regenerated successfully!
                    </Text>
                    <Text size="md" c="#666666" ta="center">
                      Your new card is ready.
                    </Text>
                  </Stack>
                )}
              </Stack>

              {/* Card Details */}
              {cardData && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="New Card Details"
                  color="green"
                  variant="light"
                  style={{ borderRadius: '8px' }}
                >
                  <Stack gap="xs">
                    <Text size="sm">
                      <strong>New Access Code:</strong> {cardData.accessCode}
                    </Text>
                    <Text size="sm">
                      <strong>Room:</strong> {guestData.roomNumber}
                    </Text>
                    <Text size="sm">
                      <strong>Status:</strong> {cardData.status}
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

export default RegenerateCardPage;
