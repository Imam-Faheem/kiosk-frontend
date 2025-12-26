import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../../config/constants';

// Helper to generate idempotency key
const generateIdempotencyKey = (prefix = 'req') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Get property and organization IDs from localStorage
 * @returns {Object} Property context with propertyId and organizationId
 */
const getPropertyContext = () => {
  const defaultContext = {
    propertyId: API_CONFIG.DEFAULT_PROPERTY_ID,
    organizationId: API_CONFIG.ORGANIZATION_ID,
  };

  try {
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (!propertyData) {
      return defaultContext;
    }

    const parsed = JSON.parse(propertyData);
    return {
      propertyId: parsed.propertyId ?? defaultContext.propertyId,
      organizationId: parsed.organizationId ?? defaultContext.organizationId,
    };
  } catch {
    // Silently fail and return defaults
    return defaultContext;
  }
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    // Explicitly do not set Authorization header here
  },
});

// Request interceptor to add X-Property-ID and X-Organization-ID
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is a truly public endpoint (no auth required)
    const url = config.url || '';
    const method = config.method?.toLowerCase() || '';
    const isPublicPropertyEndpoint = (
      url.includes('/api/kiosk/v1/properties') ||
      (url.includes('/api/kiosk/v1/organizations') && url.includes('/properties') && url.includes('/offers')) ||
      (url.includes('/api/kiosk/v1/organizations') && url.includes('/properties')) ||
      (url.includes('/api/core/v1/organizations') && url.includes('/apaleo/properties'))
    ) && method === 'get';
    
    // For public endpoint, explicitly ensure no Authorization header is sent
    if (isPublicPropertyEndpoint) {
      // Remove Authorization header completely from all possible locations
      if (config.headers) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
        // Also remove from common headers if axios sets it there
        if (config.headers.common) {
          delete config.headers.common.Authorization;
          delete config.headers.common.authorization;
        }
        // Set to undefined to ensure it's not sent
        config.headers.Authorization = undefined;
        config.headers.authorization = undefined;
      }
      // Don't add X-Property-ID for public endpoint
      return config;
    }
    
    // Add X-Property-ID and X-Organization-ID for kiosk endpoints
    const isKioskEndpoint = config.url?.includes('/api/kiosk/v1');
    if (isKioskEndpoint) {
      const { propertyId, organizationId } = getPropertyContext();
      config.headers['X-Property-ID'] = propertyId;
      config.headers['X-Organization-ID'] = organizationId;

      // Add X-Idempotency-Key for POST/PUT requests (except for status checks)
      const needsIdempotency = ['post', 'put', 'patch'].includes(config.method?.toLowerCase()) &&
                                !config.url?.includes('/status');
      if (needsIdempotency && !config.headers['X-Idempotency-Key']) {
        const prefix = config.url?.includes('/payment') ? 'payment' :
                      config.url?.includes('/key') ? 'key' :
                      config.url?.includes('/check-in') ? 'checkin' : 'req';
        config.headers['X-Idempotency-Key'] = generateIdempotencyKey(prefix);
      }
    } else {
      // For non-kiosk endpoints, try to add X-Property-ID from localStorage
      const { propertyId } = getPropertyContext();
      if (propertyId) {
        config.headers['X-Property-ID'] = propertyId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 400/403 errors related to property/organization ID
    if (error.response?.status === 400 || error.response?.status === 403) {
      const message = error.response?.data?.message ?? '';
      if (message.includes('X-Property-ID') || message.includes('X-Organization-ID') || message.includes('property') || message.includes('organization')) {
        // Redirect to property selector if property is missing
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/property-selector')) {
          window.location.href = '/property-selector';
        }
      }
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
