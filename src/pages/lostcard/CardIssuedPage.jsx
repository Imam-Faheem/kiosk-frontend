import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Alert,
  Badge,
  Card,
} from '@mantine/core';
import { IconCheck, IconHome, IconMail, IconShield } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import '../../styles/animations.css';

const CardIssuedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const checkmarkRef = useRef(null);
  const isNavigatingRef = useRef(false);
  const countdownIntervalRef = useRef(null);
  
  const guestData = location.state?.guestData;
  const cardData = location.state?.cardData;

  // Log card reissue event
  const logCardReissueMutation = useMutation({
    mutationFn: async (data) => {
      try {
        await apiClient.post('/logs/card-reissue', data);
      } catch (err) {
        console.error('Failed to log card reissue:', err);
      }
    },
  });

  useEffect(() => {
    if (!guestData || !cardData) {
      navigate('/lost-card');
      return;
    }

    // Log card reissue completion (non-blocking)
    const reservationId = guestData?.bookingId ?? guestData?.reservationId ?? guestData?.reservation_id;
    const roomNumber = guestData?.unit?.name ?? guestData?.unit?.id ?? guestData?.roomNumber;
    const guestName = guestData?.primaryGuest 
      ? `${guestData.primaryGuest.firstName} ${guestData.primaryGuest.lastName}`.trim()
      : guestData?.guestName ?? '';
    
    logCardReissueMutation.mutate({
      reservationId: reservationId,
      roomNumber: roomNumber,
      guestName: guestName,
      reissueTime: new Date().toISOString(),
      newCardId: cardData?.cardId ?? cardData?.id,
      oldCardDeactivated: cardData?.oldCardDeactivated ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger celebration animation on mount
  useEffect(() => {
    if (guestData && cardData) {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [guestData, cardData]);

  // Auto-return countdown timer
  useEffect(() => {
    if (!guestData || !cardData) return;

    setCountdown(15);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        if (next <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (!isNavigatingRef.current) {
            isNavigatingRef.current = true;
            navigate('/home', { replace: true });
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [guestData, cardData, navigate]);

  const handleReturnHome = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    // Use React Router navigation for SPA navigation (no page reload)
    navigate('/home', { replace: true });
  };



  if (!guestData || !cardData) {
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
          <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <PropertyHeader />
          </Group>

          {/* Success Content */}
          <Stack gap="lg" mb="xl" align="center">
            {/* Animated Success Checkmark */}
            <Box
              pos="relative"
              w={140}
              h={140}
              mb={8}
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
                w={140}
                h={140}
                bg="#22c55e"
                style={{
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

          {/* Headline */}
          <Stack gap={10} align="center">
            <Title order={1} c="#16a34a" fw={700} ta="center" fz={32} lh={1.3}>
              {t('cardIssued.newCardIssued')}
            </Title>
          </Stack>

          {/* Room Number - Most Prominent */}
          <Card withBorder p={24} radius="md" w="100%" bg="#f0fdf4" style={{ border: '2px solid #16a34a' }}>
            <Stack gap={10} align="center">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5} lh={1.4}>
                {t('cardIssued.roomNumber')}
              </Text>
              <Text size="xl" fw={700} c="#16a34a" fz={36} lh={1.2}>
                {guestData?.unit?.name ?? guestData?.unit?.id ?? guestData?.roomNumber ?? ''}
              </Text>
            </Stack>
          </Card>

          {/* Access Code - Secondary Information */}
          <Card withBorder p={24} radius="md" w="100%" bg="white" style={{ border: '1px solid rgba(22, 163, 74, 0.2)' }}>
            <Stack gap={12}>
              <Text size="sm" fw={600} c="dark.7" lts={0.2} lh={1.4}>
                {t('cardIssued.digitalAccessCode')}
              </Text>
              <Text size="lg" fw={600} c="#16a34a" ff="monospace" lts={2} lh={1.3}>
                {cardData?.accessCode ?? cardData?.passcode ?? cardData?.code ?? ''}
              </Text>
              <Text size="xs" c="dimmed" ta="center" lh={1.6}>
                {t('cardIssued.digitalAccessCodeDescription')}
              </Text>
            </Stack>
          </Card>

          {/* Instruction Text - Clear and Visible */}
          <Box
            p={16}
            bg="rgba(22, 163, 74, 0.05)"
            radius="md"
            w="100%"
            style={{
              border: '1px solid rgba(22, 163, 74, 0.2)',
            }}
          >
            <Text size="md" c="#16a34a" ta="center" fw={600} lh={1.6} lts={0.1}>
              {t('cardIssued.takeCardFromSlot')}
            </Text>
          </Box>

          {/* Old Card Notice with Security Badge */}
          {cardData.oldCardDeactivated && (
            <Alert
              icon={<IconShield size={18} />}
              title={
                <Group gap={8}>
                  <Text size="md" fw={700}>{t('cardIssued.securityNotice')}</Text>
                  <Badge color="green" variant="filled" size="sm">
                    {t('cardIssued.secure')}
                  </Badge>
                </Group>
              }
              color="green"
              variant="light"
              radius={8}
              w="100%"
              bg="#f0fdf4"
            >
              <Stack gap={4}>
                <Text size="sm" fw={500} style={{ lineHeight: 1.5 }}>
                  {t('cardIssued.oldCardDeactivated')}
                </Text>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
                  {t('cardIssued.deactivatedAt', { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) })}
                </Text>
              </Stack>
            </Alert>
          )}

          {/* Digital Key */}
          <Alert
            icon={<IconMail size={20} />}
            title={<Text size="md" fw={700}>{t('cardIssued.digitalKey')}</Text>}
            color="blue"
            variant="light"
            radius={8}
            w="100%"
          >
            <Stack gap={8}>
              <Text size="md" fw={500} style={{ lineHeight: 1.5 }}>
                {t('cardIssued.newKeySentToEmail')}
              </Text>
              <Text size="sm" c="#666666" style={{ lineHeight: 1.5 }}>
                {t('cardIssued.checkEmailForInstructions')}
              </Text>
            </Stack>
          </Alert>

        </Stack>

        {/* Auto-return countdown */}
        <Text size="sm" c="dimmed" ta="center" mt={8}>
          {t('cardIssued.returningToMenu', { countdown, seconds: countdown === 1 ? t('cardIssued.second') : t('cardIssued.seconds') })}
        </Text>

        {/* Return Home Button */}
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
      </Paper>
    </Container>
  );
};

export default CardIssuedPage;
