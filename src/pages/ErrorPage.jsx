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
  Alert,
  Card,
} from '@mantine/core';
import { IconAlertCircle, IconHome, IconRefresh } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api/apiClient';
import UnoLogo from '../assets/uno.jpg';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const { errorMessage, errorType, previousPath } = location.state || {};

  // Log error to backend
  const logErrorMutation = useMutation({
    mutationFn: async (errorData) => {
      try {
        await apiClient.post('/logs/error', errorData);
      } catch (err) {
        console.error('Failed to log error:', err);
      }
    },
  });

  useEffect(() => {
    // Log error when component mounts
    if (errorMessage || errorType) {
      logErrorMutation.mutate({
        errorMessage: errorMessage || t('error.generic'),
        errorType: errorType || 'generic',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }, [errorMessage, errorType, logErrorMutation, t]);

  const handleTryAgain = () => {
    if (previousPath) {
      navigate(previousPath);
    } else {
      navigate('/home');
    }
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const getErrorMessage = () => {
    if (errorType && t(`error.${errorType}`) !== `error.${errorType}`) {
      return t(`error.${errorType}`);
    }
    if (errorMessage) {
      return errorMessage;
    }
    return t('error.generic');
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'paymentFailed':
        return '💳';
      case 'cardDispenserError':
        return '🔧';
      case 'reservationNotFound':
        return '🔍';
      case 'roomNotAvailable':
        return '🏨';
      default:
        return '⚠️';
    }
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
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Group>
            <img
              src={UnoLogo}
              alt={t('common.unoHotelLogo')}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                marginRight: '0px',
                objectFit: 'cover',
              }}
            />
            <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
              {t('error.title')}
            </Title>
          </Group>
        </Group>

        {/* Error Content */}
        <Stack gap="xl" align="center" mb="xl">
          {/* Error Icon */}
          <Box
            style={{
              fontSize: '80px',
              textAlign: 'center',
              marginBottom: '20px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            }}
          >
            {getErrorIcon()}
          </Box>

          {/* Error Message Display */}
          <Alert
            icon={<IconAlertCircle size={32} />}
            title={t('error.title')}
            color="red"
            variant="filled"
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '2px solid #dc3545',
            }}
          >
            <Text size="xl" fw={600} c="white">
              {getErrorMessage()}
            </Text>
          </Alert>

          {/* Friendly Explanation */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
            <Stack gap="sm" align="center">
              <Text size="lg" fw={600} c="#C8653D">{t('error.whatHappened')}</Text>
              <Text size="md" c="#666666" ta="center">
                {errorType === 'paymentFailed' && t('error.paymentFailedExplanation')}
                {errorType === 'cardDispenserError' && t('error.cardDispenserErrorExplanation')}
                {errorType === 'reservationNotFound' && t('error.reservationNotFoundExplanation')}
                {errorType === 'roomNotAvailable' && t('error.roomNotAvailableExplanation')}
                {!errorType && t('error.genericExplanation')}
              </Text>
            </Stack>
          </Card>

          {/* Contact Support Info */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#C8653D', color: 'white', width: '100%' }}>
            <Stack gap="sm" align="center">
              <Text size="lg" fw={600}>{t('error.needHelp')}</Text>
              <Text size="md" ta="center">
                {t('error.supportAvailable')}
              </Text>
              <Group gap="xl" justify="center">
                <Box ta="center">
                  <Text size="sm" fw={500}>{t('error.phone')}</Text>
                  <Text size="md" fw={600}>+1-800-UNO-HELP</Text>
                </Box>
                <Box ta="center">
                  <Text size="sm" fw={500}>{t('error.email')}</Text>
                  <Text size="md" fw={600}>support@unohotels.com</Text>
                </Box>
              </Group>
            </Stack>
          </Card>
        </Stack>

        {/* Action Buttons */}
        <Stack gap="md">
          <Button
            size="lg"
            leftSection={<IconRefresh size={20} />}
            onClick={handleTryAgain}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '12px',
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
            {t('error.tryAgain')}
          </Button>

          <Button
            size="lg"
            variant="outline"
            leftSection={<IconHome size={20} />}
            onClick={handleBackToHome}
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
            {t('error.backToHome')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ErrorPage;
