import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Card,
  Alert,
} from '@mantine/core';
import { IconCheck, IconHome, IconMail, IconCalendar } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';

const CheckInCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(15);
  
  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;
  const cardData = location.state?.cardData;

  // Log completion event
  const logCompletionMutation = useMutation({
    mutationFn: async (data) => {
      try {
        await apiClient.post('/logs/checkin', data);
      } catch (err) {
        console.error('Failed to log check-in completion:', err);
      }
    },
  });

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    // Log check-in completion
    logCompletionMutation.mutate({
      reservationId: reservation.reservationId,
      guestName: reservation.guestName,
      roomNumber: reservation.roomNumber,
      checkInTime: new Date().toISOString(),
      paymentStatus: paymentStatus?.status || 'completed',
      cardIssued: !!cardData,
    });

    // Auto-return to MainMenu after 15s
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [reservation, navigate, logCompletionMutation, paymentStatus, cardData]);

  const handleReturnHome = () => {
    navigate('/home');
  };

  if (!reservation) {
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
          borderRadius: '20px',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Group>
            <Box
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#C8653D',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '0px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('checkInComplete.title')}
            </Title>
          </Group>
        </Group>

        {/* Success Content */}
        <Stack gap="lg" mb="xl" align="center">
          {/* Success Animation */}
          <Box
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: 'green',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              animation: 'bounce 1s infinite',
            }}
          >
            <IconCheck size={60} />
          </Box>

          <Title order={1} c="#0B152A" fw={700} ta="center">
            {t('checkInComplete.success')}
          </Title>

          {/* Room Information */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
            <Stack gap="md">
              <Text size="xl" fw={600} c="#0B152A" ta="center">
                {t('checkInComplete.roomNumber')}: {reservation.roomNumber}
              </Text>
              
              <Group justify="space-between">
                <Text size="md" c="#666666">{t('checkInComplete.checkOut')}:</Text>
                <Text size="md" fw={500}>{reservation.checkOut}</Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="md" c="#666666">Guest:</Text>
                <Text size="md" fw={500}>{reservation.guestName}</Text>
              </Group>
            </Stack>
          </Card>

          {/* Key Information */}
          {cardData && (
            <Alert
              icon={<IconMail size={20} />}
              title="Digital Key"
              color="blue"
              variant="light"
              style={{ borderRadius: '8px', width: '100%' }}
            >
              <Stack gap="xs">
                <Text size="md" fw={500}>
                  {t('checkInComplete.keySent')}
                </Text>
                <Text size="sm" c="#666666">
                  Access Code: {cardData.accessCode}
                </Text>
                <Text size="sm" c="#666666">
                  Check your email for detailed instructions.
                </Text>
              </Stack>
            </Alert>
          )}

          {/* Welcome Message */}
          <Text size="lg" fw={600} c="#0B152A" ta="center">
            {t('checkInComplete.enjoyStay')}
          </Text>

          {/* Auto-return countdown */}
          <Text size="sm" c="#666666" ta="center">
            Returning to main menu in {countdown} seconds...
          </Text>
        </Stack>

        {/* Return Home Button */}
        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={handleReturnHome}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
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
            {t('checkInComplete.returnHome')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default CheckInCompletePage;
