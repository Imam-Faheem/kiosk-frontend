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
  Grid,
  Image,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '/flags/de.png' },
  { code: 'en', name: 'English', flag: '/flags/gb.png' },
  { code: 'fr', name: 'Français', flag: '/flags/fr.png' },
  { code: 'es', name: 'Español', flag: '/flags/es.png' },
];

const UNOLanguageSelector = () => {
  const navigate = useNavigate();
  const { updateLanguage } = useAuthStore();

  const handleLanguageClick = (lang) => {
    updateLanguage(lang);
    navigate('/home');
  };

  const handleExit = () => {
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
            Welcome
          </Title>
          
          <Text c="#777777" size="lg" ta="center">
            Bitte wählen Sie Ihre Sprache / Please select your language
          </Text>
        </Stack>

        {/* Language Selection Grid (2x2 layout) */}
        <Grid gutter="md" mb="xl">
          {languages.map((lang) => (
            <Grid.Col span={6} key={lang.code}>
              <Button
                variant="light"
                size="xl"
                p="xl"
                onClick={() => handleLanguageClick(lang.code)}
                style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <Image
                  src={lang.flag}
                  alt={`${lang.name} flag`}
                  width={50}
                  height={35}
                  style={{ 
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
                <Text size="lg" fw={600} c="#000000">
                  {lang.name}
                </Text>
              </Button>
            </Grid.Col>
          ))}
        </Grid>

        {/* Start Button */}
        <Box ta="center">
          <Button
            size="xl"
            p="xl"
            style={{
              backgroundColor: '#C8653D',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px 80px',
              fontWeight: 'bold',
              fontSize: '18px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => navigate('/home')}
          >
            START
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UNOLanguageSelector;
