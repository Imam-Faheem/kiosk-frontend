import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  Card,
} from '@mantine/core';
import { IconAlertCircle, IconHome, IconClock } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buttonStyles } from '../../constants/style.constants';
import { EARLY_ARRIVAL_CONFIG, EARLY_ARRIVAL_STYLES } from '../../config/constants';
import { EARLY_ARRIVAL_FLOW_CONFIGS } from '../../config/routes';
import BackButton from '../../components/BackButton';
import PropertyHeader from '../../components/PropertyHeader';
import UnoLogo from '../../assets/uno.jpg';
import useLanguage from '../../hooks/useLanguage';

const getFlowTypeFromPath = (pathname) => {
  if (pathname.includes('/checkin/early-arrival')) return 'checkin';
  if (pathname.includes('/reservation/early-arrival')) return 'reservation';
  if (pathname.includes('/lost-card/early-arrival')) return 'lost-card';
  return 'checkin';
};

const WarningIcon = React.memo(() => (
  <Box style={EARLY_ARRIVAL_STYLES.WARNING_ICON}>
    <IconAlertCircle size={80} color="#FF6B35" />
  </Box>
));
WarningIcon.displayName = 'WarningIcon';

const TimeInfoCard = React.memo(({ currentTime, t }) => (
  <Paper withBorder p="lg" radius="md" style={EARLY_ARRIVAL_STYLES.TIME_CARD}>
    <Stack gap="md" align="center">
      <Text size="lg" fw={600} c="#0B152A">
        {t('earlyArrival.currentTime', { time: currentTime })}
      </Text>
      <Text size="lg" fw={600} c="#0B152A">
        {t('earlyArrival.cardsAvailableAfter', { 
          time: typeof EARLY_ARRIVAL_CONFIG.CHECKIN_TIME === 'number' 
            ? `${EARLY_ARRIVAL_CONFIG.CHECKIN_TIME}:00` 
            : EARLY_ARRIVAL_CONFIG.CHECKIN_TIME 
        })}
      </Text>
    </Stack>
  </Paper>
));
TimeInfoCard.displayName = 'TimeInfoCard';

const CountdownDisplay = React.memo(({ countdown, t }) => (
  <Box style={EARLY_ARRIVAL_STYLES.COUNTDOWN_BOX}>
    <Text size="md" fw={600} c="white">
      {t('earlyArrival.returningToMenu', { countdown })}
    </Text>
  </Box>
));
CountdownDisplay.displayName = 'CountdownDisplay';

const EarlyArrivalPage = ({ flowType: propFlowType, title, message, backPath, returnPath = '/home' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const detectedFlowType = useMemo(() => {
    return propFlowType || getFlowTypeFromPath(location.pathname);
  }, [propFlowType, location.pathname]);
  
  const flowConfig = useMemo(() => {
    return EARLY_ARRIVAL_FLOW_CONFIGS[detectedFlowType] || EARLY_ARRIVAL_FLOW_CONFIGS.checkin;
  }, [detectedFlowType]);
  
  const pageTitle = title || flowConfig.title;
  const pageMessage = message || flowConfig.message;
  const defaultBackPath = backPath || flowConfig.backPath;
  
  const formatTime = useCallback((date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const [currentTime, setCurrentTime] = useState(() => formatTime());
  const [countdown, setCountdown] = useState(EARLY_ARRIVAL_CONFIG.COUNTDOWN_DURATION);
  const countdownIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);
  
  const isBeforeTargetTime = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const targetHour = typeof EARLY_ARRIVAL_CONFIG.CHECKIN_TIME === 'number' 
      ? EARLY_ARRIVAL_CONFIG.CHECKIN_TIME 
      : parseInt(EARLY_ARRIVAL_CONFIG.CHECKIN_TIME.split(':')[0], 10);
    return currentHour < targetHour;
  }, []);

  const reservationSummary = useMemo(() => {
    if (detectedFlowType !== 'reservation') return null;
    const reservation = location.state?.reservation;
    const reservationId = location.state?.reservationId ?? reservation?.id ?? reservation?.bookingId ?? reservation?.reservationId;
    const room = location.state?.room;
    const guestDetails = location.state?.guestDetails;
    const payment = location.state?.payment ?? location.state?.paymentStatus ?? null;
    const unitName = reservation?.unit?.name ?? reservation?.unit?.id ?? reservation?.roomNumber ?? room?.unit?.name ?? room?.name ?? null;

    if (!reservationId && !unitName && !guestDetails && !payment) return null;

    return {
      reservationId: reservationId ? String(reservationId) : null,
      unitName: unitName ? String(unitName) : null,
      guestName: guestDetails ? `${guestDetails.firstName ?? ''} ${guestDetails.lastName ?? ''}`.trim() : null,
      checkIn: reservation?.arrival ?? reservation?.checkIn ?? location.state?.searchCriteria?.checkIn ?? null,
      checkOut: reservation?.departure ?? reservation?.checkOut ?? location.state?.searchCriteria?.checkOut ?? null,
      payment,
    };
  }, [detectedFlowType, location.state]);

  const updateTime = useCallback(() => {
    setCurrentTime(formatTime());
  }, [formatTime]);

  const clearAllIntervals = useCallback(() => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleCountdownComplete = useCallback(() => {
    clearAllIntervals();
    navigate(returnPath);
  }, [navigate, clearAllIntervals, returnPath]);

  useEffect(() => {
    if (detectedFlowType === 'reservation') {
      return;
    }

    timeIntervalRef.current = setInterval(updateTime, EARLY_ARRIVAL_CONFIG.TIME_UPDATE_INTERVAL);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleCountdownComplete();
          return 0;
        }
        return prev - 1;
      });
    }, EARLY_ARRIVAL_CONFIG.COUNTDOWN_INTERVAL);

    return clearAllIntervals;
  }, [updateTime, handleCountdownComplete, clearAllIntervals, detectedFlowType]);

  const handleReturnToMenu = useCallback(() => {
    clearAllIntervals();
    navigate(returnPath);
  }, [navigate, clearAllIntervals, returnPath]);

  const handleBack = useCallback(() => {
    clearAllIntervals();
    navigate(defaultBackPath);
  }, [navigate, clearAllIntervals, defaultBackPath]);

  const buttonStyle = useMemo(() => ({
    backgroundColor: buttonStyles.base.backgroundColor,
    color: buttonStyles.base.color,
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '18px',
    minHeight: '60px',
    transition: 'all 0.3s ease',
  }), []);

  const handleButtonHover = useCallback((e, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.backgroundColor = buttonStyles.hover.backgroundColor;
      e.currentTarget.style.transform = buttonStyles.hover.transform;
    } else {
      e.currentTarget.style.backgroundColor = buttonStyles.base.backgroundColor;
      e.currentTarget.style.transform = buttonStyles.normal.transform;
    }
  }, []);

  const alertTextStyle = useMemo(() => ({
    fontSize: '24px',
    lineHeight: '1.5',
  }), []);

  const titleStyle = useMemo(() => ({
    textTransform: 'uppercase',
    fontSize: '32px',
  }), []);

  if (detectedFlowType === 'reservation' || detectedFlowType === 'checkin') {
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

          <Stack gap={32} align="center">
            <Box
              w={80}
              h={80}
              bg="#C8653D"
              style={{ 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                preserveAspectRatio="xMidYMid meet"
                style={{
                  display: 'block',
                  margin: 0,
                  padding: 0,
                }}
              >
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                <path d="M12 7v5l3 3"></path>
              </svg>
            </Box>

            <Stack gap="md" align="center" ta="center">
              <Title order={1} fw={700} c="#222222" size="h2" mb="xs">
                {t('earlyArrival.importantInformation')}
              </Title>
              <Title order={2} fw={700} c="#222222" size="h3" mb="xl">
                {t('earlyArrival.keyCardCollection')}
              </Title>

              <Text
                size="md"
                c="#666666"
                lh={1.6}
                mb="md"
              >
                {t('earlyArrival.earlyCheckInMessage')}
              </Text>
            </Stack>

            <Button
              size="lg"
              onClick={() => {
                if (isBeforeTargetTime) {
                  handleReturnToMenu();
                  return;
                }
                
                const state = location.state ?? {};
                if (detectedFlowType === 'reservation') {
                  // Booking + payment already happened. Now proceed to check-in when allowed.
                  navigate('/checkin/process', { state });
                } else if (detectedFlowType === 'checkin') {
                  navigate('/checkin/card-dispensing', { state });
                } else {
                  handleReturnToMenu();
                }
              }}
              fullWidth
              bg="#C8653D"
              c="white"
              radius="md"
              fw={700}
              mt="xl"
              style={{ minHeight: '60px' }}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#B8552F',
                  transform: 'scale(1.02)',
                },
              }}
            >
              {isBeforeTargetTime 
                ? t('earlyArrival.returnToMainMenu')
                : detectedFlowType === 'reservation' 
                  ? t('common.continue') 
                  : detectedFlowType === 'checkin' 
                    ? t('common.continue') 
                    : t('earlyArrival.returnToMainMenu')}
            </Button>

            {/* Reservation summary (only for reservation flow) */}
            {reservationSummary && (
              <Card withBorder p="lg" radius="md" w="100%" bg="#f8f9fa" style={{ marginTop: 12 }}>
                <Stack gap={8}>
                  {reservationSummary.reservationId && (
                    <Group justify="space-between">
                      <Text fw={600}>{t('reservationComplete.reservationNumber') ?? 'Reservation Number'}:</Text>
                      <Text fw={700} c="#C8653D">{reservationSummary.reservationId}</Text>
                    </Group>
                  )}
                  {reservationSummary.unitName && (
                    <Group justify="space-between">
                      <Text fw={600}>{t('reservationComplete.roomNumber') ?? 'Room'}:</Text>
                      <Text fw={700}>{reservationSummary.unitName}</Text>
                    </Group>
                  )}
                  {reservationSummary.guestName && (
                    <Group justify="space-between">
                      <Text fw={600}>{t('reservationComplete.guest') ?? 'Guest'}:</Text>
                      <Text fw={600}>{reservationSummary.guestName}</Text>
                    </Group>
                  )}
                  {reservationSummary.payment && (
                    <Group justify="space-between">
                      <Text fw={600}>{t('paymentCheck.amountPaid') ?? 'Payment'}:</Text>
                      <Text fw={700} c="green">
                        {(reservationSummary.payment.currency ?? 'EUR')} {(reservationSummary.payment.amount ?? 0).toFixed ? reservationSummary.payment.amount.toFixed(2) : reservationSummary.payment.amount ?? 0}
                      </Text>
                    </Group>
                  )}
                  <Text size="sm" c="dimmed" mt={8}>
                    {t('earlyArrival.earlyCheckInMessage') ?? 'Please come back after 2:00 PM to complete check-in.'}
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" style={EARLY_ARRIVAL_STYLES.CONTAINER}>
      <Paper withBorder shadow="md" p={40} radius="xl" style={EARLY_ARRIVAL_STYLES.PAPER}>
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Group>
            <img src={UnoLogo} alt={t('common.unoHotelLogo')} style={EARLY_ARRIVAL_STYLES.LOGO} />
            <Title order={1} c="#0B152A" fw={700} style={titleStyle}>
              {pageTitle}
            </Title>
          </Group>
        </Group>

        <Stack gap="xl" align="center" mb="xl">
          <WarningIcon />

          <Alert
            icon={<IconClock size={32} />}
            title={pageTitle}
            color="orange"
            variant="filled"
            style={EARLY_ARRIVAL_STYLES.ALERT}
          >
            <Text size="xl" fw={600} c="white" style={alertTextStyle}>
              {pageMessage}
            </Text>
          </Alert>

          <TimeInfoCard currentTime={currentTime} t={t} />

          <CountdownDisplay countdown={countdown} t={t} />
        </Stack>

        {/* Action Buttons */}
        <Stack gap="md">
          <Button
            size="xl"
            leftSection={<IconHome size={24} />}
            onClick={handleReturnToMenu}
            style={buttonStyle}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
          >
            {t('earlyArrival.returnToMenu')}
          </Button>

          <Group justify="flex-start">
            <BackButton onClick={handleBack} />
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EarlyArrivalPage;

