import React, { useEffect, useState, useRef } from 'react';
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
  Badge,
  ActionIcon,
  Card,
} from '@mantine/core';
import { IconCheck, IconHome, IconMail, IconCopy, IconShield } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import '../../styles/animations.css';

const CardIssuedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showCelebration, setShowCelebration] = useState(false);
  const [copied, setCopied] = useState(false);
  const checkmarkRef = useRef(null);
  const isNavigatingRef = useRef(false);
  
  const guestData = location.state?.guestData;
  const cardData = location.state?.cardData;

  // Log card reissue event
  const logCardReissueMutation = useMutation({
    mutationFn: async (data) => {
      try {
        await apiClient.post('/logs/card-reissue', data);
      } catch (err) {
        console.error('Failed to log card reissue:', err);
      }
    },
  });

  useEffect(() => {
    if (!guestData || !cardData) {
      navigate('/lost-card');
      return;
    }

    // Log card reissue completion (non-blocking)
    logCardReissueMutation.mutate({
      reservationId: guestData.reservationId,
      roomNumber: guestData.roomNumber,
      guestName: guestData.guestName,
      reissueTime: new Date().toISOString(),
      newCardId: cardData.cardId,
      oldCardDeactivated: cardData.oldCardDeactivated,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger celebration animation on mount
  useEffect(() => {
    if (guestData && cardData) {
      setShowCelebration(true);
      setTimeout(() => {
        if (checkmarkRef.current) {
          checkmarkRef.current.classList.add('animate-checkmark');
        }
      }, 100);
    }
  }, [guestData, cardData]);

  const handleReturnHome = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    // Use React Router navigation for SPA navigation (no page reload)
    navigate('/home', { replace: true });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cardData.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = cardData.accessCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  if (!guestData || !cardData) {
    return null;
  }

  return (
    <>
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
            borderRadius: '10px',
          }}
        >
          {/* Header */}
          <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
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
                  marginRight: '0px',
                }}
              >
                UNO
              </Box>
              <Title order={2} c="#0B152A" fw={700} style={{ textTransform: 'uppercase' }}>
                {t('cardIssued.title')}
              </Title>
            </Group>
          </Group>

          {/* Success Content */}
          <Stack gap="lg" mb="xl" align="center">
            {/* Animated Success Checkmark */}
            <Box
              style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                marginBottom: '8px',
              }}
            >
              {/* Ripple Effects */}
              {showCelebration && (
                <>
                  <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px' }} />
                  <Box className="ripple-effect" style={{ top: '50%', left: '50%', marginTop: '-70px', marginLeft: '-70px', width: '140px', height: '140px', animationDelay: '0.3s' }} />
                </>
              )}

              {/* Success Circle with Glow */}
              <Box
                ref={checkmarkRef}
                className="glow-effect"
                style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    className="checkmark-circle"
                  />
                  <path
                    d="M 25 40 L 35 50 L 55 30"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="checkmark-path"
                  />
                </svg>
              </Box>

              {/* Sparkles */}
              {showCelebration && Array.from({ length: 8 }).map((_, i) => (
                <Box
                  key={i}
                  className="sparkle"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-70px)`,
                    animationDelay: `${0.5 + i * 0.1}s`,
                  }}
                />
              ))}
            </Box>

          <Title order={1} c="#16a34a" fw={700} ta="center" style={{ fontSize: '32px' }}>
            New card issued successfully
          </Title>

          {/* Room Number - Most Prominent */}
          <Card withBorder p={24} radius="md" w="100%" style={{ border: '2px solid #16a34a', backgroundColor: '#f0fdf4' }}>
            <Stack gap={8} align="center">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                Room Number
              </Text>
              <Text size="xl" fw={700} c="#16a34a" style={{ fontSize: '36px' }}>
                {guestData.roomNumber}
              </Text>
            </Stack>
          </Card>

          {/* Access Code - Second Most Prominent */}
          <Card withBorder p={24} radius="md" w="100%" style={{ border: '2px solid #16a34a', backgroundColor: '#f0fdf4' }}>
            <Stack gap={12}>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                Access Code
              </Text>
              <Group justify="space-between" align="center">
                <Text size="xl" fw={700} c="#16a34a" style={{ fontSize: '28px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {cardData.accessCode}
                </Text>
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="green"
                  onClick={handleCopyCode}
                  style={{ borderRadius: '8px' }}
                >
                  {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
                </ActionIcon>
              </Group>
              {copied && (
                <Text size="xs" c="green" ta="center">
                  Code copied to clipboard!
                </Text>
              )}
            </Stack>
          </Card>

          {/* Instruction Text */}
          <Text size="md" c="dimmed" ta="center" fw={500}>
            Please take your card from the slot
          </Text>

          {/* Old Card Notice with Security Badge */}
          {cardData.oldCardDeactivated && (
            <Alert
              icon={<IconShield size={18} />}
              title={
                <Group gap={8}>
                  <Text size="md" fw={700}>Security Notice</Text>
                  <Badge color="green" variant="filled" size="sm">
                    Secure
                  </Badge>
                </Group>
              }
              color="green"
              variant="light"
              style={{ borderRadius: '8px', width: '100%', backgroundColor: '#f0fdf4' }}
            >
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  Old card has been deactivated
                </Text>
                <Text size="xs" c="dimmed">
                  Deactivated at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Stack>
            </Alert>
          )}

          {/* Digital Key */}
          <Alert
            icon={<IconMail size={20} />}
            title={<Text size="md" fw={700}>Digital Key</Text>}
            color="blue"
            variant="light"
            style={{ borderRadius: '8px', width: '100%' }}
          >
            <Stack gap={8}>
              <Text size="md" fw={500}>
                New key sent to your email
              </Text>
              <Text size="sm" c="#666666">
                Check your email for detailed instructions and backup access.
              </Text>
            </Stack>
          </Alert>

        </Stack>

        {/* Return Home Button */}
        <Group justify="center" mt="md">
          <Button
            size="lg"
            leftSection={<IconHome size={20} stroke={2} />}
            onClick={handleReturnHome}
            bg="#C8653D"
            c="white"
            fw={600}
            styles={{
              root: {
                borderRadius: '12px',
                fontSize: '16px',
                padding: '12px 32px',
                height: 'auto',
                boxShadow: '0 4px 12px rgba(200, 101, 61, 0.25)',
              },
            }}
          >
            Return to Home
          </Button>
        </Group>
      </Paper>
    </Container>
    </>
  );
};

export default CardIssuedPage;
