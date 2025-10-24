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
  QRCode,
} from '@mantine/core';
import { IconAlertCircle, IconHome, IconRefresh } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api/apiClient';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
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
        errorMessage: errorMessage || 'Unknown error',
        errorType: errorType || 'generic',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }, [errorMessage, errorType, logErrorMutation]);

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
              {t('error.title')}
            </Title>
          </Group>
        </Group>

        {/* Error Content */}
        <Stack gap="xl" align="center" mb="xl">
          <Box
            style={{
              fontSize: '64px',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {getErrorIcon()}
          </Box>

          <Alert
            icon={<IconAlertCircle size={24} />}
            title={t('error.title')}
            color="red"
            variant="light"
            style={{
              width: '100%',
              borderRadius: '12px',
            }}
          >
            <Text size="lg" fw={500}>
              {getErrorMessage()}
            </Text>
          </Alert>

          <Text c="#666666" size="md" ta="center">
            {t('error.contactSupport')}
          </Text>

          {/* Support QR Code */}
          <Box ta="center">
            <QRCode
              value="https://support.unohotels.com"
              size={120}
              style={{
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                padding: '8px',
                backgroundColor: 'white',
              }}
            />
            <Text size="sm" c="#666666" mt="sm">
              Scan for support
            </Text>
          </Box>
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
