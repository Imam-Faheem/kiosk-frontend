import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Button,
  Text,
  Stack,
  Box,
  Grid,
  Card,
  Loader,
  Alert,
  Title,
} from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import usePropertyStore from "../stores/propertyStore";
import { getProperties, getKioskCapabilities } from "../services/propertyService";
import UnoLogo from "../assets/uno.jpg";

const PropertySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setProperty, configureProperty, propertyId: currentPropertyId } = usePropertyStore();
  
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProperties();
        // getProperties now always returns { success: true, data: [...] }
        const properties = response.data || [];
        setProperties(properties);
        
        // If properties exist, pre-select the first one if no property is currently configured
        if (properties.length > 0 && !currentPropertyId) {
          setSelectedPropertyId(properties[0].id);
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
  }, [currentPropertyId]);

  const handlePropertySelect = (property) => {
    setSelectedPropertyId(property.id);
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

      // Fetch capabilities (optional, uses defaults if endpoint doesn't exist)
      const capabilities = await getKioskCapabilities(selectedPropertyId);

      // Configure property in store
      configureProperty({
        propertyId: selectedPropertyId,
        kioskId: null, // Can be set later if needed
        capabilities,
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
          Select Property
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

        {/* Property Selection - Grid */}
        {properties.length > 0 ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: "2rem",
            }}
          >
            <Grid gutter="lg" style={{ maxWidth: "600px", width: "100%" }}>
              {properties.map((property) => (
                <Grid.Col span={properties.length === 1 ? 12 : 6} key={property.id}>
                  <Card
                    withBorder
                    p="lg"
                    radius="lg"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border:
                        selectedPropertyId === property.id
                          ? "3px solid #C8653D"
                          : "2px solid #F2F2F2",
                      backgroundColor:
                        selectedPropertyId === property.id ? "#FFF8F5" : "#FFFFFF",
                      borderRadius: "16px",
                      boxShadow:
                        selectedPropertyId === property.id
                          ? "0 6px 16px rgba(200, 101, 61, 0.2)"
                          : "0 4px 10px rgba(0, 0, 0, 0.08)",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={() => handlePropertySelect(property)}
                  >
                    <Stack align="center" gap="md">
                      <Box style={{ position: "relative" }}>
                        {selectedPropertyId === property.id && (
                          <Box
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              width: "24px",
                              height: "24px",
                              backgroundColor: "#C8653D",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              zIndex: 1,
                            }}
                          >
                            <IconCheck size={14} />
                          </Box>
                        )}
                      </Box>

                      <Text
                        size="lg"
                        fw={700}
                        c={selectedPropertyId === property.id ? "#C8653D" : "#0B152A"}
                        ta="center"
                      >
                        {property.name || property.id}
                      </Text>

                      {property.address && (
                        <Text size="sm" c="dimmed" ta="center">
                          {property.address.city || property.address.country || ""}
                        </Text>
                      )}

                      {property.id && (
                        <Text size="xs" c="dimmed" ta="center">
                          ID: {property.id}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box mb="xl">
            <Text c="dimmed" ta="center">
              No properties available. Please contact support.
            </Text>
          </Box>
        )}

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

