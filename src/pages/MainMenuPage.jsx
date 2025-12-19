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
import { isBeforeTargetTime } from '../lib/timeUtils';
import { EARLY_ARRIVAL_CONFIG, MAIN_MENU_BUTTON_STYLES, CONTAINER_STYLES, PAPER_STYLES } from '../config/constants';
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
    if (isBeforeTargetTime(EARLY_ARRIVAL_CONFIG.TARGET_TIME)) {
      navigate('/checkin/early-arrival');
    } else {
      navigate('/checkin');
    }
  };

  const handleNewReservation = () => {
    navigate('/reservation/search');
  };

  const handleLostCard = () => {
    navigate('/lost-card');
  };

  return (
    <Container
      size="lg"
      style={CONTAINER_STYLES.centeredWithPadding}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={PAPER_STYLES.default}
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
            fullWidth
            leftSection={<IconKey size={28} />}
            onClick={handleCheckIn}
            styles={MAIN_MENU_BUTTON_STYLES.checkIn}
            uppercase
            fw={800}
            radius="md"
          >
            {t('mainMenu.checkIn')}
          </Button>

          <Button
            size="xl"
            fullWidth
            leftSection={<IconCalendar size={28} />}
            onClick={handleNewReservation}
            styles={MAIN_MENU_BUTTON_STYLES.base}
            uppercase
            fw={800}
            radius="md"
          >
            {t('mainMenu.newReservation')}
          </Button>

          <Button
            size="xl"
            fullWidth
            leftSection={<IconCreditCardOff size={28} />}
            onClick={handleLostCard}
            styles={MAIN_MENU_BUTTON_STYLES.base}
            uppercase
            fw={800}
            radius="md"
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
