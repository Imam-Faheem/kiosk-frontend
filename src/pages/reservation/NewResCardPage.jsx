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
import UnoLogo from '../../assets/uno.jpg';
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
              style={{ 
                fontSize: '30px !important',
                color: 'rgb(34, 34, 34)',
                fontWeight: '600',
                letterSpacing: '1px',
                marginLeft: '-9px'
              }}
            >
              UNO HOTELS
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
          <IconCreditCard size={64} color="#C8653D" />
          
          {/* Progress Steps */}
          <Stepper active={0} orientation="vertical" size="sm" style={{ width: '100%' }}>
            <Stepper.Step 
              label={t('newResCard.steps.preparing')} 
              description="Preparing your new card"
              icon={<Loader size="sm" color="#C8653D" />}
            />
            <Stepper.Step 
              label={t('newResCard.steps.encoding')} 
              description="Encoding card with your details"
            />
            <Stepper.Step 
              label={t('newResCard.steps.sending')} 
              description="Sending confirmation"
            />
          </Stepper>
          
          <Text size="lg" fw={600} c="#C8653D">{t('newResCard.takeCard')}</Text>
        </Stack>
      </Paper>
    </Container>
  );
};

export default NewResCardPage;
