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
import { IconKey, IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardMutation } from '../../hooks/useCardMutation';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const RegenerateCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
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
          reservationId: guestData.reservationId || guestData.reservationNumber,
          roomNumber: guestData.roomNumber,
          guestName: guestData.guestName || `${guestData.firstName || ''} ${guestData.lastName || ''}`.trim(),
          propertyId: guestData.propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER',
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
          borderRadius: '10px',
        }}
      >
        {/* Header */}
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

              {/* Completion Message */}
              {cardStatus === 'completed' && (
                <Stack align="center" gap="sm" mt="md">
                  <IconCheck size={32} color="green" />
                  <Text size="lg" fw={600} c="#0B152A" ta="center">
                    Card regenerated successfully!
                  </Text>
                  <Text size="md" c="#666666" ta="center">
                    Your new card is ready.
                  </Text>
                </Stack>
              )}

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
          <BackButton 
            onClick={handleBack} 
            text={t('common.back')}
          />
        </Group>
      </Paper>
    </Container>
  );
};

export default RegenerateCardPage;
