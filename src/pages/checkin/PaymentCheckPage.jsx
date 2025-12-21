import React, { useState, useEffect } from 'react';
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
  Badge,
  Loader,
  Alert,
  Divider,
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
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { usePaymentMutation } from '../../hooks/usePaymentMutation';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';

const PaymentCheckPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const checkPaymentStatus = usePaymentMutation('checkStatus', {
    onSuccess: (result) => {
      if (result.success) {
        setPaymentStatus(result.data);
        
        // Navigate based on payment status
        if (result.data.status === 'completed' || result.data.status === 'paid') {
          // Already paid, go to card dispensing
          setTimeout(() => {
            navigate('/checkin/card-dispensing', {
              state: { reservation, paymentStatus: result.data }
            });
          }, 2000);
        } else {
          // Not paid, go to payment terminal
          setTimeout(() => {
            navigate('/checkin/payment', {
              state: { reservation, paymentStatus: result.data }
            });
          }, 2000);
        }
      } else {
        setError(t('error.paymentFailed'));
      }
    },
    onError: (err) => {
      setError(err.message || t('error.paymentFailed'));
    }
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reservation = location.state?.reservation;

  useEffect(() => {
    if (!reservation) {
      navigate('/checkin');
      return;
    }

    const checkStatus = async () => {
      try {
        setLoading(true);
        
        // Payment status is already in reservation data from Apaleo
        // Check balance to determine payment status
        const paymentStatusData = {
          status: reservation.paymentStatus || (reservation.balance <= 0 ? 'paid' : 'pending'),
          amount: reservation.totalAmount || Math.abs(reservation.balance || 0),
          currency: reservation.currency || 'EUR',
          balance: reservation.balance || 0,
          transactionId: reservation.id || `TXN-${Date.now()}`
        };
        
        setPaymentStatus(paymentStatusData);
        
        // Small delay for UI
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate based on payment status
        if (paymentStatusData.status === 'paid' || paymentStatusData.balance <= 0) {
          // Already paid, go to card dispensing (which will trigger Apaleo check-in)
          setTimeout(() => {
            navigate('/checkin/card-dispensing', {
              state: { reservation, paymentStatus: paymentStatusData }
            });
          }, 500);
        } else {
          // Not paid, go to payment terminal
          setTimeout(() => {
            navigate('/checkin/payment', {
              state: { reservation, paymentStatus: paymentStatusData }
            });
          }, 500);
        }
      } catch (err) {
        setError(err.message || t('error.paymentFailed'));
      } finally {
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
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .loading-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .status-card {
          animation: slideIn 0.5s ease-out;
        }
        .secure-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border: 1px solid rgba(200, 101, 61, 0.15);
          position: relative;
          overflow: hidden;
        }
        .secure-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(200, 101, 61, 0.08),
            transparent
          );
          animation: shimmer 4s infinite;
        }
      `}</style>
      <Container
        size="lg"
        h="100vh"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        py={32}
        px={20}
        bg="gray.0"
      >
        <Paper
          shadow="xl"
          p={48}
          radius={24}
          w="100%"
          maw={720}
          bg="white"
          style={{ border: '1px solid rgba(0, 0, 0, 0.04)' }}
        >
          {/* Header */}
          <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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

          {/* Content */}
          <Stack gap={32}>
            {loading ? (
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
                  <Text size="xl" fw={600} c="#222222" ta="center">
                    Verifying Payment Status
                  </Text>
                  <Text size="md" c="dimmed" ta="center" maw={400}>
                    Please wait while we check your payment information...
                  </Text>
                </Stack>
              </Stack>
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
                {/* Payment Status Card - Primary Focus */}
                {paymentStatus && (
                  <Card 
                    withBorder 
                    p={32} 
                    radius="md"
                    bg="white"
                    styles={{
                      root: {
                        border: '2px solid',
                        borderColor: paymentStatus.status === 'completed' || paymentStatus.status === 'paid' 
                          ? 'rgba(34, 197, 94, 0.3)' 
                          : 'rgba(200, 101, 61, 0.3)',
                        boxShadow: paymentStatus.status === 'completed' || paymentStatus.status === 'paid'
                          ? '0 8px 24px rgba(34, 197, 94, 0.15)'
                          : '0 8px 24px rgba(200, 101, 61, 0.15)',
                      },
                    }}
                  >
                    <Stack gap={24}>
                      <Group justify="space-between" align="center">
                        <Group gap={12}>
                          <Box
                            w={56}
                            h={56}
                            style={{
                              borderRadius: '12px',
                              backgroundColor: paymentStatus.status === 'completed' || paymentStatus.status === 'paid'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : 'rgba(200, 101, 61, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconCreditCard 
                              size={28} 
                              color={paymentStatus.status === 'completed' || paymentStatus.status === 'paid' 
                                ? '#22c55e' 
                                : '#C8653D'} 
                              stroke={2}
                            />
                          </Box>
                          <Box>
                            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                              Payment Status
                            </Text>
                            <Text size="xl" fw={700} c="dark.9" mt={4}>
                              {paymentStatus.status === 'completed' || paymentStatus.status === 'paid' 
                                ? 'Payment Confirmed' 
                                : 'Payment Required'}
                            </Text>
                          </Box>
                        </Group>
                        <Badge
                          size="lg"
                          variant="light"
                          color={paymentStatus.status === 'completed' || paymentStatus.status === 'paid' ? 'green' : 'orange'}
                          leftSection={
                            paymentStatus.status === 'completed' || paymentStatus.status === 'paid' ? 
                            <IconCheck size={16} stroke={2.5} /> : 
                            <IconLoader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          }
                          styles={{ root: { padding: '8px 16px', fontSize: '14px', fontWeight: 600 } }}
                        >
                          {paymentStatus.status === 'completed' || paymentStatus.status === 'paid' 
                            ? 'Paid' 
                            : 'Pending'}
                        </Badge>
                      </Group>
                      
                      <Divider color="rgba(0, 0, 0, 0.06)" />
                      
                      {paymentStatus.amount && (
                        <Box>
                          <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                            Amount
                          </Text>
                          <Group gap={8} align="baseline">
                            <IconCurrencyDollar size={20} color="#222222" />
                            <Text size="32px" fw={700} c="#222222" style={{ lineHeight: 1 }}>
                              {paymentStatus.amount}
                            </Text>
                            <Text size="lg" fw={500} c="dimmed">
                              {paymentStatus.currency}
                            </Text>
                          </Group>
                          {paymentStatus.balance > 0 && (
                            <Text size="sm" c="dimmed" mt={8}>
                              Balance due: {paymentStatus.currency} {Math.abs(paymentStatus.balance).toFixed(2)}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Card>
                )}

                {/* Reservation Summary */}
                <Card 
                  withBorder 
                  p={24} 
                  radius="md"
                  bg="white"
                  style={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}
                >
                  <Stack gap={20}>
                    <Group gap={8} mb={4}>
                      <IconShield size={20} color="#C8653D" />
                      <Text size="md" fw={600} c="dark.9">
                        Reservation Details
                      </Text>
                    </Group>
                    
                    <Divider color="rgba(0, 0, 0, 0.06)" />
                    
                    <Group gap={24}>
                      <Box style={{ flex: 1 }}>
                        <Group gap={8} mb={4}>
                          <IconUser size={16} color="#666666" />
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                            Guest Name
                          </Text>
                        </Group>
                        <Text size="md" fw={500} c="dark.9">
                          {reservation.firstName || reservation.guest_name?.first_name || ''} {reservation.lastName || reservation.guest_name?.last_name || ''}
                        </Text>
                      </Box>
                      
                      {reservation.roomNumber && (
                        <Box style={{ flex: 1 }}>
                          <Group gap={8} mb={4}>
                            <IconBed size={16} color="gray.6" />
                            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                              Room
                            </Text>
                          </Group>
                          <Text size="md" fw={500} c="dark.9">
                            {reservation.roomNumber}
                          </Text>
                        </Box>
                      )}
                    </Group>

                    {(reservation.roomType || reservation.checkIn || reservation.checkOut) && (
                      <>
                        <Divider color="gray.2" />
                        <Group gap={24}>
                          {reservation.roomType && (
                            <Box style={{ flex: 1 }}>
                              <Text size="xs" fw={600} c="dimmed" mb={4} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                                Room Type
                              </Text>
                              <Text size="md" fw={500} c="dark.9">
                                {reservation.roomType}
                              </Text>
                            </Box>
                          )}
                        </Group>
                      </>
                    )}

                    {(reservation.checkIn || reservation.checkOut) && (
                      <>
                        <Divider color="gray.2" />
                        <Group gap={24}>
                          {reservation.checkIn && (
                            <Box style={{ flex: 1 }}>
                              <Group gap={8} mb={4}>
                                <IconCalendar size={16} color="gray.6" />
                                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                                  Check-In
                                </Text>
                              </Group>
                              <Text size="md" fw={500} c="dark.9">
                                {new Date(reservation.checkIn).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Text>
                            </Box>
                          )}
                          
                          {reservation.checkOut && (
                            <Box style={{ flex: 1 }}>
                              <Group gap={8} mb={4}>
                                <IconCalendar size={16} color="gray.6" />
                                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                                  Check-Out
                                </Text>
                              </Group>
                              <Text size="md" fw={500} c="dark.9">
                                {new Date(reservation.checkOut).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Text>
                            </Box>
                          )}
                        </Group>
                      </>
                    )}
                  </Stack>
                </Card>

                {/* Status Message */}
                <Box
                  p={16}
                  bg={paymentStatus?.status === 'completed' || paymentStatus?.status === 'paid'
                    ? 'rgba(34, 197, 94, 0.05)'
                    : 'rgba(200, 101, 61, 0.05)'}
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${paymentStatus?.status === 'completed' || paymentStatus?.status === 'paid'
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(200, 101, 61, 0.1)'}`,
                  }}
                >
                  <Text size="sm" c="dimmed" ta="center" style={{ lineHeight: 1.6 }}>
                    {paymentStatus?.status === 'completed' || paymentStatus?.status === 'paid'
                      ? 'Your payment has been confirmed. Proceeding to card issuance...'
                      : 'Payment is required to complete your check-in. Redirecting to payment terminal...'}
                  </Text>
                </Box>
              </>
            )}
          </Stack>

          {/* Back Button */}
          <Group justify="flex-start" mt={32}>
            <BackButton onClick={handleBack} text={t('common.back')} />
          </Group>
        </Paper>
      </Container>
    </>
  );
};

export default PaymentCheckPage;
