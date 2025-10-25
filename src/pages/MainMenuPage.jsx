import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Title,
  Stack,
} from '@mantine/core';
import { IconX, IconArrowLeft, IconLogin, IconPlus, IconKey } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import UnoLogo from '../assets/uno.jpg';

const MainMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleExit = () => {
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckIn = () => {
    navigate('/checkin');
  };

  const handleNewReservation = () => {
    navigate('/reservation/search');
  };

  const handleLostCard = () => {
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
            <img
              src={UnoLogo}
              alt="UNO Hotel Logo"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                marginRight: '15px',
                objectFit: 'cover',
              }}
            />
            <Title 
              order={2} 
              style={{ 
                fontSize: '24px',
                color: 'rgb(34, 34, 34)',
                fontWeight: '600',
                letterSpacing: '1px'
              }}
            >
              UNO HOTELS
            </Title>
          </Group>
          
          <Button
            size="lg"
            leftSection={<IconX size={16} />}
            onClick={handleExit}
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
            size="lg"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
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
            {t('mainMenu.back')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default MainMenuPage;
