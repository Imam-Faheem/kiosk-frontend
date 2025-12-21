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
import { IconCheck, IconX, IconKey, IconHome } from '@tabler/icons-react';
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
      setError(err.message || t('error.cardRegenerationFailed'));
      setCardStatus('error');
    }
  });

  const steps = useMemo(() => [
    { label: t('regenerateCard.steps.deactivating'), status: 'deactivating' },
    { label: t('regenerateCard.steps.generating'), status: 'generating' },
    { label: t('regenerateCard.steps.programming'), status: 'programming' },
  ], [t]);

  const guestName = useMemo(() => 
    guestData?.guestName || `${guestData?.firstName || ''} ${guestData?.lastName || ''}`.trim(),
    [guestData]
  );

  const cardMutationData = useMemo(() => ({
    reservationId: guestData?.reservationId || guestData?.reservationNumber,
    roomNumber: guestData?.roomNumber,
    guestName,
    propertyId: guestData?.propertyId || process.env.REACT_APP_PROPERTY_ID || 'BER',
  }), [guestData, guestName]);

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
          setError(result.message || t('error.cardDispenserError'));
        }
      } catch (err) {
        setError(err.message || t('error.cardDispenserError'));
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
    <>
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
          <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Group>
              <Box
                component="img"
                src={UnoLogo}
                alt="UNO Hotel Logo"
                w={50}
                h={50}
                radius="md"
                style={{ objectFit: 'cover' }}
              />
              <Title 
                order={2}
                fz={30}
                c="dark.9"
                fw={600}
                ml={-9}
                style={{ letterSpacing: '1px' }}
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
                <Text size="md" fw={500} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {error}
                </Text>
              </Alert>
            ) : (
              <>
                <Stack gap={24}>
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    
                    const getStepIcon = () => {
                      if (isCompleted) {
                        return <IconCheck size={20} color="#22c55e" stroke={2.5} />;
                      }
                      if (isActive) {
                        if (step.status === 'deactivating') {
                          return (
                            <Box pos="relative" w={20} h={20}>
                              <Box
                                pos="absolute"
                                w={20}
                                h={20}
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
                                w={8}
                                h={8}
                                bg="#C8653D"
                                style={{ borderRadius: '50%' }}
                              />
                            </Box>
                          );
                        } else if (step.status === 'generating') {
                          return (
                            <Box w={20} h={20}>
                              <svg width="20" height="20" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                <path
                                  d="M 4 10 L 8 6 L 12 10 L 16 6"
                                  fill="none"
                                  stroke="#C8653D"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="animated-line"
                                />
                              </svg>
                            </Box>
                          );
                        } else {
                          return (
                            <Box w={20} h={20}>
                              <svg width="20" height="20" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                <rect
                                  x="4"
                                  y="6"
                                  width="12"
                                  height="8"
                                  fill="none"
                                  stroke="#C8653D"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  className="animated-line"
                                />
                                <path
                                  d="M 8 10 L 10 12 L 12 10"
                                  fill="none"
                                  stroke="#C8653D"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="animated-line"
                                />
                              </svg>
                            </Box>
                          );
                        }
                      }
                      return (
                        <IconKey size={20} color="#d1d5db" stroke={1.5} />
                      );
                    };
                    
                    return (
                      <Box key={index}>
                        <Group justify="space-between" mb={8}>
                          <Text 
                            size="md" 
                            fw={isActive ? 600 : isCompleted ? 500 : 400} 
                            c={isActive ? 'dark.9' : isCompleted ? 'dark.7' : 'gray.6'}
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              letterSpacing: '-0.2px',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {step.label}
                          </Text>
                          {getStepIcon()}
                        </Group>
                        {isActive && (
                          <Box mt={12} className="glow-loading-line" />
                        )}
                      </Box>
                    );
                  })}
                </Stack>

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

          <Group justify="center">
            <Button
              size="lg"
              leftSection={<IconHome size={20} stroke={2} />}
              onClick={handleReturnHome}
              bg="#C8653D"
              c="white"
              fw={600}
              styles={{
                root: {
                  borderRadius: '12px',
                  fontSize: '16px',
                  padding: '12px 32px',
                  height: 'auto',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(200, 101, 61, 0.25)',
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B8552F';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 101, 61, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#C8653D';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 101, 61, 0.25)';
              }}
            >
              Return to Home
            </Button>
          </Group>
        </Paper>
      </Container>
    </>
  );
};

export default RegenerateCardPage;
