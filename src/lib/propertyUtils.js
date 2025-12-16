export const getDefaultCapabilities = () => ({
  checkIn: true,
  reservations: true,
  cardIssuance: true,
  lostCard: true,
});

export const formatCapabilitiesText = (capabilities, loadingText = "Loading...") => {
  if (!capabilities || Object.keys(capabilities).length === 0) {
    return loadingText;
  }
  const enabledCaps = Object.entries(capabilities)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);
  return enabledCaps.length > 0 ? enabledCaps.join(", ") : "None";
};

export const getPropertyCurrency = (property, fallback = "N/A") => {
  if (!property) return fallback;
  return property.currency || property.defaultCurrency || fallback;
};

export const createCapabilitiesCacheKey = (propertyId, kioskId = null) => {
  return `${propertyId}-${kioskId || 'null'}`;
};

export const formatPropertyLabel = (property) => {
  if (!property) return "";
  return `${property.name || property.id} (${property.id})`;
};

export const formatPropertyDescription = (property, capabilities = {}) => {
  const currency = getPropertyCurrency(property);
  const capsText = formatCapabilitiesText(capabilities);
  return `Currency: ${currency} | Capabilities: ${capsText}`;
};

export const findPropertyById = (properties, propertyId) => {
  if (!Array.isArray(properties) || !propertyId) return null;
  return properties.find((p) => p.id === propertyId) || null;
};

