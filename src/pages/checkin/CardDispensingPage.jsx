import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Title,
  Stack,
  Box,
  Stepper,
  Alert,
  Badge,
} from '@mantine/core';
import { 
  IconCreditCard, 
  IconMail, 
  IconLock, 
  IconCircleCheck,
  IconLoader2,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardMutation } from '../../hooks/useCardMutation';
import { useCheckInMutation } from '../../hooks/useCheckInMutation';
import { CARD_DISPENSING_STEPS, STEP_ICONS } from '../../config/constants';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import '../../styles/animations.css';

const CardDispensingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const processCheckIn = useCheckInMutation('process', {
    onError: (err) => {
      // Check-in error - continue with card issuance
    }
  });
  const issueCard = useCardMutation('issue', {
    onError: (err) => {
      setError(err.message ?? t('error.cardIssuanceFailed'));
      setCardStatus('error');
    }
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('preparing');
  const [error, setError] = useState(null);
  const hasProcessedRef = useRef(false);

  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;
  const cardData = location.state?.cardData; // Card data from ProcessCheckInPage
  const reservationId = location.state?.reservationId;

  const steps = useMemo(() => 
    CARD_DISPENSING_STEPS.map(step => ({
      ...step,
      label: t(step.labelKey) ?? step.defaultLabel,
      description: t(`${step.labelKey}.description`) ?? step.description,
      icon: STEP_ICONS[step.iconKey],
    })), [t]
  );

  const statusMessage = useMemo(() => {
    const messages = {
      preparing: {
        title: t('cardDispensing.status.preparing.title'),
        description: t('cardDispensing.status.preparing.description'),
      },
      encoding: {
        title: t('cardDispensing.status.encoding.title'),
        description: t('cardDispensing.status.encoding.description'),
      },
      sending: {
        title: t('cardDispensing.status.sending.title'),
        description: t('cardDispensing.status.sending.description'),
      },
      completed: {
        title: t('cardDispensing.status.completed.title'),
        description: t('cardDispensing.status.completed.description'),
      },
    };
    return messages[cardStatus] ?? messages.preparing;
  }, [cardStatus, t]);

  useEffect(() => {
    if (!reservation && !cardData) {
      navigate('/checkin');
      return;
    }

    // If cardData is already provided (from ProcessCheckInPage), just show the dispensing flow
    if (cardData) {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      const showCardDispensing = async () => {
        try {
          // Step 1: Preparing
          setCurrentStep(0);
          setCardStatus('preparing');
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 2: Encoding
          setCurrentStep(1);
          setCardStatus('encoding');
          
          // Check for hardware errors
          if (cardData.hardware && !cardData.hardware.success) {
            const errorMessage = cardData.hardware.userFriendlyMessage ?? cardData.hardware.error ?? t('error.cardDispenserError');
            setError(errorMessage);
            setCardStatus('error');
            
            // Still navigate to complete page but with error
            setTimeout(() => {
              navigate('/checkin/complete', {
                state: { 
                  reservation, 
                  reservationId,
                  paymentStatus, 
                  cardData,
                  error: errorMessage,
                }
              });
            }, 3000);
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 2000));

          // Step 3: Sending
          setCurrentStep(2);
          setCardStatus('sending');
          await new Promise(resolve => setTimeout(resolve, 2000));

          setCardStatus('completed');
          setTimeout(() => {
            navigate('/checkin/complete', {
              state: { 
                reservation, 
                reservationId,
                paymentStatus, 
                cardData,
              }
            });
          }, 2000);
        } catch (err) {
          setError(err.message ?? t('error.cardDispenserError'));
        }
      };

      showCardDispensing();
      return;
    }

    // Legacy flow: if no cardData, process check-in and issue card
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processCard = async () => {
      try {
        // Step 1: Check-in
        setCurrentStep(0);
        setCardStatus('preparing');
        
        let checkInResult = null;
        try {
          checkInResult = await processCheckIn.mutateAsync({
            reservation_id: reservation.reservation_id ?? reservation.reservationId ?? reservation.id,
            guest_email: reservation.guest_email ?? reservation.email ?? reservation.guestEmail,
            guest_phone: reservation.guest_phone ?? reservation.phone ?? reservation.guestPhone,
            guest_name: {
              first_name: reservation.guest_name?.first_name ?? reservation.firstName ?? '',
              last_name: reservation.guest_name?.last_name ?? reservation.lastName ?? '',
            },
            check_in_date: reservation.check_in_date ?? reservation.checkIn ?? reservation.checkInDate ?? new Date().toISOString(),
            check_out_date: reservation.check_out_date ?? reservation.checkOut ?? reservation.checkOutDate,
            room_number: reservation.room_number ?? reservation.roomNumber,
            confirmation_code: reservation.confirmation_code ?? reservation.confirmationCode,
          });
        } catch (err) {
          // Check-in error - continue with card issuance
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Issue card
        setCurrentStep(1);
        setCardStatus('encoding');
        
        const result = await issueCard.mutateAsync({
          reservationId: reservation.reservation_id ?? reservation.reservationId ?? reservation.id,
          roomNumber: checkInResult?.data?.room_number ?? reservation.room_number ?? reservation.roomNumber ?? reservation.roomType ?? t('common.notAvailable'),
          guestName: (() => {
            if (reservation.guest_name) {
              if (typeof reservation.guest_name === 'string') {
                return reservation.guest_name;
              }
              const firstName = reservation.guest_name.first_name ?? '';
              const lastName = reservation.guest_name.last_name ?? '';
              const fullName = `${firstName} ${lastName}`.trim();
              return fullName ?? t('common.guest');
            }
            return reservation.guestName ?? t('common.guest');
          })(),
          email: reservation.guest_email ?? reservation.email ?? reservation.guestEmail
        });

        if (!result.success) {
          setError(t('error.cardDispenserError'));
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Sending
        setCurrentStep(2);
        setCardStatus('sending');
        await new Promise(resolve => setTimeout(resolve, 2000));

        setCardStatus('completed');
        setTimeout(() => {
          navigate('/checkin/complete', {
            state: { reservation, paymentStatus, cardData: result.data, checkInResult }
          });
        }, 5000);
      } catch (err) {
        setError(err.message ?? t('error.cardDispenserError'));
      }
    };

    processCard();
  }, [reservation, paymentStatus, cardData, reservationId, navigate, t, processCheckIn, issueCard]);

  const handleBack = () => {
    navigate('/checkin');
  };

  if (!reservation && !cardData) {
    return null;
  }

  const getStatusTextProps = () => {
    const isSending = cardStatus === 'sending';
    const isCompleted = cardStatus === 'completed';
    const isHighlighted = isSending ? true : isCompleted;
    
    return {
      size: isCompleted ? 'md' : 'sm',
      fw: isHighlighted ? 700 : 600,
      c: isSending ? '#C8653D' : isCompleted ? '#22c55e' : 'dark.9',
      gap: isSending ? 12 : 8,
      maw: isSending ? 420 : 400,
    };
  };

  const statusTextProps = getStatusTextProps();

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

        {/* Content */}
          <Stack gap={32}>
          {error ? (
            <Alert
              icon={<IconCreditCard size={20} />}
                title={t('error.title')}
              color="red"
              variant="light"
                radius="md"
                styles={{ root: { border: '1px solid rgba(250, 82, 82, 0.2)' } }}
            >
                <Text size="md" fw={500} c="red.7">
                {error}
              </Text>
                <Text size="sm" c="dimmed" mt={8}>
                  {t('paymentCheck.pleaseTryAgainOrContact')}
                </Text>
            </Alert>
          ) : (
            <>
                {/* Enhanced Stepper */}
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
                      stepDescription: { 
                        fontSize: '14px',
                        marginTop: 6,
                        color: '#666666',
                        lineHeight: 1.5,
                      },
                      separator: {
                        backgroundColor: '#C8653D',
                        transition: 'background-color 0.4s ease',
                      },
                      step: {
                        paddingBottom: 24,
                      },
                    }}
                  >
                    {steps.map((step, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      const isPending = index > currentStep;
                      const StepIcon = step.icon;
                      
                      return (
                        <Stepper.Step
                          key={step.key}
                          label={step.label}
                          description={step.description}
                          icon={
                            isCompleted ? <IconCircleCheck size={22} stroke={2.5} /> :
                            isActive ? <IconLoader2 size={22} className="spin-animation" style={{ color: '#C8653D' }} /> :
                            <StepIcon size={20} />
                          }
                          styles={{
                            stepIcon: {
                              borderColor: isActive ? '#C8653D' : isCompleted ? '#C8653D' : '#e0e0e0',
                              backgroundColor: isActive ? 'rgba(200, 101, 61, 0.1)' : isCompleted ? '#C8653D' : isPending ? '#f5f5f5' : '#ffffff',
                              transition: 'all 0.3s ease',
                              transform: isActive ? 'scale(1.05)' : 'scale(1)',
                              borderWidth: isActive ? '2px' : '1px',
                            },
                            stepLabel: {
                              fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                              color: isActive ? '#C8653D' : isCompleted ? '#22c55e' : '#666666',
                            },
                            stepDescription: {
                              color: isActive ? '#333333' : isCompleted ? '#666666' : '#999999',
                            },
                          }}
                        />
                      );
                    })}
                  </Stepper>
                </Box>

                {/* Main Status Display */}
                <Stack align="center" gap={24} mt={16}>
                  {/* Card/Status Icon */}
                  <Box
                    w={cardStatus === 'sending' ? 140 : 120}
                    h={cardStatus === 'sending' ? 140 : 100}
                    bg={cardStatus === 'completed' ? '#22c55e' : '#C8653D'}
                    style={{
                      borderRadius: cardStatus === 'sending' ? '20px' : '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: cardStatus === 'sending' 
                        ? '0 8px 24px rgba(200, 101, 61, 0.25)' 
                        : '0 4px 16px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {cardStatus === 'completed' ? <IconCircleCheck size={48} stroke={2.5} /> :
                     cardStatus === 'sending' ? <IconMail size={56} stroke={2} /> :
                     <IconCreditCard size={40} stroke={2} />}
                  </Box>

                  {/* Status Messages */}
                  {statusMessage && (
                    <Stack align="center" gap={statusTextProps.gap}>
                      <Text 
                        size="xl" 
                        fw={statusTextProps.fw} 
                        c={statusTextProps.c} 
                        ta="center"
                        style={cardStatus === 'sending' ? { letterSpacing: '0.3px', textShadow: '0 2px 4px rgba(200, 101, 61, 0.1)' } : undefined}
                      >
                        {statusMessage.title}
                      </Text>
                      <Text size={statusTextProps.size} c="dimmed" ta="center" maw={statusTextProps.maw}>
                        {statusMessage.description}
                      </Text>
                      {cardStatus === 'sending' && (
                        <Badge 
                          size="lg" 
                          variant="light" 
                          color="orange"
                          mt={4}
                          styles={{ root: { padding: '6px 16px', fontSize: '12px', fontWeight: 500 } }}
                        >
                          <IconMail size={14} style={{ marginRight: 6 }} />
                          {reservation.guest_email ?? reservation.email ?? t('cardDispensing.yourEmail')}
                        </Badge>
                      )}
                    </Stack>
                  )}
              </Stack>
            </>
          )}
        </Stack>

        {/* Back Button */}
        <Group justify="flex-start" mt={32}>
          <BackButton onClick={handleBack} text={t('common.back')} />
        </Group>
      </Paper>
    </Container>
  );
};

export default CardDispensingPage;
