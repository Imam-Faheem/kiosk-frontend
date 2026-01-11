import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Stack,
  Loader,
  Text,
  Alert,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCheckIn, useIssueCard } from '../../hooks/useCheckInFlow';
import PropertyHeader from '../../components/PropertyHeader';

/**
 * Process check-in and issue card after payment (or if no payment required)
 * Flow: Check-in (PUT) -> Issue Card (POST) -> Card Dispensing
 */
const ProcessCheckInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { reservation, reservationId } = location.state || {};

  // Step 1: Process check-in
  const checkIn = useCheckIn({
    onSuccess: (result) => {
      // Step 2: Issue card after successful check-in
      issueCard.mutate({ reservationId });
    },
    onError: (err) => {
      console.error('[ProcessCheckInPage] Check-in error:', err);
      navigate('/checkin', {
        state: { error: err?.message ?? 'Failed to process check-in' },
      });
    },
  });

  // Step 2: Issue card
  const issueCard = useIssueCard({
    onSuccess: (result) => {
      // Navigate to card dispensing page
      navigate('/checkin/card-dispensing', {
        state: {
          reservation,
          reservationId,
          cardData: result?.data ?? result,
        },
      });
    },
    onError: (err) => {
      console.error('[ProcessCheckInPage] Issue card error:', err);
      
      // Check if it's a hardware error (dispenser/encoder)
      const errorMessage = err?.message ?? '';
      const isHardwareError = errorMessage.toLowerCase().includes('dispenser') ||
                              errorMessage.toLowerCase().includes('encoder') ||
                              errorMessage.toLowerCase().includes('hardware');
      
      if (isHardwareError) {
        // Show hardware error but still navigate to complete page
        navigate('/checkin/complete', {
          state: {
            reservation,
            reservationId,
            error: err?.message ?? 'Card issued but hardware error occurred',
            cardData: null,
          },
        });
      } else {
        navigate('/checkin', {
          state: { error: err?.message ?? 'Failed to issue card' },
        });
      }
    },
  });

  useEffect(() => {
    if (!reservation || !reservationId) {
      navigate('/checkin');
      return;
    }

    // Start check-in process
    checkIn.mutate({ reservationId, checkInData: {} });
  }, [reservation, reservationId, navigate]);

  const isLoading = checkIn.isPending || issueCard.isPending;
  const error = checkIn.error || issueCard.error;

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
          <PropertyHeader />
        </Group>

        <Stack gap="lg" align="center">
          {isLoading && (
            <>
              <Loader size="lg" color="#C8653D" />
              <Text size="lg" c="#666666" ta="center">
                {checkIn.isPending && t('checkIn.processingCheckIn')}
                {issueCard.isPending && t('checkIn.issuingCard')}
              </Text>
            </>
          )}

          {error && (
            <Alert
              icon={<IconX size={20} />}
              title={t('error.title')}
              color="red"
              variant="light"
              style={{ borderRadius: '8px', width: '100%' }}
            >
              {error?.message ?? error}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ProcessCheckInPage;
