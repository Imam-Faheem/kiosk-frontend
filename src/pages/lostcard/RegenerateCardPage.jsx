import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Title,
  Stack,
  Box,
  Alert,
  Button,
  Loader,
} from '@mantine/core';
import { IconCheck, IconX, IconKey, IconHome, IconLoader2 } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardRegenerationData, useCardRegenerationMutation } from '../../hooks/useCardRegeneration';
import PropertyHeader from '../../components/PropertyHeader';
import '../../styles/animations.css';

const STEP_DELAY = 2000;

const RegenerateCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);

  const guestData = location.state?.guestData;
  const validationData = location.state?.validationData;
  const cardData = location.state?.cardData; // Card data if already regenerated

  const hasRequiredData = !!(guestData || validationData || cardData);

  const {
    data: cardMutationData,
    isLoading: isLoadingData,
    error: dataError,
    isError: isDataError,
  } = useCardRegenerationData(guestData, validationData, hasRequiredData);

  const regenerateCardMutation = useCardRegenerationMutation({
    onSuccess: (result) => {
      if (result?.success && result?.data) {
        setTimeout(() => {
          setCardStatus('completed');
          setCurrentStep(3);
          setTimeout(() => {
            navigate('/lost-card/issued', {
              state: { guestData, cardData: result.data },
            });
          }, 2000);
        }, STEP_DELAY);
      }
    },
    onError: () => {
      setCardStatus('error');
    },
  });

  // If cardData is already provided (from LostCardPage), skip mutation and show success
  useEffect(() => {
    if (cardData && cardStatus === 'idle') {
      // Simulate the steps and then show success
      const processExistingCard = async () => {
        setCurrentStep(0);
        setCardStatus('deactivating');
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY));
        
        setCurrentStep(1);
        setCardStatus('generating');
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY));
        
        setCurrentStep(2);
        setCardStatus('programming');
        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY));
        
        setTimeout(() => {
          setCardStatus('completed');
          setCurrentStep(3);
          setTimeout(() => {
            navigate('/lost-card/issued', {
              state: { guestData, cardData: cardData },
            });
          }, 2000);
        }, STEP_DELAY);
      };
      processExistingCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData, cardStatus]);

  const isLoading = isLoadingData || regenerateCardMutation.isPending;
  const isError = isDataError || regenerateCardMutation.isError;
  const isSuccess = regenerateCardMutation.isSuccess && cardStatus === 'completed';

  const steps = useMemo(() => [
    { label: t('regenerateCard.steps.deactivating'), status: 'deactivating' },
    { label: t('regenerateCard.steps.generating'), status: 'generating' },
    { label: t('regenerateCard.steps.programming'), status: 'programming' },
  ], [t]);

  // Guest name computation removed as it's not used in this component

  const processStep = async (stepIndex, status) => {
    setCurrentStep(stepIndex);
    setCardStatus(status);
    await new Promise((resolve) => setTimeout(resolve, STEP_DELAY));
  };

  useEffect(() => {
    if (!hasRequiredData) {
      navigate('/lost-card', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    // Skip if cardData is already provided (card was already regenerated in LostCardPage)
    if (cardData) {
      return;
    }

    if (!cardMutationData || regenerateCardMutation.isPending || regenerateCardMutation.isSuccess || cardStatus !== 'idle') {
      return;
    }

    const processCardRegeneration = async () => {
      await processStep(0, 'deactivating');
      await processStep(1, 'generating');
      await processStep(2, 'programming');
      regenerateCardMutation.mutate(cardMutationData);
    };

    processCardRegeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardMutationData, cardData]);

  // Trigger celebration animation when card status becomes completed
  useEffect(() => {
    if (cardStatus === 'completed') {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [cardStatus]);

  const handleReturnHome = () => {
    navigate('/home');
  };

  if (!hasRequiredData) {
    return (
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        p={20}
        bg="#FFFFFF"
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          w="100%"
          maw={600}
          bg="#ffffff"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="md" c="dimmed">{t('regenerateCard.pleaseWaitMessage')}</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const errorMessage = dataError?.message ??
                      regenerateCardMutation.error?.message ??
                      null;
  const isReservationNotFound = errorMessage?.toLowerCase().includes('reservation not found') ||
                               errorMessage?.toLowerCase().includes('reservationnotfound') ||
                               (isDataError && !isLoading);

  if (isLoading) {
    return (
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        p={20}
        bg="#FFFFFF"
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          w="100%"
          maw={600}
          bg="#ffffff"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="md" c="dimmed">{t('regenerateCard.pleaseWaitMessage')}</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (isReservationNotFound) {
    return (
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        p={20}
        bg="#FFFFFF"
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          w="100%"
          maw={600}
          bg="#ffffff"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>
          <Stack gap="lg">
            <Alert
              icon={<IconX size={18} />}
              title={t('error.title')}
              color="red"
              variant="light"
              radius="md"
            >
              <Text size="md" fw={500}>
                {t('error.reservationNotFound')}
              </Text>
            </Alert>
            <Group justify="center" mt="xl">
              <Button
                size="lg"
                leftSection={<IconHome size={20} stroke={2} />}
                onClick={() => navigate('/lost-card')}
                bg="#C8653D"
                c="white"
                fw={600}
                radius="md"
              >
                {t('common.returnToHome')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
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
      }}
      p={20}
      bg="#FFFFFF"
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        w="100%"
        maw={600}
        bg="#ffffff"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>

          <Stack gap="lg" mb="xl">
            {isError ? (
              <Alert
                icon={<IconX size={18} />}
                title={t('error.title')}
                color="red"
                variant="light"
                radius="md"
              >
                <Text size="md" fw={500} ff="Inter, sans-serif">
                  {errorMessage ?? t('error.cardRegenerationFailed')}
                </Text>
              </Alert>
            ) : (
              <>
                {/* Status Headline */}
                <Stack gap={8} align="center" mb={24}>
                  <Title 
                    order={2} 
                    fw={700} 
                    c="dark.9" 
                    ta="center"
                    fz={24}
                    lts={-0.3}
                  >
                    {cardStatus === 'completed' ? t('regenerateCard.cardUpdateComplete') : t('regenerateCard.updatingRoomAccess')}
                  </Title>
                  {cardStatus !== 'completed' && (
                    <Text 
                      size="sm" 
                      c="dimmed" 
                      ta="center"
                      maw={500}
                      lh={1.6}
                    >
                      {t('regenerateCard.pleaseWaitMessage')}
                    </Text>
                  )}
                </Stack>

                {/* Steps Sequence */}
                <Box
                  p={24}
                  bg="rgba(200, 101, 61, 0.02)"
                  radius="md"
                  style={{
                    border: '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Stack gap={20}>
                    {steps.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isActive = index === currentStep;
                      
                      const getStepIcon = () => {
                        if (isCompleted) {
                          return (
                            <Box
                              w={24}
                              h={24}
                              bg="#22c55e"
                              style={{
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <IconCheck size={14} color="white" stroke={3} />
                            </Box>
                          );
                        }
                        if (isActive) {
                          if (step.status === 'deactivating') {
                            return (
                              <Box pos="relative" w={24} h={24}>
                                <Box
                                  pos="absolute"
                                  w={24}
                                  h={24}
                                  style={{
                                    border: '2px solid #C8653D',
                                    borderRadius: '50%',
                                    animation: 'pulseRing 2s ease-in-out infinite',
                                  }}
                                />
                                <Box
                                  pos="absolute"
                                  top={6}
                                  left={6}
                                  w={12}
                                  h={12}
                                  bg="#C8653D"
                                  style={{ borderRadius: '50%' }}
                                />
                              </Box>
                            );
                          } else if (step.status === 'generating') {
                            return (
                              <Box w={24} h={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconLoader2 
                                  size={20} 
                                  color="#C8653D" 
                                  style={{ animation: 'spin 1s linear infinite' }}
                                />
                              </Box>
                            );
                          } else {
                            return (
                              <Box w={24} h={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconLoader2 
                                  size={20} 
                                  color="#C8653D" 
                                  style={{ animation: 'spin 1s linear infinite' }}
                                />
                              </Box>
                            );
                          }
                        }
                        return (
                          <Box
                            w={24}
                            h={24}
                            bg="rgba(209, 213, 219, 0.3)"
                            style={{
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconKey size={16} color="#d1d5db" stroke={1.5} />
                          </Box>
                        );
                      };
                      
                      return (
                        <Group 
                          key={index}
                          gap={16}
                          align="center"
                          p="12px 16px"
                          radius="md"
                          bg={isActive ? 'rgba(200, 101, 61, 0.05)' : 'transparent'}
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {getStepIcon()}
                          <Text 
                            size="md" 
                            fw={isActive ? 700 : isCompleted ? 600 : 500} 
                            c={isActive ? 'dark.9' : isCompleted ? '#22c55e' : 'gray.6'}
                            ff="Inter, sans-serif"
                            lts={-0.2}
                            style={{ 
                              flex: 1,
                            }}
                          >
                            {step.label}
                          </Text>
                          {isActive && (
                            <Text 
                              size="xs" 
                              c="#C8653D" 
                              fw={600}
                              ff="Inter, sans-serif"
                            >
                              {t('regenerateCard.processing')}
                            </Text>
                          )}
                        </Group>
                      );
                    })}
                  </Stack>
                </Box>

                {cardStatus === 'completed' && (
                  <Stack align="center" gap={12} mt={24}>
                    {/* Animated Success Checkmark */}
                    <Box
                      style={{
                        position: 'relative',
                        width: '140px',
                        height: '140px',
                        marginBottom: '8px',
                      }}
                    >
                      {/* Ripple Effects */}
                      {showCelebration && (
                        <>
                          <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px' }} />
                          <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px', animationDelay: '0.3s' }} />
                        </>
                      )}

                      {/* Success Circle with Glow */}
                      <Box
                        ref={checkmarkRef}
                        className="glow-effect"
                        style={{
                          width: '140px',
                          height: '140px',
                          backgroundColor: '#22c55e',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 80 80"
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            className="checkmark-circle"
                          />
                          <path
                            d="M 25 40 L 35 50 L 55 30"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="checkmark-path"
                          />
                        </svg>
                      </Box>

                      {/* Sparkles */}
                      {showCelebration && Array.from({ length: 8 }).map((_, i) => (
                        <Box
                          key={i}
                          className="sparkle"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-70px)`,
                            animationDelay: `${0.5 + i * 0.1}s`,
                          }}
                        />
                      ))}
                    </Box>
                    <Text 
                      size="lg" 
                      fw={600} 
                      c="dark.9" 
                      ta="center"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {t('regenerateCard.cardRegeneratedSuccessfully')}
                    </Text>
                    <Text 
                      size="sm" 
                      c="gray.6" 
                      ta="center"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {t('regenerateCard.newCardReady')}
                    </Text>
                  </Stack>
                )}

                {(regenerateCardMutation.data?.data || cardData) && (
                  <Alert
                    icon={<IconCheck size={16} />}
                    title={t('regenerateCard.newCardDetails')}
                    color="green"
                    variant="light"
                    radius="md"
                    style={{
                      background: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <Stack gap={8}>
                      <Text size="sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>{t('regenerateCard.newAccessCode')}:</strong> {(regenerateCardMutation.data?.data ?? cardData)?.accessCode ?? (regenerateCardMutation.data?.data ?? cardData)?.passcode ?? (regenerateCardMutation.data?.data ?? cardData)?.code}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>{t('regenerateCard.room')}:</strong> {guestData?.unit?.name ?? guestData?.unit?.id ?? ''}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>{t('regenerateCard.status')}:</strong> {(regenerateCardMutation.data?.data ?? cardData)?.status}
                      </Text>
                    </Stack>
                  </Alert>
                )}
              </>
            )}
          </Stack>

          {/* Return Home Button - Only show when completed or error */}
          {(isSuccess || isError) && (
            <Group justify="center" mt={8}>
              <Button
                size="lg"
                leftSection={<IconHome size={20} stroke={2} />}
                onClick={handleReturnHome}
                bg="#C8653D"
                c="white"
                fw={600}
                radius="md"
                px={32}
                py={12}
                h="auto"
                styles={{
                  root: {
                    fontSize: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(200, 101, 61, 0.25)',
                  },
                }}
              >
                {t('common.returnToHome')}
              </Button>
            </Group>
          )}
        </Paper>
      </Container>
  );
};

export default RegenerateCardPage;
