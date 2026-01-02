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
import { createBooking } from '../../services/bookingService';
import { updateApaleoReservationWithGuest } from '../../services/guestService';
import usePropertyStore from '../../stores/propertyStore';
import { EARLY_ARRIVAL_CONFIG } from '../../config/constants';

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
        
        const propertyId = usePropertyStore.getState().propertyId;
        if (!propertyId) {
          throw new Error('Property ID is required. Please select a property first.');
        }
        const hotelId = propertyId; // Use propertyId as hotelId for the endpoint
        
        // Prepare booking data for API - check all possible locations
        // The room object can be either:
        // 1. A transformed room object with unitGroupId/ratePlanId at top level
        // 2. A raw offer object with unitGroup/ratePlan nested objects
        // 3. A room object with _offerData containing the original offer
        const unitGroupId = room?.unitGroupId 
          ?? room?.roomTypeId 
          ?? room?.unitGroup?.id 
          ?? room?.unitGroup?.code
          ?? room?._offerData?.unitGroupId 
          ?? room?._offerData?.unitGroup?.id 
          ?? room?._offerData?.unitGroup?.code;
        
        const ratePlanId = room?.ratePlanId 
          ?? room?.ratePlan?.id 
          ?? room?.ratePlan?.code
          ?? room?._offerData?.ratePlanId 
          ?? room?._offerData?.ratePlan?.id 
          ?? room?._offerData?.ratePlan?.code;
        
        if (!unitGroupId || !ratePlanId) {
          console.error('[NewResPaymentPage] Missing room information:', { 
            room, 
            unitGroupId, 
            ratePlanId,
            roomKeys: Object.keys(room || {}),
            offerDataKeys: Object.keys(room?._offerData || {})
          });
          throw new Error(t('error.missingRoomInformation') ?? 'Missing room information. Please select a room again.');
        }
        
        const bookingPayload = {
          propertyId,
          unitGroupId,
          ratePlanId,
          arrival: searchCriteria.checkIn,
          departure: searchCriteria.checkOut,
          adults: Number(searchCriteria.guests) ?? 1,
          primaryGuest: {
            firstName: guestDetails.firstName,
            lastName: guestDetails.lastName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            address: {
              addressLine1: guestDetails.addressStreet,
              city: guestDetails.addressCity,
              postalCode: guestDetails.addressPostal,
              countryCode: guestDetails.country,
              ...(guestDetails.addressState ? { region: guestDetails.addressState } : {}),
            },
          },
        };
        
        console.log('[NewResPaymentPage] Booking payload:', bookingPayload);

        const bookingResult = await createBooking(bookingPayload, hotelId);
        
        console.log('[NewResPaymentPage] Booking result:', bookingResult);
        
        if (!bookingResult) {
          throw new Error('No response from booking service. Please try again.');
        }
        
        if (bookingResult.success === false || bookingResult.error) {
          const errorMsg = bookingResult.message ?? bookingResult.error ?? 'Failed to create booking. Please try again.';
          throw new Error(errorMsg);
        }
        
        // Extract reservation ID from booking response - check all possible fields
        const reservationIdSources = [
          bookingResult?.data?.reservationIds?.[0]?.id,
          bookingResult?.reservationIds?.[0]?.id,
          bookingResult?.data?.id,
          bookingResult?.data?.reservationId,
          bookingResult?.id,
          bookingResult?.reservationId,
          bookingResult?.bookingId,
          bookingResult?.data?.bookingId,
          bookingResult?.reservation?.id,
          bookingResult?.reservation?.bookingId,
          bookingResult?.reservations?.[0]?.id,
          bookingResult?.reservations?.[0]?.bookingId,
        ];
        const reservationId = reservationIdSources.find(id => id != null && id !== 'BOOKING-CREATED');
        
        console.log('[NewResPaymentPage] Extracted reservation ID:', reservationId);
        
        if (!reservationId) {
          console.warn('[NewResPaymentPage] No reservation ID found. Full booking result:', bookingResult);
          
          if (bookingResult.success === true || (bookingResult.success === undefined && !bookingResult.error && (bookingResult.data || bookingResult.id))) {
            console.log('[NewResPaymentPage] Booking appears successful. Proceeding without reservation ID...');
            
            setPaymentStatus('success');
            
            const reservation = {
              reservationId: 'PENDING',
              id: 'PENDING',
              guestDetails,
              roomTypeId: room?.unitGroup?.id ?? room?.roomTypeId,
              checkIn: searchCriteria?.checkIn ?? '',
              checkOut: searchCriteria?.checkOut ?? '',
              guests: searchCriteria?.guests,
              totalAmount: room?.totalGrossAmount?.amount ?? room?.totalPrice,
              currency: room?.totalGrossAmount?.currency ?? room?.currency,
              status: 'pending',
              room_assigned: bookingResult?.data?.assignedRoom?.room_assigned ?? false,
              bookingData: bookingResult,
              paymentData: { success: true, message: 'Payment will be processed separately' },
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
          
          const errorMsg = bookingResult?.message ?? bookingResult?.error ?? t('error.noReservationId') ?? 'Booking created but no reservation ID returned. Please contact support.';
          throw new Error(errorMsg);
        }

        // Update Apaleo reservation with additional guest info (if needed)
        try {
          await updateApaleoReservationWithGuest(reservationId, guestDetails, propertyId);
        } catch (updateErr) {
          // Continue even if update fails
        }

        setPaymentStatus('success');
        
        // Prepare reservation data
        const reservation = {
          bookingId: reservationId,
          reservationId,
          id: reservationId,
          guestDetails,
          roomTypeId: room.roomTypeId,
          checkIn: searchCriteria.checkIn,
          checkOut: searchCriteria.checkOut,
          guests: searchCriteria.guests,
          totalAmount: room.totalPrice,
          currency: room.currency,
          status: 'confirmed',
          bookingData: bookingResult,
        };

        // Navigate to completion page after a short delay to show success
        setTimeout(() => {
          const targetTime = EARLY_ARRIVAL_CONFIG.TARGET_TIME;
          const now = new Date();
          const [time, period] = targetTime.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          const target = new Date();
          target.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours, minutes, 0, 0);
          
          if (now < target) {
            navigate('/reservation/early-arrival', {
              state: {
                reservation,
                room,
                guestDetails,
              },
            });
          } else {
            navigate('/reservation/complete', {
              state: {
                reservation,
                room,
                guestDetails,
              },
            });
          }
        }, 1500);
        
      } catch (err) {
        setPaymentStatus('failed');
        
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
        hasProcessed.current = false; // Allow retry
      }
  };

  useEffect(() => {
    if (!room || !guestDetails) {
      console.warn('[NewResPaymentPage] Missing required data, redirecting to search:', { 
        hasRoom: !!room, 
        hasGuestDetails: !!guestDetails 
      });
      navigate('/reservation/search');
      return;
    }

    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    // Only auto-process if we have all required data
    if (room && guestDetails && searchCriteria && !hasProcessed.current) {
      // Verify room has required fields before processing
      const unitGroupId = room?.unitGroupId 
        ?? room?.roomTypeId 
        ?? room?.unitGroup?.id 
        ?? room?.unitGroup?.code
        ?? room?._offerData?.unitGroupId 
        ?? room?._offerData?.unitGroup?.id 
        ?? room?._offerData?.unitGroup?.code;
      
      const ratePlanId = room?.ratePlanId 
        ?? room?.ratePlan?.id 
        ?? room?.ratePlan?.code
        ?? room?._offerData?.ratePlanId 
        ?? room?._offerData?.ratePlan?.id 
        ?? room?._offerData?.ratePlan?.code;
      
      if (!unitGroupId || !ratePlanId) {
        console.error('[NewResPaymentPage] Room missing required fields, redirecting to search:', {
          room,
          unitGroupId,
          ratePlanId
        });
        setError(t('error.missingRoomInformation') ?? 'Missing room information. Please select a room again.');
        setTimeout(() => {
          navigate('/reservation/search', { replace: true });
        }, 3000);
        return;
      }
      
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
              <Text size="md" fw={600}>{room.name}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.guest')}:</Text>
              <Text size="md" fw={600}>{guestDetails.firstName} {guestDetails.lastName}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.checkIn')}:</Text>
              <Text size="md" fw={600}>{new Date(searchCriteria.checkIn).toLocaleDateString()}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="md" c="#666666">{t('newResPayment.checkOut')}:</Text>
              <Text size="md" fw={600}>{new Date(searchCriteria.checkOut).toLocaleDateString()}</Text>
            </Group>
          </Stack>
        </Card>

        {/* Total Amount Display */}
        <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', marginBottom: '20px' }}>
          <Stack gap="sm" align="center">
            <Text size="md" fw={500}>{t('newResPayment.totalAmount')}</Text>
            <Text size="3xl" fw={700} style={{ fontSize: '48px' }}>
              ${room.totalPrice} {room.currency}
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
              <Text size="md" c="red" ta="center">
                {error}
              </Text>
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
