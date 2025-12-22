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
} from '@mantine/core';
import { IconCheck, IconX, IconKey, IconHome, IconLoader2 } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardMutation } from '../../hooks/useCardMutation';
import UnoLogo from '../../assets/uno.jpg';
import '../../styles/animations.css';

const STEP_DELAY = 2000;

const RegenerateCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('deactivating');
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasProcessedRef = useRef(false);
  const checkmarkRef = useRef(null);

  const guestData = location.state?.guestData;
  const validationData = location.state?.validationData;

  const regenerateCard = useCardMutation('regenerate', {
    onSuccess: (result) => {
      if (result.success) {
        setCardData(result.data);
        setCardStatus('completed');
        setCurrentStep(3);
      }
    },
    onError: (err) => {
      setError(err.message ?? t('error.cardRegenerationFailed'));
      setCardStatus('error');
    }
  });

  const steps = useMemo(() => [
    { label: t('regenerateCard.steps.deactivating'), status: 'deactivating' },
    { label: t('regenerateCard.steps.generating'), status: 'generating' },
    { label: t('regenerateCard.steps.programming'), status: 'programming' },
  ], [t]);

  const guestName = useMemo(() => {
    if (guestData?.guestName) return guestData.guestName;
    const firstName = guestData?.firstName ?? '';
    const lastName = guestData?.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? fullName : '';
  }, [guestData]);

  const cardMutationData = useMemo(() => {
    const getPropertyId = () => {
      if (guestData?.propertyId) return guestData.propertyId;
      if (process.env.REACT_APP_PROPERTY_ID) return process.env.REACT_APP_PROPERTY_ID;
      return 'BER';
    };

    return {
      reservationId: guestData?.reservationId ?? guestData?.reservationNumber,
      roomNumber: guestData?.roomNumber,
      guestName,
      propertyId: getPropertyId(),
    };
  }, [guestData, guestName]);

  const processStep = async (stepIndex, status) => {
    setCurrentStep(stepIndex);
    setCardStatus(status);
    await new Promise(resolve => setTimeout(resolve, STEP_DELAY));
  };

  useEffect(() => {
    if (!guestData || !validationData) {
      navigate('/lost-card');
      return;
    }

    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processCardRegeneration = async () => {
      try {
        await processStep(0, 'deactivating');
        await processStep(1, 'generating');
        await processStep(2, 'programming');
        
        const result = await regenerateCard.mutateAsync(cardMutationData);

        if (result.success) {
          setCardData(result.data);
          await new Promise(resolve => setTimeout(resolve, STEP_DELAY));
          setCardStatus('completed');
          
          // Navigate to card issued page after showing completion
          setTimeout(() => {
            navigate('/lost-card/issued', {
              state: { guestData, cardData: result.data }
            });
          }, 2000);
        } else {
          setError(result.message ?? t('error.cardDispenserError'));
        }
      } catch (err) {
        setError(err.message ?? t('error.cardDispenserError'));
      }
    };

    processCardRegeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {/* Header */}
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Group>
              <Box
                component="img"
                src={UnoLogo}
                alt="UNO Hotel Logo"
                w={50}
                h={50}
                radius="md"
                mr={0}
                style={{
                  objectFit: 'cover',
                }}
              />
              <Title 
                order={2} 
                fz={30}
                c="rgb(34, 34, 34)"
                fw={600}
                lts={1}
                ml={-9}
              >
                UNO HOTELS
              </Title>
            </Group>
          </Group>

          <Stack gap="lg" mb="xl">
            {error ? (
              <Alert
                icon={<IconX size={18} />}
                title="Card Regeneration Error"
                color="red"
                variant="light"
                radius="md"
              >
                <Text size="md" fw={500} ff="Inter, sans-serif">
                  {error}
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
                    {cardStatus === 'completed' ? 'Card Update Complete' : 'Updating Room Access'}
                  </Title>
                  {cardStatus !== 'completed' && (
                    <Text 
                      size="sm" 
                      c="dimmed" 
                      ta="center"
                      maw={500}
                      lh={1.6}
                    >
                      Please wait while we update your access card. Do not remove the card during this process.
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
                      const isPending = index > currentStep;
                      
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
                              Processing...
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
                      Card regenerated successfully!
                    </Text>
                    <Text 
                      size="sm" 
                      c="gray.6" 
                      ta="center"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Your new card is ready.
                    </Text>
                  </Stack>
                )}

                {cardData && (
                  <Alert
                    icon={<IconCheck size={16} />}
                    title="New Card Details"
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
                        <strong>New Access Code:</strong> {cardData.accessCode}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>Room:</strong> {guestData.roomNumber}
                      </Text>
                      <Text size="sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <strong>Status:</strong> {cardData.status}
                      </Text>
                    </Stack>
                  </Alert>
                )}
              </>
            )}
          </Stack>

          {/* Return Home Button - Only show when completed or error */}
          {(cardStatus === 'completed' || error) && (
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
                Return to Home
              </Button>
            </Group>
          )}
        </Paper>
      </Container>
  );
};

export default RegenerateCardPage;
