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
import { processCheckIn } from '../../services/checkinService';
import { CARD_DISPENSING_STEPS, CARD_STATUS_MESSAGES } from '../../config/constants';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';

const STEP_ICONS = {
  creditCard: IconCreditCard,
  lock: IconLock,
  mail: IconMail,
};

const CardDispensingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const issueCard = useCardMutation('issue', {
    onError: (err) => {
      setError(err.message || t('error.cardIssuanceFailed'));
      setCardStatus('error');
    }
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [cardStatus, setCardStatus] = useState('preparing');
  const [error, setError] = useState(null);
  const hasProcessedRef = useRef(false);

  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;

  const steps = useMemo(() => 
    CARD_DISPENSING_STEPS.map(step => ({
      ...step,
      label: t(step.labelKey) || step.defaultLabel,
      icon: STEP_ICONS[step.iconKey],
    })), [t]
  );

  const statusMessage = useMemo(() => CARD_STATUS_MESSAGES[cardStatus], [cardStatus]);

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processCard = async () => {
      try {
        // Step 1: Check-in
        setCurrentStep(0);
        setCardStatus('preparing');
        
        let checkInResult = null;
        try {
          checkInResult = await processCheckIn({
            reservation_id: reservation.reservationId || reservation.id,
            guest_email: reservation.email || reservation.guestEmail,
            guest_phone: reservation.phone || reservation.guestPhone,
            guest_name: {
              first_name: reservation.firstName || reservation.guest_name?.first_name || '',
              last_name: reservation.lastName || reservation.guest_name?.last_name || '',
            },
            check_in_date: reservation.checkIn || reservation.check_in_date || new Date().toISOString(),
            check_out_date: reservation.checkOut || reservation.check_out_date,
            room_number: reservation.roomNumber || reservation.room_number,
            confirmation_code: reservation.confirmationCode || reservation.confirmation_code,
          });
        } catch (err) {
          // Check-in error - continue with card issuance
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Issue card
        setCurrentStep(1);
        setCardStatus('encoding');
        
        const result = await issueCard.mutateAsync({
          reservationId: reservation.reservationId || reservation.id,
          roomNumber: checkInResult?.data?.room_number || reservation.roomNumber || reservation.room_number || reservation.roomType || 'TBD',
          guestName: reservation.guestName || `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim() || 'Guest',
          email: reservation.email || reservation.guest_email
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
        setError(err.message || t('error.cardDispenserError'));
      }
    };

    processCard();
  }, [reservation, paymentStatus, navigate, t, issueCard]);

  const handleBack = () => {
    navigate('/checkin');
  };

  if (!reservation) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .secure-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid rgba(200, 101, 61, 0.15);
        }
      `}</style>
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
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
            maxWidth: '720px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
          }}
        >
          {/* Header */}
          <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Group>
              <img
                src={UnoLogo}
                alt="UNO Hotel Logo"
                width={50}
                height={50}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
              />
              <Title 
                order={2} 
                fw={800}
                c="rgb(34, 34, 34)"
                style={{ 
                  fontSize: '30px',
                  letterSpacing: '1px',
                  marginLeft: '-9px',
                  fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
                }}
              >
                UNO HOTELS
              </Title>
            </Group>
          </Group>

        {/* Content */}
          <Stack gap={32}>
          {error ? (
            <Alert
              icon={<IconCreditCard size={20} />}
                title="Processing Error"
              color="red"
              variant="light"
                radius="md"
                styles={{ root: { border: '1px solid rgba(250, 82, 82, 0.2)' } }}
            >
                <Text size="md" fw={500} c="red.7">
                {error}
              </Text>
                <Text size="sm" c="dimmed" mt={8}>
                  Please try again or contact front desk for assistance.
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
                    styles={{
                      stepBody: { marginTop: 12 },
                      stepLabel: { 
                        fontSize: '15px',
                        fontWeight: currentStep === 2 ? 600 : 500,
                        color: currentStep === 2 ? '#222222' : undefined,
                      },
                      stepDescription: { 
                        fontSize: '13px',
                        marginTop: 4,
                        color: currentStep === 2 ? '#666666' : '#999999',
                      },
                      separator: {
                        backgroundColor: currentStep >= 2 ? '#C8653D' : '#e0e0e0',
                        transition: 'background-color 0.4s ease',
                      },
                    }}
                  >
                    {steps.map((step, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      const StepIcon = step.icon;
                      
                      return (
                        <Stepper.Step
                          key={step.key}
                          label={step.label}
                          description={step.description}
                          icon={
                            isCompleted ? <IconCircleCheck size={20} stroke={2.5} /> :
                            isActive ? <IconLoader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#C8653D' }} /> :
                            <StepIcon size={18} />
                          }
                          styles={{
                            stepIcon: {
                              borderColor: isActive || isCompleted ? '#C8653D' : '#e0e0e0',
                              backgroundColor: isActive ? 'rgba(200, 101, 61, 0.1)' : isCompleted ? '#C8653D' : '#f5f5f5',
                              transition: 'all 0.3s ease',
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
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
                    <Stack align="center" gap={cardStatus === 'sending' ? 12 : 8}>
                      <Text 
                        size="xl" 
                        fw={cardStatus === 'sending' || cardStatus === 'completed' ? 700 : 600} 
                        c={cardStatus === 'sending' ? '#C8653D' : cardStatus === 'completed' ? '#22c55e' : 'dark.9'} 
                        ta="center"
                        style={cardStatus === 'sending' ? { letterSpacing: '0.3px', textShadow: '0 2px 4px rgba(200, 101, 61, 0.1)' } : undefined}
                      >
                        {statusMessage.title}
                      </Text>
                      <Text size={cardStatus === 'completed' ? 'md' : 'sm'} c="dimmed" ta="center" maw={cardStatus === 'sending' ? 420 : 400}>
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
                          {reservation.email || reservation.guest_email || 'your email'}
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
    </>
  );
};

export default CardDispensingPage;
