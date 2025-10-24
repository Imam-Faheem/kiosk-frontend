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
import { IconArrowLeft, IconCreditCard } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCardMutation } from '../../hooks/useCardMutation';

const NewResCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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
          setTimeout(() => {
            navigate('/reservation/complete', {
              state: {
                reservation,
                cardData: result.data,
              },
            });
          }, 3000);
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
                marginRight: '15px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('newResCard.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          <Loader size="lg" color="#C8653D" />
          <Text size="lg">{t('newResCard.steps.preparing')}</Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default NewResCardPage;
