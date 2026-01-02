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
// Ensure we're hitting Kong on localhost:8000
const baseURL = API_CONFIG.BASE_URL || 'http://localhost:8000';
const apiClient = axios.create({
  baseURL: baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    // Explicitly do not set Authorization header here
  },
});

// Log the base URL on initialization to confirm Kong endpoint
console.log('[apiClient] Initialized with baseURL:', baseURL);

// Request interceptor to add X-Property-ID and X-Organization-ID
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is a truly public endpoint (no auth required)
    const url = config.url || '';
    const method = config.method?.toLowerCase() || '';
    const isPublicPropertyEndpoint = (
      url.includes('/api/kiosk/v1/properties') ||
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

    // Add X-Property-ID and X-Organization-ID for kiosk-related endpoints
    // Note: These headers must be allowed in Kong's CORS configuration
    const { propertyId, organizationId } = getPropertyContext();

    if (propertyId) {
      config.headers['X-Property-ID'] = propertyId;
    }
    if (organizationId) {
      config.headers['X-Organization-ID'] = organizationId;
    }
    
    // Log headers being sent for debugging CORS issues
    if (process.env.NODE_ENV === 'development') {
      console.log('[apiClient] Request headers:', {
        'X-Property-ID': config.headers['X-Property-ID'],
        'X-Organization-ID': config.headers['X-Organization-ID'],
        'Content-Type': config.headers['Content-Type'],
        url: config.url,
        method: config.method,
      });
    }

    const isKioskEndpoint = url.includes('/api/kiosk/v1') ||
      url.includes('/kiosk') ||
      url.includes('/reservations') ||
      url.includes('/rooms') ||
      url.includes('/properties') ||
      url.includes('/api/v1');
    if (isKioskEndpoint) {
      // Add X-Idempotency-Key for POST/PUT requests (except for status checks)
      const needsIdempotency = ['post', 'put', 'patch'].includes(method) &&
        !url.includes('/status');
      if (needsIdempotency && !config.headers['X-Idempotency-Key']) {
        const prefix = url.includes('/payment') ? 'payment' :
          url.includes('/key') ? 'key' :
            url.includes('/check-in') ? 'checkin' : 'req';
        config.headers['X-Idempotency-Key'] = generateIdempotencyKey(prefix);
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
    // Only redirect for specific missing header errors, not all property-related errors
    if (error.response?.status === 400 || error.response?.status === 403) {
      const message = (error.response?.data?.message ?? '').toLowerCase();
      const isMissingHeaderError = 
        message.includes('x-property-id') || 
        message.includes('x-organization-id') ||
        message.includes('missing property id') ||
        message.includes('missing organization id') ||
        message.includes('property id is required') ||
        message.includes('organization id is required');
      
      // Only redirect for missing header errors, not validation or other property errors
      // Also, don't redirect if we're already on a reservation or check-in page (let those pages handle their own errors)
      if (isMissingHeaderError && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isReservationOrCheckinPage = 
          currentPath.includes('/reservation') || 
          currentPath.includes('/checkin') ||
          currentPath.includes('/lost-card');
        
        // Only redirect if not on a reservation/check-in page and not already on property-selector
        if (!isReservationOrCheckinPage && !currentPath.includes('/property-selector')) {
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
