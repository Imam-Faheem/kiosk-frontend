import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Title,
  Stack,
} from '@mantine/core';
import { IconKey, IconCalendar, IconCreditCardOff } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import UnoLogo from '../assets/uno.jpg';
import BackButton from '../components/BackButton';

const MainMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();


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

  const baseButtonStyle = {
    width: '100%',
    maxWidth: '560px',
    height: '96px',
    backgroundColor: '#C8653D',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontWeight: 800,
    fontSize: '22px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    padding: '24px 100px',
    border: 'none',
    transition: 'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
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
        padding: '24px',
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
          maxWidth: '820px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '20px',
        }}
      >
        {/* Header */}
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
                fontWeight: 800,
                letterSpacing: '1px',
                marginLeft: '-9px',
                fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
              }}
            >
              UNO HOTELS
            </Title>
          </Group>
          
        </Group>

        {/* Main Buttons Section */}
        <Stack gap="xl" mb="xl" align="center" style={{ minHeight: '420px', justifyContent: 'center', gap: '32px' }}>
          <Button
            size="xl"
            p="xl"
            leftSection={<IconKey size={28} />}
            onClick={handleCheckIn}
            style={{
              ...baseButtonStyle,
              padding: '26px 100px',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
              e.currentTarget.style.backgroundColor = '#B8552F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.45)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.checkIn')}
          </Button>

          <Button
            size="xl"
            p="xl"
            leftSection={<IconCalendar size={28} />}
            onClick={handleNewReservation}
            style={baseButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
              e.currentTarget.style.backgroundColor = '#B8552F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.newReservation')}
          </Button>

          <Button
            size="xl"
            p="xl"
            leftSection={<IconCreditCardOff size={28} />}
            onClick={handleLostCard}
            style={baseButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
              e.currentTarget.style.backgroundColor = '#B8552F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('mainMenu.lostCard')}
          </Button>
        </Stack>

        {/* Bottom Section - Back Button */}
        <Group justify="flex-start" style={{ marginTop: '20px' }}>
          <BackButton onClick={handleBack} text={t('mainMenu.back')} />
        </Group>
      </Paper>
    </Container>
  );
};

export default MainMenuPage;
