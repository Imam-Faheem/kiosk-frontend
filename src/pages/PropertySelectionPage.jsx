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
  Image,
  Badge,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import usePropertyStore from "../stores/propertyStore";
import { getProperties, getKioskCapabilities } from "../services/propertyService";
import {
  getDefaultCapabilities,
  formatPropertyLabel,
  findPropertyById,
  getPropertyId,
} from "../lib/propertyUtils";
import { getPrimaryButtonStyles, getInputStyles } from "../constants/style.constants";
import { STORAGE_KEYS, REVERSE_CAPABILITY_MAP } from "../config/constants";
import UnoLogo from "../assets/uno.jpg";
import { Select, Button } from "@mantine/core";
import PropertyHeader from "../components/PropertyHeader";

// Convert capabilities object to array for storage
const convertCapabilitiesToArray = (capabilitiesObj) => {
  return Object.entries(capabilitiesObj ?? {})
    .filter(([_, enabled]) => enabled)
    .map(([key]) => REVERSE_CAPABILITY_MAP[key] ?? key);
};

// Property Select Dropdown Component
const PropertySelect = React.memo(({ properties, selectedPropertyId, onPropertySelect }) => {
  const selectData = useMemo(() => {
    return properties
      .filter((property) => getPropertyId(property))
      .map((property) => ({
        value: getPropertyId(property),
        label: formatPropertyLabel(property),
      }));
  }, [properties]);

  return (
    <Select
      label="Select Property"
      placeholder="Choose a property from the list"
      data={selectData}
      value={selectedPropertyId}
      onChange={onPropertySelect}
      searchable
      size="lg"
      styles={getInputStyles()}
      required
    />
  );
});

PropertySelect.displayName = 'PropertySelect';

// Property Details Component
const PropertyDetails = React.memo(({ properties, selectedPropertyId }) => {
  const selectedProperty = useMemo(() => 
    findPropertyById(properties, selectedPropertyId),
    [properties, selectedPropertyId]
  );

  if (!selectedPropertyId || !selectedProperty) return null;

  const logoUrl = selectedProperty?.configuration?.logo_url || UnoLogo;
  const propertyName = selectedProperty?.name || 'Unknown Property';
  const pmsType = selectedProperty?.pms_type || 'unknown';
  const config = selectedProperty?.configuration || {};

  return (
    <Box p="md" bg="gray.0" style={{ borderRadius: 12, border: "2px solid #C8653D" }}>
      <Stack gap="md">
        <Group gap="md">
          <Image
            src={logoUrl}
            alt={propertyName}
            height={80}
            width={80}
            radius="md"
            fit="cover"
            onError={(e) => {
              e.target.src = UnoLogo;
            }}
          />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="lg" fw={700}>{propertyName}</Text>
            <Badge color="orange" variant="light">{pmsType.toUpperCase()}</Badge>
          </Stack>
        </Group>
        <Stack gap="xs">
          <Text size="sm" fw={600}>Property Details:</Text>
          {config.support_email && (
            <Text size="sm" c="dimmed">
              <strong>Email:</strong> {config.support_email}
            </Text>
          )}
          {config.support_phone && (
            <Text size="sm" c="dimmed">
              <strong>Phone:</strong> {config.support_phone}
            </Text>
          )}
          {config.website_url && (
            <Text size="sm" c="dimmed">
              <strong>Website:</strong> {config.website_url}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
});

PropertyDetails.displayName = 'PropertyDetails';

// Continue Button Component
const ContinueButton = React.memo(({ onClick, disabled, loading }) => {
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
  const { configureProperty, propertyId: currentPropertyId, kioskId: currentKioskId } = usePropertyStore();
  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId ?? null);
  const [capabilities, setCapabilities] = useState(getDefaultCapabilities());
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
        
        // API returns: { success: true, data: { properties: [...], pagination: {...} } }
        const propertiesData = response?.data?.properties ?? [];
        
        if (!response.success && response.message) {
          setError(response.message ?? 'Failed to load properties. Please try again.');
        }
        
        setProperties(propertiesData);
        
        if (propertiesData.length > 0) {
          const firstPropertyId = getPropertyId(propertiesData[0]);
          if (!currentPropertyId && firstPropertyId) {
            setSelectedPropertyId(firstPropertyId);
          }
        }
      } catch (err) {
        setError(err.message ?? "Failed to load properties. Please try again.");
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
      setError("Please select a property to continue");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const selectedProperty = findPropertyById(properties, selectedPropertyId);
      if (!selectedProperty) {
        throw new Error("Selected property not found");
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
      setError(err.message ?? "Failed to save property selection. Please try again.");
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
          <PropertyHeader />
        </Group>

        <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222', marginBottom: '24px' }}>
          Property Setup
        </Title>

        {error && (
          <Box maw={600} mx="auto" mb="xl">
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
              {error}
            </Alert>
          </Box>
        )}

        <Stack gap="lg" maw={600} mx="auto" mb="xl" w="100%">
          {properties.length > 0 ? (
            <PropertySelect
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={handlePropertySelect}
            />
          ) : (
            <Box mb="xl">
              <Text c="dimmed" ta="center">
                No properties available. Please contact support.
              </Text>
            </Box>
          )}
        </Stack>

        <Stack align="center" gap="md">
          <ContinueButton
            onClick={handleContinue}
            disabled={!selectedPropertyId || saving}
            loading={saving}
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default PropertySelectionPage;
