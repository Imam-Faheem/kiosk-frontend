import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Paper,
  Text,
  Stack,
  Box,
  Loader,
  Alert,
  Title,
  Group,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import usePropertyStore from "../stores/propertyStore";
import { getProperties, getKioskCapabilities } from "../services/propertyService";
import { getPrimaryButtonStyles, getInputStyles } from "../constants/style.constants";
import { STORAGE_KEYS, REVERSE_CAPABILITY_MAP } from "../config/constants";
import UnoLogo from "../assets/uno.jpg";
import { Select, Button } from "@mantine/core";
import useLanguage from "../hooks/useLanguage";

// Convert capabilities object to array for storage
const convertCapabilitiesToArray = (capabilitiesObj) => {
  return Object.entries(capabilitiesObj ?? {})
    .filter(([_, enabled]) => enabled)
    .map(([key]) => REVERSE_CAPABILITY_MAP[key] ?? key);
};

// Property Select Component
const PropertySelect = React.memo(({ properties, selectedPropertyId, onPropertySelect, t }) => {
  const selectData = useMemo(() => {
    return properties
      .filter((property) => property?.id ?? property?.property_id)
      .map((property) => {
        const propertyId = property?.id ?? property?.property_id;
        const label = property?.name ?? property?.property_id ?? property?.id ?? "";
        return {
          value: propertyId,
          label,
        };
      });
  }, [properties]);

  return (
    <Select
      label={t('propertySelection.selectProperty')}
      placeholder={t('propertySelection.chooseProperty')}
      data={selectData}
      value={selectedPropertyId}
      onChange={onPropertySelect}
      searchable
      size="lg"
      styles={getInputStyles()}
    />
  );
});

PropertySelect.displayName = 'PropertySelect';

// Property Details Component
const PropertyDetails = React.memo(({ properties, selectedPropertyId, t }) => {
  const selectedProperty = useMemo(() => {
    if (!Array.isArray(properties) || !selectedPropertyId) return null;
    return properties.find((p) => (p.id === selectedPropertyId) || (p.property_id === selectedPropertyId)) ?? null;
  }, [properties, selectedPropertyId]);

  if (!selectedPropertyId || !selectedProperty) return null;

  return (
    <Box p="md" bg="gray.0" style={{ borderRadius: 12, border: "1px solid #E9ECEF" }}>
      <Stack gap="xs">
        <Text size="sm" fw={600}>{t('propertySelection.propertyDetails')}:</Text>
        <Text size="sm" c="dimmed">
          <strong>{t('propertySelection.name')}:</strong> {selectedProperty.name ?? selectedProperty?.id ?? selectedProperty?.property_id ?? ""}
        </Text>
      </Stack>
    </Box>
  );
});

PropertyDetails.displayName = 'PropertyDetails';

// Continue Button Component
const ContinueButton = React.memo(({ onClick, disabled, loading, t }) => {
  return (
    <Button
      size="xl"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      fw={700}
      tt="uppercase"
      radius="xl"
      px={80}
      py={20}
      styles={getPrimaryButtonStyles}
    >
      {loading ? "Saving..." : "Save"}
    </Button>
  );
});

ContinueButton.displayName = 'ContinueButton';

const PropertySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { configureProperty, propertyId: currentPropertyId, kioskId: currentKioskId } = usePropertyStore();
  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId ?? null);
  const [capabilities, setCapabilities] = useState({
    checkIn: true,
    reservations: true,
    cardIssuance: true,
    lostCard: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const storedProperty = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
      if (storedProperty) {
        const propertyData = JSON.parse(storedProperty);
        if (propertyData.propertyId) {
          navigate("/welcome", { replace: true });
        }
      }
    } catch {
      // Silently handle parse errors
    }
  }, [navigate]);

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProperties();
        const propertiesData = response.data ?? [];
        
        if (!response.success && response.message) {
          setError(response.message ?? t('error.failedToLoadProperties'));
        }
        
        setProperties(propertiesData);
        
        if (propertiesData.length > 0) {
          const firstPropertyId = propertiesData[0]?.id ?? propertiesData[0]?.property_id;
          if (!currentPropertyId && firstPropertyId) {
            setSelectedPropertyId(firstPropertyId);
          }
        }
      } catch {
        setError(t('error.failedToLoadProperties'));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentPropertyId]);

  const handlePropertySelect = useCallback((propertyId) => {
    setSelectedPropertyId(propertyId);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!selectedPropertyId) {
      setError(t('error.pleaseSelectProperty'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const selectedProperty = Array.isArray(properties) && selectedPropertyId
        ? properties.find((p) => (p.id === selectedPropertyId) || (p.property_id === selectedPropertyId)) ?? null
        : null;
      if (!selectedProperty) {
        throw new Error(t('error.selectedPropertyNotFound'));
      }

      // Convert capabilities to array format for storage
      const capabilitiesArray = convertCapabilitiesToArray(capabilities);
      
      // Save to localStorage
      const propertyConfig = {
        propertyId: selectedPropertyId,
        kioskId: currentKioskId ?? null,
        capabilities: capabilitiesArray,
        propertyName: selectedProperty.name ?? '',
        currency: selectedProperty.currency ?? 'USD',
      };
      
      localStorage.setItem(STORAGE_KEYS.KIOSK_PROPERTY, JSON.stringify(propertyConfig));

      // Configure property in store
      configureProperty({
        propertyId: selectedPropertyId,
        kioskId: currentKioskId ?? null,
        capabilities: capabilities,
        propertyData: selectedProperty,
      });

      navigate("/welcome");
    } catch (err) {
      setError(err.message ?? t('error.failedToSaveProperty'));
    } finally {
      setSaving(false);
    }
  }, [selectedPropertyId, properties, capabilities, currentKioskId, configureProperty, navigate]);

  if (loading) {
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
            maxWidth: '700px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '20px',
          }}
        >
          <Stack align="center" gap="md">
            <Loader size="lg" color="#C8653D" />
            <Text c="dimmed">Loading properties...</Text>
          </Stack>
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
          maxWidth: '700px',
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

        <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222', marginBottom: '24px' }}>
          {t('propertySelection.title')}
        </Title>

        {error && (
          <Box maw={600} mx="auto" mb="xl">
            <Alert icon={<IconAlertCircle size={16} />} title={t('error.title')} color="red">
              {error}
            </Alert>
          </Box>
        )}

        <Stack gap="lg" maw={600} mx="auto" mb="xl" w="100%">
          {properties.length > 0 ? (
            <>
              <PropertySelect
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={handlePropertySelect}
                t={t}
              />
              <PropertyDetails
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                t={t}
              />
            </>
          ) : (
            <Box mb="xl">
              <Text c="dimmed" ta="center">
                {t('propertySelection.noPropertiesAvailable')}
              </Text>
            </Box>
          )}
        </Stack>

        <Stack align="center" gap="md">
          <ContinueButton
            onClick={handleContinue}
            disabled={!selectedPropertyId || saving}
            loading={saving}
            t={t}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default PropertySelectionPage;
