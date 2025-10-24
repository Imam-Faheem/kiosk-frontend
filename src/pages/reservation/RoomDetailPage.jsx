import React from 'react';
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
  Checkbox,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const RoomDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { room, searchCriteria, guestDetails } = location.state || {};

  const handleConfirm = () => {
    navigate('/reservation/payment', {
      state: {
        room,
        searchCriteria,
        guestDetails,
      },
    });
  };

  const handleBack = () => {
    navigate('/reservation/guest-details', {
      state: { room, searchCriteria },
    });
  };

  if (!room || !guestDetails) {
    navigate('/reservation/search');
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
          maxWidth: '700px',
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
              {t('roomDetail.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl">
          <Card withBorder p="lg" radius="md">
            <Stack gap="sm">
              <Text size="xl" fw={600}>{room.name}</Text>
              <Text size="md" c="#666666">{room.description}</Text>
              <Text size="lg" fw={700}>Total: ${room.totalPrice} {room.currency}</Text>
            </Stack>
          </Card>

          <Checkbox
            label={t('roomDetail.terms')}
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.currentTarget.checked)}
          />
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
            }}
          >
            {t('common.back')}
          </Button>
          <Button
            size="lg"
            disabled={!termsAccepted}
            onClick={handleConfirm}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
            }}
          >
            {t('roomDetail.confirmBooking')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default RoomDetailPage;
