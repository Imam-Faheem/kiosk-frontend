import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Stepper,
  Loader,
} from '@mantine/core';
import { IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useCardMutation } from '../../hooks/useCardMutation';
import PropertyHeader from '../../components/PropertyHeader';
import BackButton from '../../components/BackButton';

const NewResCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { reservation, room } = location.state || {};
  const issueCard = useCardMutation('issue', {
    onSuccess: (result) => {
      if (result.success) {
        navigate('/reservation/complete', {
          state: { reservation, room, cardData: result.data }
        });
      }
    },
    onError: (err) => {
      console.error('Card issuance error:', err);
    }
  });

  useEffect(() => {
    if (!reservation) {
      navigate('/reservation/search');
      return;
    }

    const processCard = async () => {
      try {
        const result = await issueCard.mutateAsync({
          reservationId: reservation.reservationId,
          roomNumber: reservation.roomNumber || room.roomNumber,
          guestName: reservation.guestName,
        });

        if (result.success) {
          navigate('/reservation/complete', {
            state: {
              reservation,
              cardData: result.data,
            },
          });
        }
      } catch (err) {
        console.error('Card issuance error:', err);
      }
    };

    processCard();
  }, [reservation, room, navigate, issueCard]);

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
        <Group justify="space-between" mb="xl">
          <PropertyHeader />
        </Group>

        {/* Page title under logo */}
        <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222', textAlign: 'center', marginBottom: '12px' }}>
          Issuing Your New Key Card
        </Title>

        <Stack gap="lg" mb="xl" align="center">
          {/* Animated card icon to indicate progress */}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <IconCreditCard size={96} color="#C8653D" style={{ animation: 'spin 3s linear infinite' }} />
          
          {/* Progress Steps */}
          <Stepper active={0} orientation="vertical" size="sm" style={{ width: '100%' }} allowNextStepsSelect={false}>
            <Stepper.Step 
              label={t('newResCard.steps.preparing')} 
              description={t('newResCard.steps.preparingDescription')}
              icon={<Loader size="sm" color="#C8653D" />}
            />
            <Stepper.Step 
              label={t('newResCard.steps.encoding')} 
              description={t('newResCard.steps.encodingDescription')}
            />
            <Stepper.Step 
              label={t('newResCard.steps.sending')} 
              description={t('newResCard.steps.sendingDescription')}
            />
          </Stepper>
          {/* No final message on in-progress screen */}
        </Stack>
      </Paper>
    </Container>
  );
};

export default NewResCardPage;
