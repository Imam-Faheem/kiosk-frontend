import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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
import { useCheckInMutation } from '../../hooks/useCheckInMutation';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import '../../styles/animations.css';

const CheckInCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(15);
  const [loading, setLoading] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;
  const cardData = location.state?.cardData;
  const checkInResult = location.state?.checkInResult;

  const formatCheckOut = useCallback((dateStr) => {
    if (!dateStr || dateStr === 'N/A') return t('common.notAvailable');
    try {
      if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return new Date(dateStr).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }, [t]);

  const getGuestName = useCallback((reservation, checkInInfo = null) => {
    if (!reservation) return t('common.guest');
    if (typeof reservation.guest_name === 'string') {
      return reservation.guest_name;
    }
    if (reservation.guest_name) {
      const firstName = reservation.guest_name.first_name ?? '';
      const lastName = reservation.guest_name.last_name ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    if (checkInInfo?.guest_name) return checkInInfo.guest_name;
    return reservation.guestName ?? t('common.guest');
  }, [t]);

  const checkInStatusMutation = useCheckInMutation('getStatus', {
    onSuccess: (result) => {
      if (result.success) {
        setCheckInData(result.data);
      }
    },
    onError: () => {
      // If check-in status fetch fails, use checkInResult if available
      if (checkInResult?.data) {
        setCheckInData(checkInResult.data);
      }
    }
  });

  // Calculate display data from all available sources
  const displayData = useMemo(() => {
    if (!reservation) return null;
    const checkInInfo = checkInData ?? checkInResult?.data ?? {};
    const checkOutDate = checkInInfo.check_out_date ?? reservation.check_out_date;
    
    return {
      reservationId: reservation.reservation_id ?? reservation.id,
      guestName: getGuestName(reservation, checkInInfo),
      roomNumber: checkInInfo.room_number ?? reservation.room_number ?? t('common.notAvailable'),
      checkOut: checkOutDate ? formatCheckOut(checkOutDate) : t('common.notAvailable'),
      checkInTime: checkInInfo.checked_in_at ?? new Date().toISOString(),
      status: checkInInfo.status ?? checkInResult?.data?.status ?? 'checked_in',
    };
  }, [reservation, checkInData, checkInResult, t, formatCheckOut, getGuestName]);

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
      const reservationId = reservation.reservation_id ?? reservation.reservationId ?? reservation.id;
      if (reservationId && !checkInResult?.data && !checkInData) {
        try {
          setLoading(true);
          await checkInStatusMutation.mutateAsync(reservationId);
        } catch (err) {
          // Error handled in mutation onError callback
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

  useEffect(() => {
    if (!reservation) return;
    
    const reservationId = reservation.reservation_id ?? reservation.reservationId ?? reservation.id;
    if (!reservationId) return;

    const logKey = `checkin-logged-${reservationId}`;
    const hasLogged = sessionStorage.getItem(logKey);

    if (!hasLogged) {
      const guestName = displayData?.guestName ?? getGuestName(reservation, checkInData);
      
      const roomNumber = displayData?.roomNumber ?? reservation.room_number ?? reservation.roomNumber ?? t('common.notAvailable');
      const checkInTime = displayData?.checkInTime ?? new Date().toISOString();
      
      logCompletionMutation.mutate({
        reservationId,
        guestName,
        roomNumber,
        checkInTime,
        paymentStatus: paymentStatus?.status ?? 'completed',
        cardIssued: !!cardData,
      });
      
      sessionStorage.setItem(logKey, 'true');
    }

    return () => {
      // Cleanup handled in countdown effect
    };
  }, [reservation, navigate, displayData, paymentStatus, cardData, logCompletionMutation, t, getGuestName, checkInData]);

  // Separate effect for countdown timer - runs once on mount
  useEffect(() => {
    if (!reservation) return;

    // Reset countdown to 15
    setCountdown(15);

    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Start countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        if (next <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          navigate('/home');
          return 0;
        }
        return next;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [reservation, navigate]);

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
          <Stack gap={32} align="center">
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
                  <Box 
                    className="ripple-effect" 
                    pos="absolute"
                    top="50%"
                    left="50%"
                    style={{ 
                      marginTop: '-70px', 
                      marginLeft: '-70px', 
                      width: '140px', 
                      height: '140px' 
                    }} 
                  />
                  <Box 
                    className="ripple-effect" 
                    pos="absolute"
                    top="50%"
                    left="50%"
                    style={{ 
                      marginTop: '-70px', 
                      marginLeft: '-70px', 
                      width: '140px', 
                      height: '140px', 
                      animationDelay: '0.3s' 
                    }} 
                  />
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
                  pos="absolute"
                  top="50%"
                  left="50%"
                  style={{
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
                fz={32}
                lts={-0.5}
                lh={1.2}
              >
                {t('checkInComplete.title')}
              </Title>
              <Text 
                size="lg" 
                c="dimmed" 
                ta="center"
                maw={500}
                lh={1.6}
              >
                {t('checkInComplete.welcomeMessage')}
              </Text>
            </Stack>

            {loading ? (
              <Stack align="center" gap="md">
                <Loader size="lg" color="#C8653D" />
                <Text size="md" c="dimmed">{t('checkInComplete.loadingDetails')}</Text>
              </Stack>
            ) : (
              <>
                {/* Enhanced Card Icon with Depth */}
                <Box
                  w={120}
                  h={80}
                  bg="#C8653D"
                  mt={8}
                  radius="md"
                  style={{
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
                      <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                        {t('checkInComplete.roomNumber')}
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
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                            {t('checkInComplete.checkInTime')}
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
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                            {t('checkInComplete.checkOut')}
                          </Text>
                        </Group>
                        <Text size="md" fw={500} c="dark.9">
                          {formatCheckOut(displayData.checkOut)}
                        </Text>
                      </Box>
                    </Group>

                    <Divider color="gray.2" />
                    
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                        {t('checkInComplete.guest')}
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
                  mt={8}
                  lh={1.6}
                >
                  {t('checkInComplete.enjoyStay')}
                </Text>

                {/* Auto-return countdown */}
                <Box
                  p={16}
                  bg="rgba(200, 101, 61, 0.05)"
                  radius="md"
                  w="100%"
                  style={{
                    border: '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Text size="md" fw={600} c="#C8653D" ta="center">
                    {t('checkInComplete.returningToMenu', { countdown, seconds: countdown === 1 ? t('checkInComplete.second') : t('checkInComplete.seconds') })}
                  </Text>
                </Box>
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

export default CheckInCompletePage;
