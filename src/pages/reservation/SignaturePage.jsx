import React, { useRef, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Title,
  Stack,
  Box,
  Card,
  Alert,
  Divider,
} from '@mantine/core';
import { IconSignature, IconCheck, IconRefresh } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import useLanguage from '../../hooks/useLanguage';
import UnoLogo from '../../assets/uno.jpg';
import BackButton from '../../components/BackButton';
import '../../styles/signature.css';

const SignaturePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const sigCanvas = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const { room, searchCriteria, guestDetails, savedGuest } = location.state || {};

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClear = () => {
    sigCanvas.current.clear();
    setIsSigned(false);
    setSignatureData(null);
  };

  const handleSave = () => {
    if (sigCanvas.current.isEmpty()) {
      return;
    }
    
    const signatureDataURL = sigCanvas.current.toDataURL();
    setSignatureData(signatureDataURL);
    setIsSigned(true);
  };

  const handleContinue = () => {
    if (!isSigned) {
      return;
    }

    navigate('/reservation/payment', {
      state: {
        room,
        searchCriteria,
        guestDetails,
        savedGuest, // Include saved guest data if available
        signature: signatureData,
      },
    });
  };

  const handleBack = () => {
    navigate('/reservation/room-details', {
      state: { room, searchCriteria, guestDetails },
    });
  };

  // Handle missing data without immediate redirect
  if (!room || !guestDetails) {
    return (
      <Container
        size="lg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <Text size="lg" c="red">
            {t('signature.errorMissingData')}
          </Text>
          <Button
            variant="outline"
            mt="md"
            onClick={() => navigate('/reservation/search')}
            style={{ borderColor: '#C8653D', color: '#C8653D', borderRadius: '12px' }}
          >
            {t('common.backToSearch')}
          </Button>
        </Paper>
      </Container>
    );
  }

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
        <Group justify="space-between" mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Group>
            <img
              src={UnoLogo}
              alt={t('common.unoHotelLogo')}
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
                fontWeight: '600',
                letterSpacing: '1px',
                marginLeft: '-9px'
              }}
            >
              {t('mainMenu.title')}
            </Title>
          </Group>
        </Group>

        <Stack gap="lg" mb="xl">
          {/* Page Title */}
          <Box style={{ textAlign: 'center' }}>
            <Title order={1} size="h2" mb="md" c="#C8653D">
              <IconSignature size={32} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              {t('signature.title')}
            </Title>
            <Text size="lg" c="#666666">
              {t('signature.subtitle')}
            </Text>
          </Box>

          {/* Guest Information Card */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Text size="lg" fw={600} c="#C8653D">
                {t('signature.guestInfo')}
              </Text>
              <Group justify="space-between">
                <Text size="md" c="#666666">{t('signature.guestName')}:</Text>
                <Text size="md" fw={600}>{guestDetails.firstName} {guestDetails.lastName}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="md" c="#666666">{t('signature.room')}:</Text>
                <Text size="md" fw={600}>{room.name}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="md" c="#666666">{t('signature.checkIn')}:</Text>
                <Text size="md" fw={600}>{formatDate(searchCriteria.checkIn)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="md" c="#666666">{t('signature.checkOut')}:</Text>
                <Text size="md" fw={600}>{formatDate(searchCriteria.checkOut)}</Text>
              </Group>
            </Stack>
          </Card>

          {/* Signature Canvas */}
          <Card withBorder p="lg" radius="md">
            <Stack gap="md">
              <Text size="md" fw={600}>
                {t('signature.signatureLabel')}
              </Text>
              
              <Box className="signature-container">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'signature-canvas',
                    style: {
                      width: '100%',
                      height: '200px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                    }
                  }}
                  backgroundColor="#ffffff"
                  penColor="#000000"
                  onEnd={() => {
                    if (!sigCanvas.current.isEmpty()) {
                      setIsSigned(true);
                    }
                  }}
                />
                
                {sigCanvas.current && sigCanvas.current.isEmpty() && (
                  <Box className="signature-placeholder">
                    {t('signature.signHere')}
                  </Box>
                )}
              </Box>

              {/* Signature Status */}
              {isSigned && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title={t('signature.signed')}
                  color="green"
                  variant="light"
                >
                  {t('signature.signedMessage')}
                </Alert>
              )}

              {/* Signature Controls */}
              <Group justify="center" gap="md">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="outline"
                  onClick={handleClear}
                  className="signature-button"
                  style={{
                    borderColor: '#dc3545',
                    color: '#dc3545',
                    borderRadius: '12px',
                  }}
                >
                  {t('signature.clear') || 'Clear'}
                </Button>
                
                <Button
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  disabled={!isSigned}
                  className="signature-button"
                  style={{
                    backgroundColor: '#28a745',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                  }}
                >
                  {t('signature.save') || 'Save Signature'}
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Terms and Conditions */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack gap="sm">
              <Text size="md" fw={600} c="#C8653D">
                {t('signature.termsTitle') || 'Terms and Conditions'}
              </Text>
              <Text size="sm" c="#666666">
                {t('signature.termsText') || 'By signing above, you agree to the hotel\'s terms and conditions, including cancellation policies, check-in/check-out times, and any applicable fees. Your signature serves as electronic consent for this reservation.'}
              </Text>
            </Stack>
          </Card>
        </Stack>

        <Divider my="lg" />

        {/* Navigation Buttons */}
        <Group justify="space-between">
          <BackButton onClick={handleBack} text={t('common.back')} />
          <Group gap="md">
            <Button
              size="lg"
              variant="outline"
              onClick={handleBack}
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
              {t('signature.editDetails') || 'Edit Details'}
            </Button>
            
            <Button
              size="lg"
              disabled={!isSigned}
              onClick={handleContinue}
              style={{
                backgroundColor: '#C8653D',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#B8552F';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#C8653D';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {t('signature.continue') || 'Continue to Payment'}
            </Button>
          </Group>
        </Group>
      </Paper>
    </Container>
  );
};

export default SignaturePage;
