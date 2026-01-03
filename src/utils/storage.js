import { STORAGE_KEYS } from '../config/constants';

const DEFAULT_ORGANIZATION_ID = typeof process !== 'undefined' && process.env?.REACT_APP_ORGANIZATION_ID 
  ? process.env.REACT_APP_ORGANIZATION_ID 
  : null;

const isStorageAvailable = () => {
  try {
    return typeof window !== 'undefined' && window.localStorage != null;
  } catch {
    return false;
  }
};

const safeGetItem = (key) => {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeParseJSON = (value) => {
  if (!value) {
    return null;
  }
  
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getKioskProperty = () => {
  const propertyData = safeGetItem(STORAGE_KEYS.KIOSK_PROPERTY);
  if (!propertyData) {
    return null;
  }
  
  const parsed = safeParseJSON(propertyData);
  if (parsed?.propertyId && parsed?.organizationId) {
    return {
      propertyId: parsed.propertyId,
      organizationId: parsed.organizationId,
    };
  }
  
  return null;
};

const getPropertyStore = () => {
  const storeData = safeGetItem('property-storage');
  if (!storeData) {
    return null;
  }
  
  const parsed = safeParseJSON(storeData);
  const selectedProperty = parsed?.state?.selectedProperty;
  const propertyId = parsed?.state?.propertyId;
  
  if (!selectedProperty || !propertyId) {
    return null;
  }
  
  const organizationId = selectedProperty.organization_id ?? selectedProperty.organizationId;
  if (!organizationId) {
    return null;
  }
  
  return {
    propertyId,
    organizationId,
  };
};

export const getPropertyContext = () => {
  const kioskProperty = getKioskProperty();
  if (kioskProperty) {
    return kioskProperty;
  }
  
  const propertyStore = getPropertyStore();
  if (propertyStore) {
    return propertyStore;
  }
  
  return {
    propertyId: null,
    organizationId: DEFAULT_ORGANIZATION_ID,
  };
};

export const setPropertyContext = (propertyId, organizationId) => {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    const data = { propertyId, organizationId };
    localStorage.setItem(STORAGE_KEYS.KIOSK_PROPERTY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

