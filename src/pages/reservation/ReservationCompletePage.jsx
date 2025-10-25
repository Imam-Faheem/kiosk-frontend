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
} from '@mantine/core';
import { IconCheck, IconHome } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';

const ReservationCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { reservation, cardData } = location.state || {};

  useEffect(() => {
    if (!reservation) {
      navigate('/reservation/search');
      return;
    }

  }, [reservation, navigate]);

  const handleReturnHome = () => {
    navigate('/home');
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
                marginRight: '0px',
              }}
            >
              UNO
            </Box>
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('reservationComplete.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl" align="center">
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
            }}
          >
            <IconCheck size={60} />
          </Box>

          <Title order={1} c="#0B152A" fw={700} ta="center">
            {t('reservationComplete.success')}
          </Title>

          <Text size="lg" fw={600}>
            {t('reservationComplete.reservationNumber')}: {reservation.reservationId}
          </Text>

        </Stack>

        <Group justify="center">
          <Button
            size="lg"
            leftSection={<IconHome size={20} />}
            onClick={handleReturnHome}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            {t('reservationComplete.returnHome')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default ReservationCompletePage;
