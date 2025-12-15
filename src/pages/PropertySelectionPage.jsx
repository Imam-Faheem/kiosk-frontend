import React, { useState, useEffect } from "react";
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
import UnoLogo from "../assets/uno.jpg";

const PropertySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { configureProperty, propertyId: currentPropertyId, kioskId: currentKioskId } = usePropertyStore();
  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId || null);
  const [kioskId, setKioskId] = useState(currentKioskId || "");
  const [capabilities, setCapabilities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingCapabilities, setLoadingCapabilities] = useState(false);

  const fetchCapabilities = async (propertyId, kioskIdValue) => {
    if (!propertyId) return;
    
    try {
      setLoadingCapabilities(true);
      const caps = await getKioskCapabilities(propertyId, kioskIdValue || null);
      setCapabilities(caps || {});
    } catch (err) {
      console.error("Failed to fetch capabilities:", err);
      // Use default capabilities on error
      setCapabilities({
        checkIn: true,
        reservations: true,
        cardIssuance: true,
        lostCard: true,
      });
    } finally {
      setLoadingCapabilities(false);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPropertyId, currentKioskId]);

  const handlePropertySelect = async (propertyId) => {
    setSelectedPropertyId(propertyId);
    // Fetch capabilities for the selected property
    await fetchCapabilities(propertyId, kioskId || null);
  };

  const handleKioskIdChange = async (value) => {
    setKioskId(value);
    // If a property is selected, refetch capabilities with the new kiosk ID
    if (selectedPropertyId) {
      await fetchCapabilities(selectedPropertyId, value || null);
    }
  };

  const handleContinue = async () => {
    if (!selectedPropertyId) {
      setError("Please select a property to continue");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Find the selected property object
      const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
      
      if (!selectedProperty) {
        throw new Error("Selected property not found");
      }

      // Use already fetched capabilities or fetch them if not available
      let finalCapabilities = capabilities;
      if (!finalCapabilities || Object.keys(finalCapabilities).length === 0) {
        finalCapabilities = await getKioskCapabilities(selectedPropertyId, kioskId || null);
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
  };

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
                <Select
                  label="Select Property"
                  placeholder="Choose a property"
                  data={properties.map((property) => {
                    const currency = property.currency || property.defaultCurrency || "N/A";
                    const caps = selectedPropertyId === property.id ? capabilities : {};
                    const capsText =
                      Object.keys(caps).length > 0
                        ? Object.entries(caps)
                            .filter(([_, enabled]) => enabled)
                            .map(([key]) => key)
                            .join(", ") || "None"
                        : "Loading...";

                    return {
                      value: property.id,
                      label: `${property.name || property.id} (${property.id})`,
                      description: `Currency: ${currency} | Capabilities: ${capsText}`,
                    };
                  })}
                  value={selectedPropertyId}
                  onChange={handlePropertySelect}
                  searchable
                  size="lg"
                  styles={{
                    input: {
                      borderRadius: 12,
                      fontSize: 16,
                      padding: 16,
                    },
                    label: {
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    },
                  }}
                />

                {/* Property Details Display */}
                {selectedPropertyId && (
                  <Box
                    p="md"
                    bg="gray.0"
                    style={{ borderRadius: 12, border: "1px solid #E9ECEF" }}
                  >
                    <Stack gap="xs">
                      {(() => {
                        const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
                        if (!selectedProperty) return null;

                        const currency =
                          selectedProperty.currency || selectedProperty.defaultCurrency || "N/A";

                        return (
                          <>
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
                            {loadingCapabilities ? (
                              <Text size="sm" c="dimmed">
                                <strong>Capabilities:</strong> Loading...
                              </Text>
                            ) : (
                              <Text size="sm" c="dimmed">
                                <strong>Capabilities:</strong>{" "}
                                {Object.keys(capabilities).length > 0
                                  ? Object.entries(capabilities)
                                      .filter(([_, enabled]) => enabled)
                                      .map(([key]) => key)
                                      .join(", ") || "None"
                                  : "None"}
                              </Text>
                            )}
                          </>
                        );
                      })()}
                    </Stack>
                  </Box>
                )}

                {/* Optional Kiosk ID Input */}
                <TextInput
                  label="Kiosk ID (Optional)"
                  placeholder="Enter kiosk ID"
                  value={kioskId}
                  onChange={(e) => handleKioskIdChange(e.target.value)}
                  size="lg"
                  styles={{
                    input: {
                      borderRadius: 12,
                      fontSize: 16,
                      padding: 16,
                    },
                    label: {
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 8,
                    },
                  }}
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
            <Button
              size="xl"
              onClick={handleContinue}
              disabled={!selectedPropertyId || saving}
              loading={saving}
              fw={700}
              tt="uppercase"
              radius="xl"
              px={80}
              py={20}
              styles={(theme) => ({
                root: {
                  backgroundColor: "#C8653D",
                  color: theme.white,
                  borderRadius: 20,
                  fontSize: 18,
                  border: "none",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  transition:
                    "transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
                  "&:hover": {
                    backgroundColor: "#B8552F",
                    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                    transform: "scale(1.02)",
                  },
                  "&:disabled, &[data-disabled]": {
                    backgroundColor: theme.colors.gray[4],
                    color: theme.colors.gray[6],
                    transform: "none",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                  },
                },
              })}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Center>
        </Paper>
      </Center>
    </Container>
  );
};

export default PropertySelectionPage;

