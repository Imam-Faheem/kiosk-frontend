import React, { useEffect, useState, useMemo } from 'react';
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
  Loader,
} from '@mantine/core';
import { IconCheck, IconHome, IconMail, IconCalendar, IconKey } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { getCheckInStatus } from '../../services/checkinService';

const CheckInCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(15);
  const [loading, setLoading] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  
  const reservation = location.state?.reservation;
  const paymentStatus = location.state?.paymentStatus;
  const cardData = location.state?.cardData;
  const checkInResult = location.state?.checkInResult;

  // Format check-out date helper
  const formatCheckOut = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return new Date(dateStr).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate display data from all available sources
  const displayData = useMemo(() => {
    if (!reservation) return null;

    // Priority: checkInData > checkInResult > reservation
    const checkInInfo = checkInData || checkInResult?.data || {};
    
    return {
      reservationId: reservation.reservationId || reservation.id,
      guestName: reservation.guestName || 
                `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim() ||
                `${reservation.guest_name?.first_name || ''} ${reservation.guest_name?.last_name || ''}`.trim() ||
                checkInInfo.guest_name || 'Guest',
      roomNumber: checkInInfo.room_number || 
                  checkInInfo.roomNumber || 
                  reservation.roomNumber || 
                  reservation.room_number || 
                  'TBD',
      checkOut: reservation.checkOut || 
                reservation.check_out_date || 
                reservation.check_out || 
                checkInInfo.check_out_date ||
                (reservation.checkOutDate ? new Date(reservation.checkOutDate).toLocaleDateString() : 
                 reservation.check_out_date ? new Date(reservation.check_out_date).toLocaleDateString() : 'N/A'),
      checkInTime: checkInInfo.checked_in_at || 
                   checkInInfo.checkInTime ||
                   new Date().toISOString(),
      status: checkInInfo.status || checkInResult?.data?.status || 'checked_in',
    };
  }, [reservation, checkInData, checkInResult]);

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

  // Fetch check-in details on mount
  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    // Debug: Log all available data
    console.log('[CheckInComplete] Available data:', {
      reservation,
      paymentStatus,
      cardData,
      checkInResult,
    });

    // Fetch check-in status if we have a reservation ID but no check-in data
    const fetchCheckInDetails = async () => {
      const reservationId = reservation.reservationId || reservation.id;
      if (reservationId && !checkInResult?.data && !checkInData) {
        try {
          setLoading(true);
          const statusResult = await getCheckInStatus(reservationId);
          if (statusResult.success) {
            console.log('[CheckInComplete] Fetched check-in status:', statusResult.data);
            setCheckInData(statusResult.data);
          }
        } catch (err) {
          console.error('Failed to fetch check-in status:', err);
          // If check-in status fetch fails, use checkInResult if available
          if (checkInResult?.data) {
            setCheckInData(checkInResult.data);
          }
        } finally {
          setLoading(false);
        }
      } else if (checkInResult?.data && !checkInData) {
        // Use check-in result data directly (only once)
        console.log('[CheckInComplete] Using check-in result data:', checkInResult.data);
        setCheckInData(checkInResult.data);
        setLoading(false);
      } else if (!checkInData && !checkInResult?.data) {
        setLoading(false);
      }
    };

    fetchCheckInDetails();
  }, []); // Only run once on mount

  // Log completion and setup countdown
  useEffect(() => {
    if (!reservation) return;
    
    const reservationId = reservation.reservationId || reservation.id;
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
  }, [reservation?.reservationId || reservation?.id, navigate]); // Only depend on reservationId

  const handleReturnHome = () => {
    navigate('/home');
  };

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

          {loading ? (
            <Stack align="center" gap="md">
              <Loader size="lg" color="#C8653D" />
              <Text size="md" c="#666666">Loading check-in details...</Text>
            </Stack>
          ) : (
            <>
              {/* Room Information */}
              <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
                <Stack gap="md">
                  <Text size="xl" fw={600} c="#0B152A" ta="center">
                    {t('checkInComplete.roomNumber') || 'Room Number'}: {displayData.roomNumber}
                  </Text>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">{t('checkInComplete.checkOut') || 'Check-Out'}:</Text>
                    <Text size="md" fw={500}>{formatCheckOut(displayData.checkOut)}</Text>
                  </Group>
                  
                  <Group justify="space-between">
                    <Text size="md" c="#666666">Guest:</Text>
                    <Text size="md" fw={500}>{displayData.guestName}</Text>
                  </Group>

                  {displayData.checkInTime && displayData.checkInTime !== new Date().toISOString() && (
                    <Group justify="space-between">
                      <Text size="md" c="#666666">Check-In Time:</Text>
                      <Text size="md" fw={500}>
                        {new Date(displayData.checkInTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </Group>
                  )}

                  {reservation.reservationId || reservation.id && (
                    <Group justify="space-between">
                      <Text size="sm" c="#999999">Reservation ID:</Text>
                      <Text size="sm" c="#999999" style={{ fontFamily: 'monospace' }}>
                        {displayData.reservationId?.substring(0, 12)}...
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>

              {/* Key Information */}
              {(cardData || checkInResult?.data?.key_issued) && (
                <Alert
                  icon={<IconKey size={20} />}
                  title="Digital Key"
                  color="blue"
                  variant="light"
                  style={{ borderRadius: '8px', width: '100%' }}
                >
                  <Stack gap="xs">
                    <Text size="md" fw={500}>
                      {t('checkInComplete.keySent') || 'Digital key has been issued'}
                    </Text>
                    {cardData?.keyCode && (
                      <Text size="sm" c="#666666">
                        Key Code: <strong style={{ fontFamily: 'monospace' }}>{cardData.keyCode}</strong>
                      </Text>
                    )}
                    {cardData?.accessCode && (
                      <Text size="sm" c="#666666">
                        Access Code: <strong style={{ fontFamily: 'monospace' }}>{cardData.accessCode}</strong>
                      </Text>
                    )}
                    {checkInResult?.data?.keyId && (
                      <Text size="sm" c="#666666">
                        Key ID: <strong style={{ fontFamily: 'monospace' }}>{checkInResult.data.keyId}</strong>
                      </Text>
                    )}
                    <Text size="sm" c="#666666">
                      Check your email for detailed instructions.
                    </Text>
                  </Stack>
                </Alert>
              )}
            </>
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
