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
  Badge,
  Loader,
  Alert,
} from '@mantine/core';
import { IconHome, IconCalendar, IconUser, IconCreditCard, IconCheck, IconX, IconCircleCheck } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentAccount } from '../../hooks/useReservationQueries';
import '../../styles/animations.css';
import { BUTTON_STYLES, CONTAINER_STYLES, PAPER_STYLES } from '../../config/constants';
import PropertyHeader from '../../components/PropertyHeader';

const ReservationCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const checkmarkRef = useRef(null);

  const { reservation, room, guestDetails } = location.state ?? {};
  
  const { data, isLoading } = usePaymentAccount(reservation);

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

  const getReservationNumber = () => {
    const reservationIdSources = [
      reservation.bookingId,
      reservation.reservationId,
      reservation.id,
      reservation.bookingData?.bookingId,
      reservation.bookingData?.id,
      reservation.bookingData?.reservationId,
      reservation.bookingData?.reservation?.id,
      reservation.bookingData?.reservation?.bookingId,
      reservation.bookingData?.reservations?.[0]?.id,
      reservation.bookingData?.reservations?.[0]?.bookingId,
    ];
    return reservationIdSources.find(id => id != null && id !== 'BOOKING-CREATED') ?? t('common.notAvailable');
  };

  const handleReturnHome = () => {
    navigate('/home');
  };

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
    <Container
      size="lg"
      style={CONTAINER_STYLES.centered}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={PAPER_STYLES.medium}
      >
        <Group gap="md" mb="xl" pb="md" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
          <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
            {t('reservationComplete.title')}
          </Title>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
          <Box
            style={{
              position: 'relative',
              width: '140px',
              height: '140px',
              marginBottom: '8px',
            }}
          >
            {showCelebration && (
              <>
                <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px' }} />
                <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px', animationDelay: '0.3s' }} />
              </>
            )}
            
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
            {t('reservationComplete.success')}
          </Title>

          <Text size="lg" fw={600} c="#C8653D">
            {t('reservationComplete.reservationNumber')}: {getReservationNumber()}
          </Text>

          {(() => {
            const paymentData = reservation?.paymentData;
            if (!paymentData && !data) return null;
            
            const status = (data?.status ?? paymentData?.status ?? paymentData?.data?.status ?? '').toLowerCase();
            const isFailure = status === 'failure';
            const successChecks = [
              status === 'success',
              paymentData?.success === true,
              paymentData?.data?.success === true,
              paymentData != null && !isFailure
            ];
            const isSuccess = successChecks.some(Boolean);
            
            if (isFailure) return null;
            if (!isSuccess) return null;
            
            return (
              <Box style={{ width: '100%', position: 'relative' }}>
                <Card
                  withBorder
                  p="xl"
                  radius="md"
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #22c55e',
                    width: '100%',
                  }}
                >
                  <Group gap="lg" align="center" justify="center">
                    <Box
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        style={{ position: 'relative', zIndex: 2 }}
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="22"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M 15 25 L 22 32 L 35 18"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Box>
                    <Stack gap={6} style={{ flex: 1 }}>
                      <Text size="xl" fw={700} c="#16a34a">
                        {t('reservationComplete.paymentSuccessful') ?? 'Payment Successful'}
                      </Text>
                      <Text size="md" fw={500} c="#15803d">
                        {t('reservationComplete.paymentProcessedSuccessfully') ?? 'Your payment has been processed successfully'}
                      </Text>
                    </Stack>
                  </Group>
                </Card>
              </Box>
            );
          })()}

          {(room ?? guestDetails ?? reservation.checkIn) && (
            <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
              <Stack gap="md">
                {guestDetails && (
                  <Group gap="sm">
                    <IconUser size={20} color="#C8653D" />
                    <Text size="md" fw={600}>{t('reservationComplete.guest')}:</Text>
                    <Text size="md">{guestDetails.firstName} {guestDetails.lastName}</Text>
                  </Group>
                )}
                
                {room && (
                  <Group gap="sm">
                    <IconCreditCard size={20} color="#C8653D" />
                    <Text size="md" fw={600}>{t('reservationComplete.room')}:</Text>
                    <Text size="md">
                      {room?.unitGroup?.name ?? 
                       room?.name ?? 
                       room?.unitGroup?.id ?? 
                       room?.roomTypeId ?? 
                       t('common.notAvailable')}
                    </Text>
                  </Group>
                )}
                
                {reservation.checkIn && (
                  <>
                    <Divider />
                    <Group gap="sm">
                      <IconCalendar size={20} color="#C8653D" />
                      <Text size="md" fw={600}>{t('reservationComplete.checkIn')}:</Text>
                      <Text size="md">{formatDate(reservation.checkIn)}</Text>
                    </Group>
                    {reservation.checkOut && (
                      <Group gap="sm">
                        <IconCalendar size={20} color="#C8653D" />
                        <Text size="md" fw={600}>{t('reservationComplete.checkOut')}:</Text>
                        <Text size="md">{formatDate(reservation.checkOut)}</Text>
                      </Group>
                    )}
                  </>
                )}
                
                {reservation.totalAmount && (
                  <>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="md" fw={600}>{t('reservationComplete.totalAmount')}:</Text>
                      <Text size="lg" fw={700} c="#C8653D">
                        {reservation.currency ?? 'EUR'} {reservation.totalAmount}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Card>
          )}

          {data && (
            <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
              <Stack gap="md">
                <Group gap="sm" mb="xs">
                  <IconCreditCard size={20} color="#C8653D" />
                  <Text size="md" fw={600}>{t('reservationComplete.paymentInformation') ?? 'Payment Information'}</Text>
                </Group>
                <Divider />
                
                <Group justify="space-between">
                  <Text size="sm" c="#666666">{t('reservationComplete.paymentAccountId') ?? 'Payment Account ID'}:</Text>
                  <Text size="sm" fw={600}>{data.id}</Text>
                </Group>
                
                <Group justify="space-between">
                  <Text size="sm" c="#666666">{t('reservationComplete.paymentStatus') ?? 'Status'}:</Text>
                  <Badge
                    color={
                      data.status?.toLowerCase() === 'success' ? 'green'
                        : data.status?.toLowerCase() === 'failure' ? 'red'
                        : 'yellow'
                    }
                    variant="light"
                    leftSection={
                      data.status?.toLowerCase() === 'success' ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconX size={14} />
                      )
                    }
                  >
                    {data.status}
                  </Badge>
                </Group>
                
                {data.failureReason && (
                  <Group justify="space-between">
                    <Text size="sm" c="#666666">{t('reservationComplete.failureReason') ?? 'Failure Reason'}:</Text>
                    <Text size="sm" c="red" fw={600}>{data.failureReason}</Text>
                  </Group>
                )}
                
                <Group justify="space-between">
                  <Text size="sm" c="#666666">{t('reservationComplete.payerInteraction') ?? 'Payment Method'}:</Text>
                  <Text size="sm" fw={600}>{data.payerInteraction ?? 'N/A'}</Text>
                </Group>
                
                {data.target && (
                  <Group justify="space-between">
                    <Text size="sm" c="#666666">{t('reservationComplete.targetType') ?? 'Target Type'}:</Text>
                    <Text size="sm" fw={600}>{data.target.type ?? 'N/A'}</Text>
                  </Group>
                )}
                
                {data.created && (
                  <Group justify="space-between">
                    <Text size="sm" c="#666666">{t('reservationComplete.paymentCreated') ?? 'Created'}:</Text>
                    <Text size="sm">{new Date(data.created).toLocaleString()}</Text>
                  </Group>
                )}
                
                {data.updated && (
                  <Group justify="space-between">
                    <Text size="sm" c="#666666">{t('reservationComplete.paymentUpdated') ?? 'Updated'}:</Text>
                    <Text size="sm">{new Date(data.updated).toLocaleString()}</Text>
                  </Group>
                )}
              </Stack>
            </Card>
          )}

          {isLoading && (
            <Card withBorder p="lg" radius="md" style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
              <Group justify="center">
                <Loader size="sm" />
                <Text size="sm" c="#666666">{t('reservationComplete.loadingPayment') ?? 'Loading payment information...'}</Text>
              </Group>
            </Card>
          )}

        </Stack>

        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={handleReturnHome}
            styles={BUTTON_STYLES.primary}
            radius="md"
          >
            {t('reservationComplete.returnHome')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default ReservationCompletePage;
