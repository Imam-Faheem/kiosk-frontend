import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Loader,
  Card,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { saveGuestDetails } from '../../services/guestService';
import { processPaymentByTerminal } from '../../services/paymentService';

const NewResPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  const { room, searchCriteria, guestDetails } = location.state || {};

  const processPayment = async () => {
      try {
        hasProcessed.current = true;
        setPaymentStatus('processing');
        
        const ratePlanId = room?.ratePlan?.id ?? room?.ratePlanId;
        if (!ratePlanId) {
          throw new Error(t('error.missingRoomInformation'));
        }

        const bookingResult = await saveGuestDetails(guestDetails, searchCriteria, room);
        
        // Check if booking was successful (even if unit assignment failed)
        if (bookingResult?.success) {
          // Extract reservation ID from various possible response structures
          const reservationId = bookingResult?.data?.reservationIds?.[0]?.id ?? 
                               bookingResult?.data?.id ?? 
                               bookingResult?.data?.reservationId ??
                               bookingResult?.reservationIds?.[0]?.id ??
                               bookingResult?.id ?? 
                               bookingResult?.reservationId;
          
          // If we have a reservation ID, proceed with payment
          if (reservationId && reservationId !== 'BOOKING-CREATED') {
            setPaymentStatus('processing');
            
            let paymentResult = null;
            try {
              paymentResult = await processPaymentByTerminal(reservationId);
            } catch (paymentError) {
              const paymentErrorMessage = paymentError?.response?.data?.message ?? paymentError?.message ?? 'Payment processing failed';
              throw new Error(`Booking created successfully, but payment failed: ${paymentErrorMessage}`);
            }
            
            setPaymentStatus('success');
            
            const reservation = {
              reservationId,
              id: reservationId,
              guestDetails,
              roomTypeId: room?.unitGroup?.id ?? room?.roomTypeId,
              checkIn: searchCriteria?.checkIn ?? '',
              checkOut: searchCriteria?.checkOut ?? '',
              guests: searchCriteria?.guests,
              totalAmount: room?.totalGrossAmount?.amount ?? room?.totalPrice,
              currency: room?.totalGrossAmount?.currency ?? room?.currency,
              status: 'confirmed',
              bookingData: bookingResult,
              paymentData: paymentResult,
            };

            setTimeout(() => {
              navigate('/reservation/complete', {
                state: {
                  reservation,
                  room,
                  guestDetails,
                },
              });
            }, 1500);
            return;
          }
          
          // If booking was successful but no reservation ID (unit assignment failed)
          const reservation = {
            reservationId: reservationId ?? 'BOOKING-CONFIRMED',
            id: reservationId ?? 'BOOKING-CONFIRMED',
            guestDetails,
            roomTypeId: room?.unitGroup?.id ?? room?.roomTypeId,
            checkIn: searchCriteria?.checkIn ?? '',
            checkOut: searchCriteria?.checkOut ?? '',
            guests: searchCriteria?.guests,
            totalAmount: room?.totalGrossAmount?.amount ?? room?.totalPrice,
            currency: room?.totalGrossAmount?.currency ?? room?.currency,
            status: 'confirmed',
            bookingData: bookingResult,
          };
          
          setPaymentStatus('success');
          setTimeout(() => {
            navigate('/reservation/complete', {
              state: {
                reservation,
                room,
                guestDetails,
              },
            });
          }, 1500);
          return;
        }
        
        // Fallback: Extract reservation ID from various possible response structures
        const reservationId = bookingResult?.data?.reservationIds?.[0]?.id ?? 
                             bookingResult?.reservationIds?.[0]?.id ??
                             bookingResult?.data?.id ?? 
                             bookingResult?.id ?? 
                             bookingResult?.data?.reservationId ?? 
                             bookingResult?.reservationId;
        
        if (!reservationId) {
          throw new Error('Booking created successfully but no reservation ID returned. Please check your email for confirmation.');
        }

        setPaymentStatus('processing');
        
        let paymentResult = null;
        try {
          paymentResult = await processPaymentByTerminal(reservationId);
        } catch (paymentError) {
          const paymentErrorMessage = paymentError?.response?.data?.message ?? paymentError?.message ?? 'Payment processing failed';
          throw new Error(`Booking created successfully, but payment failed: ${paymentErrorMessage}`);
        }
        
        setPaymentStatus('success');
        
        const reservation = {
          reservationId,
          id: reservationId,
          guestDetails,
          roomTypeId: room?.unitGroup?.id ?? room?.roomTypeId,
          checkIn: searchCriteria?.checkIn ?? '',
          checkOut: searchCriteria?.checkOut ?? '',
          guests: searchCriteria?.guests,
          totalAmount: room?.totalGrossAmount?.amount ?? room?.totalPrice,
          currency: room?.totalGrossAmount?.currency ?? room?.currency,
          status: 'confirmed',
          bookingData: bookingResult,
          paymentData: paymentResult,
        };

        setTimeout(() => {
          navigate('/reservation/complete', {
            state: {
              reservation,
              room,
              guestDetails,
            },
          });
        }, 1500);
        
      } catch (err) {
        setPaymentStatus('failed');
        
        // Check if it's an availability error (fully booked, etc.)
        const isAvailabilityError = err?.isAvailabilityError ?? false;
        const lowerErrorMessage = (err?.message ?? '').toLowerCase();
        const availabilityKeywords = ['fully booked', 'not available', 'unit group', 'no longer available'];
        const isAvailability = isAvailabilityError || availabilityKeywords.some(keyword => lowerErrorMessage.includes(keyword));
        
        // Extract detailed error message from Apaleo
        const errorData = err?.response?.data;
        let errorMessage = t('error.failedToCreateBooking');
        
        if (errorData?.details?.messages && Array.isArray(errorData.details.messages)) {
          errorMessage = errorData.details.messages.join('. ');
        } else if (errorData?.messages && Array.isArray(errorData.messages)) {
          errorMessage = errorData.messages.join('. ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        
        // If it's an availability error, redirect to search page after a delay
        if (isAvailability) {
          setTimeout(() => {
            navigate('/reservation/search', { 
              replace: true,
              state: { 
                error: 'This room is no longer available for the selected dates. Please search for rooms again.',
                searchCriteria 
              }
            });
          }, 3000);
        }
        
        hasProcessed.current = false; // Allow retry
      }
  };

  useEffect(() => {
    if (!room || !guestDetails) {
      navigate('/reservation/search');
      return;
    }

    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    // Only auto-process if we have all required data
    if (room && guestDetails && searchCriteria && !hasProcessed.current) {
      processPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, guestDetails, searchCriteria, navigate]);

  const handleBack = () => {
    navigate('/reservation/room-details', {
      state: { room, searchCriteria, guestDetails },
    });
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
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
              {t('newResPayment.title')}
            </Title>
          </Group>
        </Group>

        {/* Booking Summary Display */}
        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
          <Stack gap="md">
            <Text size="lg" fw={600} c="#C8653D">{t('newResPayment.bookingSummary')}</Text>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.room')}:</Text>
              <Text size="md" fw={600}>{room?.unitGroup?.name ?? room?.name ?? ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.guest')}:</Text>
              <Text size="md" fw={600}>{guestDetails?.firstName ?? ''} {guestDetails?.lastName ?? ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.checkIn')}:</Text>
              <Text size="md" fw={600}>{searchCriteria?.checkIn ? new Date(searchCriteria.checkIn).toLocaleDateString() : ''}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.checkOut')}:</Text>
              <Text size="md" fw={600}>{searchCriteria?.checkOut ? new Date(searchCriteria.checkOut).toLocaleDateString() : ''}</Text>
            </Group>
          </Stack>
        </Card>

        {/* Total Amount Display */}
        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', marginBottom: '20px' }}>
          <Stack gap="sm" align="center">
            <Text size="md" fw={500}>{t('newResPayment.totalAmount')}</Text>
            <Text size="3xl" fw={700} style={{ fontSize: '48px' }}>
              {room?.totalGrossAmount?.currency ?? room?.currency ?? 'EUR'} {room?.totalGrossAmount?.amount ?? room?.totalPrice ?? 0}
            </Text>
          </Stack>
        </Card>

        {/* Payment Terminal Status */}
        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          {paymentStatus === 'processing' && <Loader size="lg" color="#C8653D" />}
          <Text size="xl" fw={600} ta="center">
            {paymentStatus === 'idle' && t('newResPayment.readyToProcessPayment')}
            {paymentStatus === 'processing' && t('newResPayment.swipeCard')}
            {paymentStatus === 'success' && t('newResPayment.bookingSuccessful')}
            {paymentStatus === 'failed' && t('newResPayment.bookingFailed')}
          </Text>
          {paymentStatus === 'processing' && (
            <Text size="md" c="#666666" ta="center">
              {t('newResPayment.processing')}
            </Text>
          )}
          {paymentStatus === 'success' && (
            <Text size="md" c="green" ta="center" fw={600}>
              {t('newResPayment.redirectingToConfirmation')}
            </Text>
          )}
          {error && (
            <Alert color="red" variant="light" style={{ width: '100%' }}>
              <Text size="md" c="red" ta="center" mb="md">
                {error}
              </Text>
              {(error.toLowerCase().includes('fully booked') || 
                error.toLowerCase().includes('not available') || 
                error.toLowerCase().includes('unit group')) && (
                <Button
                  variant="light"
                  color="red"
                  fullWidth
                  onClick={() => navigate('/reservation/search', { replace: true })}
                >
                  Search for Rooms Again
                </Button>
              )}
            </Alert>
          )}
        </Stack>

        <Group justify="space-between">
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            style={{
              borderColor: '#C8653D',
              color: '#C8653D',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C8653D';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#C8653D';
            }}
          >
            {t('common.back')}
          </Button>
          
          {paymentStatus === 'failed' && (
            <Button
              variant="outline"
              onClick={() => {
                hasProcessed.current = false;
                setPaymentStatus('idle');
                setError(null);
                processPayment();
              }}
              style={{
                borderColor: '#C8653D',
                color: '#C8653D',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              Retry Booking
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/reservation/search')}
            disabled={paymentStatus === 'processing'}
            style={{
              borderColor: '#dc3545',
              color: '#dc3545',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#dc3545';
              }
            }}
          >
            {t('newResPayment.cancelBooking')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default NewResPaymentPage;
