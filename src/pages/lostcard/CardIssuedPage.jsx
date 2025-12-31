import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Alert,
} from '@mantine/core';
import { IconCheck, IconHome, IconKey, IconMail } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import PropertyHeader from '../../components/PropertyHeader';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';

const CardIssuedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const guestData = location.state?.guestData;
  const cardData = location.state?.cardData;

  // Log card reissue event
  const logCardReissueMutation = useMutation({
    mutationFn: async (data) => {
      try {
        await apiClient.post('/logs/card-reissue', data);
      } catch (err) {
        console.error('Failed to log card reissue:', err);
      }
    },
  });

  useEffect(() => {
    if (!guestData || !cardData) {
      navigate('/lost-card');
      return;
    }

    // Log card reissue completion
    logCardReissueMutation.mutate({
      reservationId: guestData.reservationId,
      roomNumber: guestData.roomNumber,
      guestName: guestData.guestName,
      reissueTime: new Date().toISOString(),
      newCardId: cardData.cardId,
      oldCardDeactivated: cardData.oldCardDeactivated,
    });

  }, [guestData, cardData, navigate, logCardReissueMutation]);

  const handleReturnHome = () => {
    navigate('/home');
  };

  if (!guestData || !cardData) {
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
          borderRadius: '10px',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
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
            {t('cardIssued.success')}
          </Title>

          {/* Card Information */}
          <Alert
            icon={<IconKey size={20} />}
            title="New Card Details"
            color="green"
            variant="light"
            style={{ borderRadius: '8px', width: '100%' }}
          >
            <Stack gap="xs">
              <Text size="md" fw={500}>
                {t('cardIssued.takeCard')}
              </Text>
              <Text size="sm" c="#666666">
                Access Code: {cardData.accessCode}
              </Text>
              <Text size="sm" c="#666666">
                Room: {guestData.roomNumber}
              </Text>
            </Stack>
          </Alert>

          {/* Old Card Notice */}
          {cardData.oldCardDeactivated && (
            <Alert
              icon={<IconCheck size={16} />}
              title="Security Notice"
              color="blue"
              variant="light"
              style={{ borderRadius: '8px', width: '100%' }}
            >
              <Text size="sm" fw={500}>
                {t('cardIssued.oldCardDeactivated')}
              </Text>
            </Alert>
          )}

          {/* Email Confirmation */}
          <Alert
            icon={<IconMail size={20} />}
            title="Digital Key"
            color="blue"
            variant="light"
            style={{ borderRadius: '8px', width: '100%' }}
          >
            <Stack gap="xs">
              <Text size="md" fw={500}>
                {t('cardIssued.keySent')}
              </Text>
              <Text size="sm" c="#666666">
                Check your email for detailed instructions and backup access.
              </Text>
            </Stack>
          </Alert>

          {/* Room Reminder */}
          <Box
            style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Text size="lg" fw={600} c="#0B152A">
              {t('cardIssued.roomNumber')}: {guestData.roomNumber}
            </Text>
          </Box>

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
              borderRadius: '8px',
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
            {t('cardIssued.returnHome')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default CardIssuedPage;
