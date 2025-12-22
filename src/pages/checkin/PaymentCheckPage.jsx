import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Title,
  Stack,
  Box,
  Card,
  Badge,
  Alert,
  Divider,
  Button,
} from '@mantine/core';
import { 
  IconCreditCard, 
  IconCheck, 
  IconX, 
  IconLoader2,
  IconShield,
  IconCalendar,
  IconUser,
  IconBed,
  IconCurrencyDollar,
  IconPhone,
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentMutation } from '../../hooks/usePaymentMutation';
import { isPaymentCompleted, getPaymentStatus } from '../../lib/paymentUtils';
import '../../styles/animations.css';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const PaymentCheckPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  usePaymentMutation('checkStatus', {
    onSuccess: (result) => {
      if (result.success) {
        setPaymentStatus(result.data);
        setLoading(false);
        
        // Show payment status for 7 seconds so user can see it
        setTimeout(() => {
          // Navigate based on payment status
          if (isPaymentCompleted(result.data.status)) {
            navigate('/checkin/card-dispensing', {
              state: { reservation, paymentStatus: result.data }
            });
          } else {
            navigate('/checkin/payment', {
              state: { reservation, paymentStatus: result.data }
            });
          }
        }, 7000);
      } else {
        setError(t('error.paymentFailed'));
        setLoading(false);
      }
    },
    onError: (err) => {
      setError(err.message ?? t('error.paymentFailed'));
      setLoading(false);
    }
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const reservation = location.state?.reservation;

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        setProcessingTime(0);
        setPaymentFailed(false);
        
        // Progress timer
        const progressInterval = setInterval(() => {
          setProcessingTime(prev => prev + 1);
        }, 1000);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Calculate actual amount from reservation
        const totalAmount = reservation.totalAmount ?? 0;
        
        const paymentStatusData = {
          status: getPaymentStatus(reservation),
          amount: totalAmount,
          currency: reservation.currency ?? 'EUR',
          balance: reservation.balance ?? 0,
          transactionId: reservation.id ?? `TXN-${Date.now()}`
        };
        
        clearInterval(progressInterval);
        setPaymentStatus(paymentStatusData);
        setLoading(false);
        
        // Check if payment failed
        if (!isPaymentCompleted(paymentStatusData.status) && paymentStatusData.balance > 0) {
          setPaymentFailed(true);
        }
        
        // Show payment status for 7 seconds so user can see it
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        // Navigate based on payment status
        const shouldProceedToCard = isPaymentCompleted(paymentStatusData.status) ? true : paymentStatusData.balance <= 0;
        
        if (shouldProceedToCard) {
          navigate('/checkin/card-dispensing', {
            state: { reservation, paymentStatus: paymentStatusData }
          });
        } else {
          navigate('/checkin/payment', {
            state: { reservation, paymentStatus: paymentStatusData }
          });
        }
      } catch (err) {
        setError(err.message ?? t('error.paymentFailed'));
        setPaymentFailed(true);
        setLoading(false);
      }
    };

    checkStatus();
  }, [reservation, navigate, t]);

  const handleBack = () => {
    navigate('/checkin');
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
        {/* Header */}
        <Group justify="space-between" mb="xl" pb={12} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
            <Title 
              order={2} 
              fz={30}
              c="rgb(34, 34, 34)"
              fw={600}
              lts={1}
              ml={-9}
            >
              UNO HOTELS
            </Title>
          </Group>
        </Group>

        {/* Content */}
        <Stack gap="lg" mb="xl">
          {loading ? (
            <>
              {/* Status Headline */}
              <Stack gap={8} align="center" mb={24}>
                <Title 
                  order={2} 
                  fw={700} 
                  c="dark.9" 
                  ta="center"
                  fz={24}
                  lts={-0.3}
                >
                  Verifying Payment Status
                </Title>
                <Text 
                  size="sm" 
                  c="dimmed" 
                  ta="center"
                  maw={500}
                  lh={1.6}
                >
                  Please wait while we check your payment information...
                </Text>
              </Stack>

              {/* Loading Indicator with Progress */}
              <Box
                p={24}
                bg="rgba(200, 101, 61, 0.02)"
                radius="md"
                style={{
                  border: '1px solid rgba(200, 101, 61, 0.1)',
                }}
              >
                <Stack align="center" gap={24}>
                  <Box className="loading-pulse">
                    <IconLoader2 
                      size={64} 
                      color="#C8653D"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                  </Box>
                  <Stack align="center" gap={8}>
                    <Text size="sm" c="dimmed" ta="center">
                      Processing payment verification...
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      Estimated time: {processingTime < 3 ? '~3 seconds' : 'Almost done'}
                    </Text>
                  </Stack>
                  {/* Progress Bar */}
                  <Box
                    w="100%"
                    h={4}
                    bg="rgba(200, 101, 61, 0.1)"
                    radius={2}
                    style={{
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      h="100%"
                      bg="#C8653D"
                      radius={2}
                      style={{
                        width: `${Math.min((processingTime / 3) * 100, 100)}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </>
          ) : error ? (
            <Alert
                icon={<IconX size={20} />}
                title="Verification Error"
              color="red"
              variant="light"
                radius="md"
                styles={{ root: { border: '1px solid rgba(250, 82, 82, 0.2)' } }}
            >
                <Text size="md" fw={500} c="red.7">
              {error}
                </Text>
                <Text size="sm" c="dimmed" mt={8}>
                  Please try again or contact front desk for assistance.
                </Text>
            </Alert>
          ) : (
            <>
              {/* Status Headline */}
              <Stack gap={8} align="center" mb={24}>
                <Title 
                  order={2} 
                  fw={700} 
                  c="dark.9" 
                  ta="center"
                  fz={24}
                  lts={-0.3}
                >
                  {isPaymentCompleted(paymentStatus?.status) 
                    ? 'Payment Completed' 
                    : paymentFailed 
                    ? 'Payment Failed' 
                    : 'Payment Verification'}
                </Title>
                <Text 
                  size="sm" 
                  c="dimmed" 
                  ta="center"
                  maw={500}
                  lh={1.6}
                >
                  {isPaymentCompleted(paymentStatus?.status)
                    ? 'Your payment has been confirmed. Proceeding to card issuance...'
                    : paymentFailed
                    ? 'Unable to verify payment. Please retry or contact support.'
                    : 'Payment verification in progress. Please wait...'}
                </Text>
              </Stack>

              {/* Payment Status */}
              {paymentStatus && (
                <Box
                  p={24}
                  bg={isPaymentCompleted(paymentStatus.status) 
                    ? 'rgba(34, 197, 94, 0.02)' 
                    : paymentFailed 
                    ? 'rgba(239, 68, 68, 0.02)' 
                    : 'rgba(200, 101, 61, 0.02)'}
                  radius="md"
                  style={{
                    border: isPaymentCompleted(paymentStatus.status) 
                      ? '1px solid rgba(34, 197, 94, 0.15)' 
                      : paymentFailed 
                      ? '1px solid rgba(239, 68, 68, 0.15)' 
                      : '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Stack gap={20}>
                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                      bg={isPaymentCompleted(paymentStatus.status) 
                        ? 'rgba(34, 197, 94, 0.08)' 
                        : paymentFailed 
                        ? 'rgba(239, 68, 68, 0.08)' 
                        : 'rgba(200, 101, 61, 0.05)'}
                      style={{
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box
                        w={24}
                        h={24}
                        bg={isPaymentCompleted(paymentStatus.status) ? '#22c55e' : paymentFailed ? '#ef4444' : '#C8653D'}
                        style={{
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isPaymentCompleted(paymentStatus.status) ? (
                          <IconCheck size={14} color="white" stroke={3} />
                        ) : paymentFailed ? (
                          <IconX size={14} color="white" stroke={3} />
                        ) : (
                          <IconLoader2 
                            size={16} 
                            color="white" 
                            style={{ animation: 'spin 1s linear infinite' }}
                          />
                        )}
                      </Box>
                      <Text 
                        size="md" 
                        fw={700} 
                        c="dark.9"
                        ff="Inter, sans-serif"
                        lts={-0.2}
                        style={{ 
                          flex: 1,
                        }}
                      >
                        {isPaymentCompleted(paymentStatus.status) 
                          ? 'Payment Completed' 
                          : paymentFailed 
                          ? 'Payment Failed' 
                          : 'Payment Required'}
                      </Text>
                      {!isPaymentCompleted(paymentStatus.status) && !paymentFailed && loading && (
                        <Text 
                          size="xs" 
                          c="#C8653D" 
                          fw={600}
                          ff="Inter, sans-serif"
                        >
                          Processing...
                        </Text>
                      )}
                    </Group>

                    {/* Only show amount when payment is completed or there's an amount due, not during processing */}
                    {(!loading && (isPaymentCompleted(paymentStatus.status) || paymentStatus.balance > 0)) && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <Box
                          w={40}
                          h={40}
                          radius="md"
                          bg="rgba(200, 101, 61, 0.05)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text size="lg" fw={700} c="dark.9">
                            {paymentStatus.currency === 'EUR' ? '€' : paymentStatus.currency === 'USD' ? '$' : paymentStatus.currency === 'GBP' ? '£' : paymentStatus.currency?.[0] ?? '€'}
                          </Text>
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            {paymentStatus.balance > 0 ? 'Amount Due' : 'Amount Paid'}
                          </Text>
                          <Group gap={8} align="baseline">
                            <Text size="lg" fw={700} c="dark.9" lh={1}>
                              {paymentStatus.balance > 0 
                                ? Math.abs(paymentStatus.balance).toFixed(2)
                                : (() => {
                                    const paidAmount = reservation.totalAmount ?? 0;
                                    return paidAmount > 0 ? paidAmount.toFixed(2) : '0.00';
                                  })()}
                            </Text>
                            <Text size="sm" fw={500} c="dimmed">
                              {paymentStatus.currency}
                            </Text>
                          </Group>
                          {paymentStatus.balance > 0 && (
                            <Text size="xs" c="#C8653D" fw={600} mt={4}>
                              Payment required to proceed
                            </Text>
                          )}
                          {isPaymentCompleted(paymentStatus.status) && paymentStatus.balance <= 0 && (
                            <Text size="xs" c="green" fw={600} mt={4}>
                              Payment completed
                            </Text>
                          )}
                        </Box>
                      </Group>
                    )}
                  </Stack>
                </Box>
              )}

                {/* Reservation Summary - Simplified */}
                <Box
                  p={24}
                  bg="rgba(200, 101, 61, 0.02)"
                  radius="md"
                  style={{
                    border: '1px solid rgba(200, 101, 61, 0.1)',
                  }}
                >
                  <Stack gap={20}>
                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                    >
                      <IconShield size={20} color="#C8653D" />
                      <Text 
                        size="md" 
                        fw={600} 
                        c="dark.9"
                        ff="Inter, sans-serif"
                        lts={-0.2}
                        style={{ 
                          flex: 1,
                        }}
                      >
                        Reservation Details
                      </Text>
                    </Group>

                    <Group 
                      gap={16}
                      align="center"
                      p="12px 16px"
                      radius="md"
                    >
                      <IconUser size={20} color="#666666" />
                      <Box style={{ flex: 1 }}>
                        <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                          Guest Name
                        </Text>
                        <Text size="md" fw={500} c="dark.9">
                          {(() => {
                            const firstName = reservation.guest_name?.first_name ?? reservation.firstName ?? '';
                            const lastName = reservation.guest_name?.last_name ?? reservation.lastName ?? '';
                            return `${firstName} ${lastName}`.trim();
                          })()}
                        </Text>
                      </Box>
                    </Group>

                    {reservation.roomNumber && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <IconBed size={20} color="#666666" />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            Room
                          </Text>
                          <Text size="md" fw={500} c="dark.9">
                            {reservation.roomNumber}
                          </Text>
                        </Box>
                      </Group>
                    )}

                    {reservation.roomType && (
                      <Group 
                        gap={16}
                        align="center"
                        p="12px 16px"
                        radius="md"
                      >
                        <IconBed size={20} color="#666666" />
                        <Box style={{ flex: 1 }}>
                          <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" lts={0.5}>
                            Room Type
                          </Text>
                          <Text size="md" fw={500} c="dark.9">
                            {reservation.roomType}
                          </Text>
                        </Box>
                      </Group>
                    )}
                  </Stack>
                </Box>
            </>
          )}
        </Stack>

        {/* Action Buttons */}
        <Group justify="space-between" mt={32}>
          <BackButton onClick={handleBack} text={t('common.back')} />
          
          {paymentFailed && (
            <Button
              size="md"
              variant="light"
              leftSection={<IconPhone size={18} />}
              onClick={() => {
                // Contact support action
                window.location.href = 'tel:+1234567890';
              }}
              c="#C8653D"
              fw={600}
              radius="md"
              px={24}
              py={10}
            >
              Contact Support
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
};

export default PaymentCheckPage;
