import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  Loader,
  Divider,
} from '@mantine/core';
import { 
  IconHome, 
  IconCalendar, 
  IconCreditCard,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { getCheckInStatus } from '../../services/checkinService';
import { formatCheckOut, calculateDisplayData } from '../../lib/checkinUtils';
import UnoLogo from '../../assets/uno.jpg';
import '../../styles/animations.css';

const CheckInCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(15);
  const [loading, setLoading] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);
  
  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;
  const cardData = location.state?.cardData;
  const checkInResult = location.state?.checkInResult;

  // Calculate display data from all available sources
  const displayData = useMemo(() => 
    calculateDisplayData(reservation, checkInData, checkInResult),
    [reservation, checkInData, checkInResult]
  );

  // Log completion event
  const logCompletionMutation = useMutation({
    mutationFn: async (data) => {
      try {
        await apiClient.post('/logs/checkin', data);
      } catch (err) {
        // Failed to log check-in completion
      }
    },
  });

  // Fetch check-in details on mount
  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    // Fetch check-in status if we have a reservation ID but no check-in data
    const fetchCheckInDetails = async () => {
      const reservationId = reservation.reservationId ?? reservation.id;
      if (reservationId && !checkInResult?.data && !checkInData) {
        try {
          setLoading(true);
          const statusResult = await getCheckInStatus(reservationId);
          if (statusResult.success) {
            setCheckInData(statusResult.data);
          }
        } catch (err) {
          // If check-in status fetch fails, use checkInResult if available
          if (checkInResult?.data) {
            setCheckInData(checkInResult.data);
          }
        } finally {
          setLoading(false);
        }
      } else if (checkInResult?.data && !checkInData) {
        // Use check-in result data directly (only once)
        setCheckInData(checkInResult.data);
        setLoading(false);
      } else if (!checkInData && !checkInResult?.data) {
        setLoading(false);
      }
    };

    fetchCheckInDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Log completion and setup countdown
  useEffect(() => {
    if (!reservation) return;
    
    const reservationId = reservation.reservationId ?? reservation.id;
    if (!reservationId) return;

    // Log check-in completion (only once)
    const logKey = `checkin-logged-${reservationId}`;
    if (!sessionStorage.getItem(logKey)) {
      // Use displayData if available, otherwise use reservation data
      const guestName = displayData?.guestName || 
                       reservation.guestName || 
                       `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim() ||
                       'Guest';
      const roomNumber = displayData?.roomNumber || reservation.roomNumber || 'TBD';
      const checkInTime = displayData?.checkInTime || new Date().toISOString();
      
      logCompletionMutation.mutate({
        reservationId,
        guestName,
        roomNumber,
        checkInTime,
        paymentStatus: paymentStatus?.status || 'completed',
        cardIssued: !!cardData,
      });
      sessionStorage.setItem(logKey, 'true');
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation?.reservationId || reservation?.id, navigate, displayData, paymentStatus, cardData, logCompletionMutation]);

  const handleReturnHome = () => {
    navigate('/home');
  };


  // Trigger celebration animation on mount
  useEffect(() => {
    if (displayData && !loading) {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [displayData, loading]);

  if (!reservation || !displayData) {
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
          <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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

          {/* Success Content */}
          <Stack gap={32} align="center" mb={40}>
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

            {/* Headline */}
            <Stack gap={8} align="center">
              <Title 
                order={1} 
                c="dark.9" 
                fw={700} 
                ta="center"
                style={{
                  fontSize: '32px',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Check-In Complete
              </Title>
              <Text 
                size="lg" 
                c="dimmed" 
                ta="center"
                maw={500}
                style={{ lineHeight: 1.6 }}
              >
                Your room is ready. We're delighted to welcome you to UNO Hotels.
              </Text>
            </Stack>

            {loading ? (
              <Stack align="center" gap="md">
                <Loader size="lg" color="#C8653D" />
                <Text size="md" c="dimmed">Loading your details...</Text>
              </Stack>
            ) : (
              <>
                {/* Enhanced Card Icon with Depth */}
                <Box
                  w={120}
                  h={80}
                  bg="#C8653D"
                  mt={8}
                  style={{
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <IconCreditCard size={40} stroke={2} />
                </Box>

                {/* Room Information Card */}
                <Card 
                  withBorder 
                  p={24} 
                  radius="md"
                  w="100%"
                  bg="white"
                  style={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
                >
                  <Stack gap={20}>
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                        Room Number
                      </Text>
                      <Text size="xl" fw={700} c="dark.9">
                        {displayData.roomNumber}
                      </Text>
                    </Box>
                    
                    <Divider color="rgba(0, 0, 0, 0.06)" />
                    
                    <Group gap={24}>
                      <Box style={{ flex: 1 }}>
                        <Group gap={8} mb={4}>
                          <IconCalendar size={16} color="#666666" />
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                            Check-In Time
                          </Text>
                        </Group>
                        <Text size="md" fw={500} c="dark.9">
                          {displayData.checkInTime && displayData.checkInTime !== new Date().toISOString() 
                            ? new Date(displayData.checkInTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date().toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                        </Text>
                      </Box>
                      
                      <Box style={{ flex: 1 }}>
                        <Group gap={8} mb={4}>
                          <IconCalendar size={16} color="#666666" />
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                            Check-Out
                          </Text>
                        </Group>
                        <Text size="md" fw={500} c="dark.9">
                          {formatCheckOut(displayData.checkOut)}
                        </Text>
                      </Box>
                    </Group>

                    <Divider color="gray.2" />
                    
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                        Guest
                      </Text>
                      <Text size="md" fw={500} c="dark.9">
                        {displayData.guestName}
                      </Text>
                    </Box>
                  </Stack>
                </Card>

                {/* Welcome Message */}
                <Text 
                  size="lg" 
                  fw={500} 
                  c="#222222" 
                  ta="center"
                  style={{
                    marginTop: '8px',
                    lineHeight: 1.6,
                  }}
                >
                  We hope you enjoy your stay with us.
                </Text>

                {/* Auto-return countdown */}
                <Text size="sm" c="dimmed" ta="center">
                  Returning to main menu in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                </Text>
              </>
            )}
          </Stack>

          {/* Return Home Button */}
          <Group justify="center" mt={8}>
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

export default CheckInCompletePage;
