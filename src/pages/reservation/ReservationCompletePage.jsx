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
  Card,
  Divider,
} from '@mantine/core';
import { IconHome, IconCalendar, IconUser, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import '../../styles/animations.css';

const ReservationCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);

  const { reservation, room, guestDetails } = location.state || {};

  useEffect(() => {
    if (!reservation) {
      navigate('/reservation/search');
      return;
    }
  }, [reservation, navigate]);

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleReturnHome = () => {
    navigate('/home');
  };

  // Trigger celebration animation on mount
  useEffect(() => {
    if (reservation) {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [reservation]);

  if (!reservation) {
    return null;
  }

  return (
    <>
      <Container
        size="lg"
        h="100vh"
        style={{ display: 'flex', flexDirection: 'column' }}
        p="md"
        bg="white"
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          w="100%"
          maw={600}
          bg="white"
        >
        <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
              {t('reservationComplete.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
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
            
            {/* Sparkle Particles */}
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

          <Title order={1} c="#0B152A" fw={700} ta="center">
            {t('reservationComplete.success') || 'Reservation Confirmed!'}
          </Title>

          <Text size="lg" fw={600} c="#C8653D">
            {t('reservationComplete.reservationNumber') || 'Reservation Number'}: {reservation.reservationId || reservation.id}
          </Text>

          {/* Reservation Details Card */}
          {(room || guestDetails || reservation.checkIn) && (
            <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
              <Stack gap="md">
                {guestDetails && (
                  <Group gap="sm">
                    <IconUser size={20} color="#C8653D" />
                    <Text size="md" fw={600}>Guest:</Text>
                    <Text size="md">{guestDetails.firstName} {guestDetails.lastName}</Text>
                  </Group>
                )}
                
                {room && (
                  <Group gap="sm">
                    <IconCreditCard size={20} color="#C8653D" />
                    <Text size="md" fw={600}>Room:</Text>
                    <Text size="md">{room.name}</Text>
                  </Group>
                )}
                
                {reservation.checkIn && (
                  <>
                    <Divider />
                    <Group gap="sm">
                      <IconCalendar size={20} color="#C8653D" />
                      <Text size="md" fw={600}>Check-in:</Text>
                      <Text size="md">{formatDate(reservation.checkIn)}</Text>
                    </Group>
                    {reservation.checkOut && (
                      <Group gap="sm">
                        <IconCalendar size={20} color="#C8653D" />
                        <Text size="md" fw={600}>Check-out:</Text>
                        <Text size="md">{formatDate(reservation.checkOut)}</Text>
                      </Group>
                    )}
                  </>
                )}
                
                {reservation.totalAmount && (
                  <>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="md" fw={600}>Total Amount:</Text>
                      <Text size="lg" fw={700} c="#C8653D">
                        {reservation.currency || 'EUR'} {reservation.totalAmount}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Card>
          )}

        </Stack>

        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={handleReturnHome}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            {t('reservationComplete.returnHome')}
          </Button>
        </Group>
      </Paper>
    </Container>
    </>
  );
};

export default ReservationCompletePage;
