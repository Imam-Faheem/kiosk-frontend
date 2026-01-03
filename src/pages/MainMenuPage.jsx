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
import { EARLY_ARRIVAL_CONFIG, MAIN_MENU_BUTTON_STYLES, CONTAINER_STYLES, PAPER_STYLES } from '../config/constants';
import useLanguage from '../hooks/useLanguage';
import usePropertyStore from '../stores/propertyStore';
import PropertyHeader from '../components/PropertyHeader';
import BackButton from '../components/BackButton';

const MainMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isConfigured, propertyId } = usePropertyStore();

  // Redirect to property setup if property is not configured
  useEffect(() => {
    if (!isConfigured || !propertyId) {
      navigate('/', { replace: true });
    }
  }, [isConfigured, propertyId, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckIn = () => {
    const targetTime = EARLY_ARRIVAL_CONFIG.CHECKIN_TIME;
    const now = new Date();
    const [hours, minutes] = targetTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (now < target) {
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
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader titleStyle={{ fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }} />
        </Group>

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

        <Group justify="flex-start" style={{ marginTop: '20px' }}>
          <BackButton onClick={handleBack} text={t('mainMenu.back')} />
        </Group>
      </Paper>
    </Container>
  );
};

export default MainMenuPage;
