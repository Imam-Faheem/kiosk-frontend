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
import { IconX, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const UNOLayout = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  showExitButton = true,
  showLogo = true,
  showHeader = true,
  onBack,
  onExit,
  backButtonText = "Back",
  exitButtonText = "Exit",
  className = "",
  ...props
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/');
    }
  };

  return (
    <Container
      size="lg"
      className={`uno-layout ${className}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#FFFFFF',
      }}
      {...props}
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
        {showHeader && (
          <Group justify="space-between" mb="xl">
            <Group>
              {showLogo && (
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
              )}
              <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
                UNO HOTELS
              </Title>
            </Group>
            
            {showExitButton && (
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
                {exitButtonText}
              </Button>
            )}
          </Group>
        )}

        {/* Title and Subtitle */}
        {(title || subtitle) && (
          <Stack gap="md" mb="xl" align="center">
            {title && (
              <Title order={1} c="#0B152A" fw={700} ta="center">
                {title}
              </Title>
            )}
            {subtitle && (
              <Text c="#777777" size="lg" ta="center">
                {subtitle}
              </Text>
            )}
          </Stack>
        )}

        {/* Main Content */}
        <Box mb="xl">
          {children}
        </Box>

        {/* Back Button */}
        {showBackButton && (
          <Group justify="flex-start">
            <Button
              variant="filled"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: 'bold',
              }}
            >
              {backButtonText}
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
};

export default UNOLayout;
