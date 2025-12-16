import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Paper,
  Button,
  Text,
  Stack,
  Box,
  Loader,
  Alert,
  Title,
  Select,
  TextInput,
  Center,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import usePropertyStore from "../stores/propertyStore";
import { getProperties, getKioskCapabilities } from "../services/propertyService";
import {
  formatCapabilitiesText,
  getPropertyCurrency,
  createCapabilitiesCacheKey,
  getDefaultCapabilities,
  formatPropertyLabel,
  formatPropertyDescription,
  findPropertyById,
} from "../lib/propertyUtils";
import { getPrimaryButtonStyles, getInputStyles } from "../constants/style.constants";
import UnoLogo from "../assets/uno.jpg";

// Memoized Property Select Component
const PropertySelect = React.memo(({ properties, selectedPropertyId, capabilities, onPropertySelect }) => {
  const selectData = useMemo(() => {
    return properties.map((property) => {
      const caps = selectedPropertyId === property.id ? capabilities : {};
      return {
        value: property.id,
        label: formatPropertyLabel(property),
        description: formatPropertyDescription(property, caps),
      };
    });
  }, [properties, selectedPropertyId, capabilities]);

  return (
    <Select
      label="Select Property"
      placeholder="Choose a property"
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

// Memoized Property Details Component
const PropertyDetails = React.memo(({ properties, selectedPropertyId, capabilities, loadingCapabilities }) => {
  const selectedProperty = useMemo(() => {
    return findPropertyById(properties, selectedPropertyId);
  }, [properties, selectedPropertyId]);

  const currency = useMemo(() => {
    return getPropertyCurrency(selectedProperty);
  }, [selectedProperty]);

  const capabilitiesText = useMemo(() => {
    return formatCapabilitiesText(capabilities);
  }, [capabilities]);

  if (!selectedPropertyId || !selectedProperty) return null;

  return (
    <Box
      p="md"
      bg="gray.0"
      style={{ borderRadius: 12, border: "1px solid #E9ECEF" }}
    >
      <Stack gap="xs">
        <Text size="sm" fw={600}>
          Property Details:
        </Text>
        <Text size="sm" c="dimmed">
          <strong>ID:</strong> {selectedProperty.id}
        </Text>
        <Text size="sm" c="dimmed">
          <strong>Name:</strong> {selectedProperty.name || selectedProperty.id}
        </Text>
        <Text size="sm" c="dimmed">
          <strong>Currency:</strong> {currency}
        </Text>
        <Text size="sm" c="dimmed">
          <strong>Capabilities:</strong> {loadingCapabilities ? "Loading..." : capabilitiesText}
        </Text>
      </Stack>
    </Box>
  );
});

PropertyDetails.displayName = 'PropertyDetails';

// Memoized Continue Button Component
const ContinueButton = React.memo(({ onClick, disabled, loading }) => {
  const buttonStyles = useMemo(() => getPrimaryButtonStyles, []);

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
      styles={buttonStyles}
    >
      {loading ? "Saving..." : "Save"}
    </Button>
  );
});

ContinueButton.displayName = 'ContinueButton';

const PropertySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { configureProperty, propertyId: currentPropertyId, kioskId: currentKioskId } = usePropertyStore();
  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId || null);
  const [kioskId, setKioskId] = useState(currentKioskId || "");
  const [capabilities, setCapabilities] = useState({});
  const capabilitiesCacheRef = React.useRef(new Map()); // Use ref for cache to avoid dependency issues
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingCapabilities, setLoadingCapabilities] = useState(false);

  const fetchCapabilities = useCallback(async (propertyId, kioskIdValue) => {
    if (!propertyId) return;
    
    // Create cache key
    const cacheKey = createCapabilitiesCacheKey(propertyId, kioskIdValue);
    
    // Check cache first
    if (capabilitiesCacheRef.current.has(cacheKey)) {
      setCapabilities(capabilitiesCacheRef.current.get(cacheKey));
      return;
    }
    
    try {
      setLoadingCapabilities(true);
      const caps = await getKioskCapabilities(propertyId, kioskIdValue || null);
      const capabilitiesData = caps || getDefaultCapabilities();
      
      // Update cache and state
      capabilitiesCacheRef.current.set(cacheKey, capabilitiesData);
      setCapabilities(capabilitiesData);
    } catch (err) {
      console.error("Failed to fetch capabilities:", err);
      // Use default capabilities on error
      const defaultCaps = getDefaultCapabilities();
      capabilitiesCacheRef.current.set(cacheKey, defaultCaps);
      setCapabilities(defaultCaps);
    } finally {
      setLoadingCapabilities(false);
    }
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProperties();
        // getProperties now always returns { success: true, data: [...] } 
        const propertiesData = response.data || [];
        setProperties(propertiesData);
        
        // If properties exist and a property is already selected, fetch its capabilities
        if (propertiesData.length > 0 && currentPropertyId) {
          await fetchCapabilities(currentPropertyId, currentKioskId);
        } else if (propertiesData.length > 0 && !currentPropertyId) {
          // Pre-select the first one if no property is currently configured
          const firstPropertyId = propertiesData[0].id;
          setSelectedPropertyId(firstPropertyId);
          await fetchCapabilities(firstPropertyId, null);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        // Even on error, getProperties returns fallback properties, so this shouldn't happen
        setError(err.message || "Failed to load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentPropertyId, currentKioskId, fetchCapabilities]);

  const handlePropertySelect = useCallback(async (propertyId) => {
    setSelectedPropertyId(propertyId);
    // Fetch capabilities for the selected property
    await fetchCapabilities(propertyId, kioskId || null);
  }, [fetchCapabilities, kioskId]);

  const handleKioskIdChange = useCallback(async (value) => {
    setKioskId(value);
    // If a property is selected, refetch capabilities with the new kiosk ID
    if (selectedPropertyId) {
      await fetchCapabilities(selectedPropertyId, value || null);
    }
  }, [selectedPropertyId, fetchCapabilities]);

  const handleContinue = useCallback(async () => {
    if (!selectedPropertyId) {
      setError("Please select a property to continue");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Find the selected property object
      const selectedProperty = findPropertyById(properties, selectedPropertyId);
      
      if (!selectedProperty) {
        throw new Error("Selected property not found");
      }

      // Use already fetched capabilities or fetch them if not available
      let finalCapabilities = capabilities;
      if (!finalCapabilities || Object.keys(finalCapabilities).length === 0) {
        const cacheKey = createCapabilitiesCacheKey(selectedPropertyId, kioskId);
        if (capabilitiesCacheRef.current.has(cacheKey)) {
          finalCapabilities = capabilitiesCacheRef.current.get(cacheKey);
        } else {
          finalCapabilities = await getKioskCapabilities(selectedPropertyId, kioskId || null);
          capabilitiesCacheRef.current.set(cacheKey, finalCapabilities);
        }
      }

      // Save to localStorage: {propertyId, kioskId, capabilities}
      const propertyConfig = {
        propertyId: selectedPropertyId,
        kioskId: kioskId || null,
        capabilities: finalCapabilities,
      };
      
      // Save to localStorage explicitly
      localStorage.setItem('property-config', JSON.stringify(propertyConfig));

      // Configure property in store (also saves to localStorage via Zustand persist)
      configureProperty({
        propertyId: selectedPropertyId,
        kioskId: kioskId || null,
        capabilities: finalCapabilities,
        propertyData: selectedProperty,
      });

      // Reset saving state before navigation
      setSaving(false);

      // Navigate to WelcomePage on success
      navigate("/welcome");
    } catch (err) {
      console.error("Failed to save property selection:", err);
      setError(err.message || "Failed to save property selection. Please try again.");
      setSaving(false);
    }
  }, [selectedPropertyId, properties, capabilities, kioskId, configureProperty, navigate]);

  if (loading) {
    return (
      <Container size="lg" pos="relative" style={{ minHeight: "100vh" }} bg="gray.0">
        <Center style={{ minHeight: "100vh", padding: 40 }}>
          <Paper
            withBorder
            shadow="md"
            p={40}
            radius="xl"
            w="100%"
            maw={850}
            style={{ borderRadius: 24 }}
          >
            <Center>
              <Stack align="center" gap="md" pt={60}>
                <Loader size="lg" color="#C8653D" />
                <Text c="dimmed">Loading properties...</Text>
              </Stack>
            </Center>
          </Paper>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" pos="relative" style={{ minHeight: "100vh" }} bg="gray.0">
      <Center style={{ minHeight: "100vh", padding: 40 }}>
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          w="100%"
          maw={850}
          pos="relative"
          style={{ borderRadius: 24, paddingTop: 100 }}
        >
          {/* Top-left hotel name */}
          <Box
            pos="absolute"
            top={24}
            left={32}
            style={{
              fontSize: 28,
              color: "#222",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            <Text fw={600} size="xl">
              UNO HOTELS
            </Text>
          </Box>

          {/* Centered Logo */}
          <Center>
            <Box mb="md">
              <img
                src={UnoLogo}
                alt="UNO Hotel Logo"
                style={{ width: 110, height: "auto", borderRadius: 8 }}
              />
            </Box>
          </Center>

          {/* Main heading */}
          <Title order={3} c="dark" mb="xl" fw={500} style={{ fontSize: 22 }} ta="center">
            Property Setup
          </Title>

          {/* Error Alert */}
          {error && (
            <Box maw={600} mx="auto" mb="xl">
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                {error}
              </Alert>
            </Box>
          )}

          {/* Property Selection - Dropdown */}
          <Stack gap="lg" maw={600} mx="auto" mb="xl" w="100%">
            {properties.length > 0 ? (
              <>
                <PropertySelect
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  capabilities={capabilities}
                  onPropertySelect={handlePropertySelect}
                />

                {/* Property Details Display */}
                <PropertyDetails
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  capabilities={capabilities}
                  loadingCapabilities={loadingCapabilities}
                />

                {/* Optional Kiosk ID Input */}
                <TextInput
                  label="Kiosk ID (Optional)"
                  placeholder="Enter kiosk ID"
                  value={kioskId}
                  onChange={(e) => handleKioskIdChange(e.target.value)}
                  size="lg"
                  styles={getInputStyles()}
                />
              </>
            ) : (
              <Box mb="xl">
                <Text c="dimmed" ta="center">
                  No properties available. Please contact support.
                </Text>
              </Box>
            )}
          </Stack>

          {/* Continue Button */}
          <Center>
            <ContinueButton
              onClick={handleContinue}
              disabled={!selectedPropertyId || saving}
              loading={saving}
            />
          </Center>
        </Paper>
      </Center>
    </Container>
  );
};

export default PropertySelectionPage;

