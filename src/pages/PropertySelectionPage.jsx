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

      // Configure property in store
      configureProperty({
        propertyId: selectedPropertyId,
        kioskId: kioskId || null,
        capabilities: finalCapabilities,
        propertyData: selectedProperty,
      });

      // Navigate to home
      navigate("/home");
    } catch (err) {
      console.error("Failed to save property selection:", err);
      setError(err.message || "Failed to save property selection. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container
        size="lg"
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#f9f9f9",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <Paper
          withBorder
          shadow="md"
          p={40}
          radius="xl"
          style={{
            width: "100%",
            maxWidth: "850px",
            backgroundColor: "#ffffff",
            textAlign: "center",
            paddingTop: "100px",
          }}
        >
          <Loader size="lg" color="#C8653D" />
          <Text mt="md" c="dimmed">
            Loading properties...
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      size="lg"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <Paper
        withBorder
        shadow="md"
        p={40}
        radius="xl"
        style={{
          width: "100%",
          maxWidth: "850px",
          backgroundColor: "#ffffff",
          border: "1px solid #f0f0f0",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
          borderRadius: "24px",
          position: "relative",
          textAlign: "center",
          paddingTop: "100px",
        }}
      >
        {/* Top-left hotel name */}
        <h2
          style={{
            position: "absolute",
            top: "20px",
            left: "30px",
            fontSize: "30px !important",
            color: "#222",
            fontWeight: "600",
            letterSpacing: "1px",
            marginLeft: "-9px",
          }}
        >
          UNO HOTELS
        </h2>

        {/* Centered Logo */}
        <img
          src={UnoLogo}
          alt="UNO Hotel Logo"
          style={{
            width: "110px",
            height: "auto",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        />

        {/* Main heading */}
        <Title
          order={3}
          style={{
            color: "#333",
            fontSize: "22px",
            marginBottom: "40px",
            fontWeight: "500",
          }}
        >
          Property Setup
        </Title>

        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            mb="xl"
            style={{ maxWidth: "600px", margin: "0 auto 2rem" }}
          >
            {error}
          </Alert>
        )}

        {/* Property Selection - Dropdown */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            width: "100%",
          }}
        >
          {properties.length > 0 ? (
            <>
              <Select
                label="Select Property"
                placeholder="Choose a property"
                data={properties.map((property) => {
                  const currency = property.currency || property.defaultCurrency || "N/A";
                  const caps = selectedPropertyId === property.id ? capabilities : {};
                  const capsText = Object.keys(caps).length > 0
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
                    borderRadius: "12px",
                    fontSize: "16px",
                    padding: "16px",
                  },
                  label: {
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  },
                }}
              />

              {/* Property Details Display */}
              {selectedPropertyId && (
                <Box
                  style={{
                    padding: "16px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "12px",
                    border: "1px solid #E9ECEF",
                  }}
                >
                  <Stack gap="xs">
                    {(() => {
                      const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
                      if (!selectedProperty) return null;
                      
                      const currency = selectedProperty.currency || selectedProperty.defaultCurrency || "N/A";
                      
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
                    borderRadius: "12px",
                    fontSize: "16px",
                    padding: "16px",
                  },
                  label: {
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "8px",
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
        </Box>

        {/* Continue Button */}
        <Box ta="center">
          <Button
            size="xl"
            onClick={handleContinue}
            disabled={!selectedPropertyId || saving}
            loading={saving}
            style={{
              backgroundColor: "#C8653D",
              color: "#FFFFFF",
              borderRadius: "20px",
              padding: "20px 80px",
              fontWeight: "bold",
              fontSize: "18px",
              textTransform: "uppercase",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
              border: "none",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.backgroundColor = "#B8552F";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.backgroundColor = "#C8653D";
              }
            }}
          >
            {saving ? "Saving..." : "Continue"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PropertySelectionPage;

