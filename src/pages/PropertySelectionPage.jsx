import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Paper, Text, Stack, Box, Loader, Alert, Title, Group, Select, Button, List } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import usePropertyStore from "../stores/propertyStore";
import { getPrimaryButtonStyles, getInputStyles } from "../constants/style.constants";
import PropertyHeader from "../components/PropertyHeader";
import useLanguage from "../hooks/useLanguage";
import { usePropertyQuery } from "../hooks/usePropertyQuery";

const SelectItem = React.forwardRef(({ label, image, ...others }, ref) => {
  // Extract itemComponent prop if it exists to prevent it from being passed to DOM
  const { itemComponent, ...restProps } = others;
  return (
    <div ref={ref} {...restProps} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
      {image && <img src={image} alt={label} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />}
      <span>{label}</span>
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

const PropertySelect = React.memo(({ properties, selectedPropertyId, onPropertySelect, t }) => {
  const selectData = useMemo(() =>
    properties
      .filter((p) => p?.id ?? p?.property_id)
      .map((p) => {
        const propertyId = p?.id ?? p?.property_id;
        const propertyName = p?.name ?? propertyId ?? "";
        return {
          value: propertyId,
          label: propertyName,
          image: p?.configuration?.logo_url || null,
        };
      }), [properties]);

  return (
    <Select
      label={t('propertySelection.selectProperty') || 'Select Property'}
      placeholder={t('propertySelection.chooseProperty') || 'Choose a property from the list'}
      data={selectData}
      value={selectedPropertyId}
      onChange={onPropertySelect}
      searchable
      size="lg"
      styles={getInputStyles()}
      itemComponent={SelectItem}
      required
      nothingFoundMessage={t('propertySelection.noPropertiesFound') || 'No properties found'}
      clearable={false}
    />
  );
});
PropertySelect.displayName = 'PropertySelect';

const PropertyDetails = React.memo(({ properties, selectedPropertyId, t }) => {
  const selectedProperty = useMemo(() => {
    if (!Array.isArray(properties) || !selectedPropertyId) return null;
    return properties.find((p) => (p.id === selectedPropertyId) || (p.property_id === selectedPropertyId)) ?? null;
  }, [properties, selectedPropertyId]);

  if (!selectedPropertyId || !selectedProperty) return null;

  const imageUrl = selectedProperty?.configuration?.logo_url;

  return (
    <Box p="md" bg="gray.0" style={{ borderRadius: 12, border: "1px solid #E9ECEF" }}>
      <Stack gap="md">
        <Text size="sm" fw={600}>{t('propertySelection.propertyDetails')}:</Text>
        <Group gap="md" align="flex-start">
          {imageUrl && <img src={imageUrl} alt={selectedProperty.name || t('propertySelection.property')} style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #E9ECEF' }} onError={(e) => e.target.style.display = 'none'} />}
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed"><strong>{t('propertySelection.name')}:</strong> {selectedProperty.name ?? selectedProperty?.id ?? selectedProperty?.property_id ?? ""}</Text>
            {selectedProperty?.configuration?.address && <Text size="sm" c="dimmed"><strong>{t('propertySelection.address')}:</strong> {selectedProperty.configuration.address}</Text>}
          </Stack>
        </Group>
      </Stack>
    </Box>
  );
});
PropertyDetails.displayName = 'PropertyDetails';

const ContinueButton = React.memo(({ onClick, disabled, loading, t }) => (
  <Button 
    size="xl" 
    onClick={onClick} 
    disabled={disabled} 
    loading={loading} 
    fw={700} 
    style={{ textTransform: 'uppercase' }}
    radius="xl" 
    px={80} 
    py={20} 
    styles={getPrimaryButtonStyles}
  >
    {loading ? t('common.saving') : t('common.save')}
  </Button>
));
ContinueButton.displayName = 'ContinueButton';

const PropertySelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { configureProperty, propertyId: currentPropertyId, kioskId: currentKioskId, isConfigured } = usePropertyStore();
  const [selectedPropertyId, setSelectedPropertyId] = useState(currentPropertyId ?? null);
  const [capabilities] = useState({ checkIn: true, reservations: true, cardIssuance: true, lostCard: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Use the hook to fetch properties
  const { data: propertiesResponse, isLoading: loading, error: queryError } = usePropertyQuery({
    enabled: !isConfigured,
  });

  const properties = useMemo(() => {
    return propertiesResponse?.data ?? [];
  }, [propertiesResponse]);

  useEffect(() => {
    if (isConfigured) navigate("/welcome", { replace: true });
  }, [isConfigured, navigate]);

  // Set initial selected property when properties are loaded
  useEffect(() => {
    if (properties.length > 0 && !currentPropertyId && !selectedPropertyId) {
      setSelectedPropertyId(properties[0]?.id ?? properties[0]?.property_id);
    }
  }, [properties, currentPropertyId, selectedPropertyId]);

  // Set error from query
  useEffect(() => {
    if (queryError) {
      setError(queryError.message || t('error.failedToLoadProperties'));
    } else if (propertiesResponse && !propertiesResponse.success) {
      setError(propertiesResponse.message || t('error.failedToLoadProperties'));
    } else {
      setError(null);
    }
  }, [queryError, propertiesResponse, t]);

  const handlePropertySelect = useCallback((propertyId) => setSelectedPropertyId(propertyId), []);

  const handleContinue = useCallback(async () => {
    if (!selectedPropertyId) {
      setError(t('error.pleaseSelectProperty'));
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const selectedProperty = properties.find((p) => (p.id === selectedPropertyId) || (p.property_id === selectedPropertyId));
      if (!selectedProperty) throw new Error(t('error.selectedPropertyNotFound'));
      configureProperty({ 
        propertyId: selectedPropertyId, 
        kioskId: currentKioskId ?? null, 
        capabilities, 
        propertyData: selectedProperty 
      });
      navigate("/welcome");
    } catch (err) {
      setError(err.message ?? t('error.failedToSaveProperty'));
    } finally {
      setSaving(false);
    }
  }, [selectedPropertyId, properties, capabilities, currentKioskId, configureProperty, navigate, t]);

  const containerStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: '#FFFFFF' };
  const paperStyle = { width: '100%', maxWidth: '700px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '20px' };

  if (loading) {
    return (
      <Container size="lg" style={containerStyle}>
        <Paper withBorder shadow="md" p={40} radius="xl" style={paperStyle}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="#C8653D" />
            <Text c="dimmed">{t('common.loading')}</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" style={containerStyle}>
      <Paper withBorder shadow="md" p={40} radius="xl" style={paperStyle}>
        <Box mb="xl" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <PropertyHeader />
        </Box>
        <Title order={3} style={{ fontSize: '24px', fontWeight: 800, color: '#222', marginBottom: '24px' }}>{t('propertySelection.title')}</Title>
        {error && (
          <Box maw={600} mx="auto" mb="xl">
            <Alert icon={<IconAlertCircle size={16} />} title={t('error.title')} color="red">{error}</Alert>
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
          ) : !loading ? (
            <Box mb="xl">
              <Text c="dimmed" ta="center">
                {t('propertySelection.noPropertiesAvailable') || 'No properties available. Please contact support.'}
              </Text>
            </Box>
          ) : null}
        </Stack>
        <Stack align="center" gap="md">
          <ContinueButton onClick={handleContinue} disabled={!selectedPropertyId || saving} loading={saving} t={t} />
        </Stack>
      </Paper>
    </Container>
  );
};

export default PropertySelectionPage;
