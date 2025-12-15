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
} from '@mantine/core';
import { IconAlertCircle, IconHome, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import UnoLogo from '../../assets/uno.jpg';

const EarlyArrivalPage = ({ flowType }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [countdown, setCountdown] = useState(15);
  const targetTime = "2:00 PM";
  const countdownIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize current time immediately
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    
    updateTime(); // Set initial time

    // Update current time every second
    timeIntervalRef.current = setInterval(updateTime, 1000);

    // Countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [navigate]);

  const handleReturnToMenu = () => {
    // Clear intervals before navigation
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    navigate('/home');
  };

  const handleBack = () => {
    // Clear intervals before navigation
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    navigate('/home');
  };

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
            <Title order={1} c="#0B152A" fw={700} style={{ textTransform: 'uppercase', fontSize: '32px' }}>
              Early Arrival
            </Title>
          </Group>
        </Group>

        {/* Warning Content */}
        <Stack gap="xl" align="center" mb="xl">
          {/* Warning Icon */}
          <Box
            style={{
              fontSize: '80px',
              textAlign: 'center',
              marginBottom: '20px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            }}
          >
            <IconAlertCircle size={80} color="#FF6B35" />
          </Box>

          {/* Warning Alert */}
          <Alert
            icon={<IconClock size={32} />}
            title="Early Arrival"
            color="orange"
            variant="filled"
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '2px solid #FF6B35',
            }}
          >
            <Text 
              size="xl" 
              fw={600} 
              c="white"
              style={{ fontSize: '24px', lineHeight: '1.5' }}
            >
              Card cannot be given before 2pm. Please return after 2pm.
            </Text>
          </Alert>

          {/* Time Information Card */}
          <Paper
            withBorder
            p="lg"
            radius="md"
            style={{
              backgroundColor: '#fff5f0',
              width: '100%',
              border: '2px solid #FF6B35',
            }}
          >
            <Stack gap="md" align="center">
              <Text size="lg" fw={600} c="#0B152A">
                Current time: {currentTime || 'Loading...'}
              </Text>
              <Text size="lg" fw={600} c="#0B152A">
                Cards available after: {targetTime}
              </Text>
            </Stack>
          </Paper>

          {/* Countdown Display */}
          <Box
            style={{
              padding: '16px 24px',
              backgroundColor: '#FF6B35',
              borderRadius: '12px',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <Text size="md" fw={600} c="white">
              Returning to menu in: {countdown}...
            </Text>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack gap="md">
          <Button
            size="xl"
            leftSection={<IconHome size={24} />}
            onClick={handleReturnToMenu}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '18px',
              minHeight: '60px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8552F';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#C8653D';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Return to Menu
          </Button>

          <Group justify="center">
            <BackButton onClick={handleBack} />
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EarlyArrivalPage;

