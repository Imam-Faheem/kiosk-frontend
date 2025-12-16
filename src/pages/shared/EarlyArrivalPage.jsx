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
} from '@mantine/core';
import { IconAlertCircle, IconHome, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../lib/timeUtils';
import { buttonStyles } from '../../constants/style.constants';
import { EARLY_ARRIVAL_CONFIG, EARLY_ARRIVAL_STYLES } from '../../config/constants';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';

const WarningIcon = React.memo(() => (
  <Box style={EARLY_ARRIVAL_STYLES.WARNING_ICON}>
    <IconAlertCircle size={80} color="#FF6B35" />
  </Box>
));
WarningIcon.displayName = 'WarningIcon';

const TimeInfoCard = React.memo(({ currentTime }) => (
  <Paper withBorder p="lg" radius="md" style={EARLY_ARRIVAL_STYLES.TIME_CARD}>
    <Stack gap="md" align="center">
      <Text size="lg" fw={600} c="#0B152A">
        Current time: {currentTime}
      </Text>
      <Text size="lg" fw={600} c="#0B152A">
        Cards available after: {EARLY_ARRIVAL_CONFIG.TARGET_TIME}
      </Text>
    </Stack>
  </Paper>
));
TimeInfoCard.displayName = 'TimeInfoCard';

const CountdownDisplay = React.memo(({ countdown }) => (
  <Box style={EARLY_ARRIVAL_STYLES.COUNTDOWN_BOX}>
    <Text size="md" fw={600} c="white">
      Returning to menu in: {countdown}...
    </Text>
  </Box>
));
CountdownDisplay.displayName = 'CountdownDisplay';

const EarlyArrivalPage = ({ flowType }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => formatTime());
  const [countdown, setCountdown] = useState(EARLY_ARRIVAL_CONFIG.COUNTDOWN_DURATION);
  const countdownIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  const updateTime = useCallback(() => {
    setCurrentTime(formatTime());
  }, []);

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
    navigate('/home');
  }, [navigate, clearAllIntervals]);

  useEffect(() => {
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
  }, [updateTime, handleCountdownComplete, clearAllIntervals]);

  const handleReturnToMenu = useCallback(() => {
    clearAllIntervals();
    navigate('/home');
  }, [navigate, clearAllIntervals]);

  const handleBack = useCallback(() => {
    clearAllIntervals();
    navigate('/home');
  }, [navigate, clearAllIntervals]);

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

  return (
    <Container size="lg" style={EARLY_ARRIVAL_STYLES.CONTAINER}>
      <Paper withBorder shadow="md" p={40} radius="xl" style={EARLY_ARRIVAL_STYLES.PAPER}>
        <Group justify="space-between" mb="xl">
          <Group>
            <img src={UnoLogo} alt="UNO Hotel Logo" style={EARLY_ARRIVAL_STYLES.LOGO} />
            <Title order={1} c="#0B152A" fw={700} style={titleStyle}>
              Early Arrival
            </Title>
          </Group>
        </Group>

        <Stack gap="xl" align="center" mb="xl">
          <WarningIcon />

          <Alert
            icon={<IconClock size={32} />}
            title="Early Arrival"
            color="orange"
            variant="filled"
            style={EARLY_ARRIVAL_STYLES.ALERT}
          >
            <Text size="xl" fw={600} c="white" style={alertTextStyle}>
              Card cannot be given before 2pm. Please return after 2pm.
            </Text>
          </Alert>

          <TimeInfoCard currentTime={currentTime} />

          <CountdownDisplay countdown={countdown} />
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
            Return to Menu
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

