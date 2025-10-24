import React, { useState, useEffect } from 'react';
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
import { IconX, IconArrowLeft, IconLogin, IconPlus, IconKey } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [idleTimeoutId, setIdleTimeoutId] = useState(null);
  const [screenSaverTimeoutId, setScreenSaverTimeoutId] = useState(null);

  // Idle timeout return to Welcome after 2min
  useEffect(() => {
    const resetIdleTimeout = () => {
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }
      if (screenSaverTimeoutId) {
        clearTimeout(screenSaverTimeoutId);
      }

      const idleTimeout = setTimeout(() => {
        navigate('/');
      }, 120000); // 2 minutes

      const screenSaverTimeout = setTimeout(() => {
        // Could implement screen saver here
        console.log('Screen saver activated');
      }, 120000); // 2 minutes

      setIdleTimeoutId(idleTimeout);
      setScreenSaverTimeoutId(screenSaverTimeout);
    };

    // Reset timeout on any user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimeout, true);
    });

    resetIdleTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimeout, true);
      });
      if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
      }
      if (screenSaverTimeoutId) {
        clearTimeout(screenSaverTimeoutId);
      }
    };
  }, [navigate, idleTimeoutId, screenSaverTimeoutId]);

  const handleExit = () => {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    if (screenSaverTimeoutId) {
      clearTimeout(screenSaverTimeoutId);
    }
    navigate('/');
  };

  const handleBack = () => {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    if (screenSaverTimeoutId) {
      clearTimeout(screenSaverTimeoutId);
    }
    navigate('/');
  };

  const handleCheckIn = () => {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    if (screenSaverTimeoutId) {
      clearTimeout(screenSaverTimeoutId);
    }
    navigate('/checkin');
  };

  const handleNewReservation = () => {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    if (screenSaverTimeoutId) {
      clearTimeout(screenSaverTimeoutId);
    }
    navigate('/reservation/search');
  };

  const handleLostCard = () => {
    if (idleTimeoutId) {
      clearTimeout(idleTimeoutId);
    }
    if (screenSaverTimeoutId) {
      clearTimeout(screenSaverTimeoutId);
    }
    navigate('/lost-card');
  };

  const buttonStyle = {
    width: '100%',
    maxWidth: '500px',
    height: '80px',
    backgroundColor: '#C8653D',
    color: '#FFFFFF',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '20px',
    textTransform: 'uppercase',
    fontFamily: 'sans-serif',
    padding: '20px 100px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const hoverStyle = {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#B8552F',
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
          maxWidth: '800px',
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
              {t('mainMenu.title')}
            </Title>
          </Group>
          
          <Button
            variant="light"
            size="sm"
            leftSection={<IconX size={16} />}
            onClick={handleExit}
            style={{
              backgroundColor: '#E0E0E0',
              color: '#000000',
              border: '1px solid #D0D0D0',
              borderRadius: '8px',
            }}
          >
            Exit
          </Button>
        </Group>

        {/* Main Buttons Section */}
        <Stack gap="xl" mb="xl" align="center" style={{ minHeight: '400px', justifyContent: 'center' }}>
          <Button
            size="xl"
            p="xl"
            leftSection={<IconLogin size={24} />}
            onClick={handleCheckIn}
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, hoverStyle);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.checkIn')}
          </Button>

          <Button
            size="xl"
            p="xl"
            leftSection={<IconPlus size={24} />}
            onClick={handleNewReservation}
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, hoverStyle);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.newReservation')}
          </Button>

          <Button
            size="xl"
            p="xl"
            leftSection={<IconKey size={24} />}
            onClick={handleLostCard}
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, hoverStyle);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.lostCard')}
          </Button>
        </Stack>

        {/* Bottom Section - Back Button */}
        <Group justify="flex-start" style={{ marginTop: '20px' }}>
          <Button
            variant="filled"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '16px',
              fontFamily: 'sans-serif',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8552F';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#C8653D';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {t('mainMenu.back')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default MainMenuPage;
