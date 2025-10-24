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
  Grid,
  Image,
  Card,
} from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../stores/languageStore';

const languages = [
  { value: 'en', label: 'English', flag: '/flags/gb.png' },
  { value: 'es', label: 'Español', flag: '/flags/es.png' },
  { value: 'fr', label: 'Français', flag: '/flags/fr.png' },
  { value: 'de', label: 'Deutsch', flag: '/flags/de.png' },
  { value: 'it', label: 'Italiano', flag: '/flags/it.png' },
  { value: 'pt', label: 'Português', flag: '/flags/pt.png' },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [timeoutId, setTimeoutId] = useState(null);

  // // Auto-timeout to MainMenu after 30s
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     navigate('/home');
  //   }, 30000);
  //   setTimeoutId(timeout);

  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   };
  // }, [navigate]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleContinue = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    navigate('/home');
  };

  const handleExit = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    navigate('/');
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
              UNO HOTELS
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

        {/* Logo and Welcome */}
        <Stack gap="lg" mb="xl" align="center">
          <Box
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: '#C8653D',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0 auto',
            }}
          >
            UNO HOTELS
          </Box>
          
          <Title order={1} c="#0B152A" fw={700} ta="center">
            {t('welcome.title')}
          </Title>
          
          <Text c="#777777" size="lg" ta="center">
            {t('welcome.subtitle')}
          </Text>
        </Stack>

        {/* Language Selection */}
        <Stack gap="lg" mb="xl">
          <Text size="lg" fw={600} c="#0B152A" ta="center">
            {t('welcome.selectLanguage')}
          </Text>
          
          <Grid gutter="md">
            {languages.map((lang) => (
              <Grid.Col span={6} key={lang.value}>
                <Card
                  withBorder
                  p="lg"
                  radius="md"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: language === lang.value ? '3px solid #C8653D' : '2px solid #E0E0E0',
                    backgroundColor: language === lang.value ? '#FFF5F2' : '#FFFFFF',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                      borderColor: '#C8653D',
                    }
                  }}
                  onClick={() => handleLanguageChange(lang.value)}
                >
                  <Stack align="center" gap="md">
                    <Box style={{ position: 'relative' }}>
                      <Image
                        src={lang.flag}
                        alt={lang.label}
                        width={60}
                        height={40}
                        radius="sm"
                        style={{ objectFit: 'cover' }}
                      />
                      {language === lang.value && (
                        <Box
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#C8653D',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <IconCheck size={12} />
                        </Box>
                      )}
                    </Box>
                    
                    <Text 
                      size="md" 
                      fw={600} 
                      c={language === lang.value ? '#C8653D' : '#0B152A'}
                      ta="center"
                    >
                      {lang.label}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>

        {/* Continue Button */}
        <Box ta="center">
          <Button
            size="xl"
            p="xl"
            onClick={handleContinue}
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px 80px',
              fontWeight: 'bold',
              fontSize: '18px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.backgroundColor = '#B8552F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.backgroundColor = '#C8653D';
            }}
          >
            {t('welcome.continue')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default WelcomePage;
