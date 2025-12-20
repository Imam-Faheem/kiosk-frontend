import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../../config/constants';

// Helper to generate idempotency key
const generateIdempotencyKey = (prefix = 'req') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
};

// Helper to get property and organization IDs from localStorage
const getPropertyContext = () => {
  try {
    const propertyData = localStorage.getItem(STORAGE_KEYS.KIOSK_PROPERTY);
    if (propertyData) {
      const parsed = JSON.parse(propertyData);
      return {
        propertyId: parsed.propertyId || API_CONFIG.DEFAULT_PROPERTY_ID,
        organizationId: parsed.organizationId || API_CONFIG.DEFAULT_ORGANIZATION_ID,
      };
    }
  } catch (error) {
    console.error('Failed to parse property data:', error);
  }
  return {
    propertyId: API_CONFIG.DEFAULT_PROPERTY_ID,
    organizationId: API_CONFIG.DEFAULT_ORGANIZATION_ID,
  };
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add headers
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    
    // Handle 400/403 errors related to property/organization ID
    if (error.response?.status === 400 || error.response?.status === 403) {
      const message = error.response?.data?.message || '';
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

// API methods
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/login', credentials),
    logout: () => apiClient.post('/logout'),
    refreshToken: () => apiClient.post('/refresh-token'),
    getProfile: () => apiClient.get('/profile'),
  },

  // Reservation endpoints
  reservations: {
    getAll: (params) => apiClient.get('/reservations', { params }),
    getById: (id) => apiClient.get(`/reservations/${id}`),
    create: (data) => apiClient.post('/reservations', data),
    update: (id, data) => apiClient.put(`/reservations/${id}`, data),
    delete: (id) => apiClient.delete(`/reservations/${id}`),
    search: (params) => apiClient.get('/reservations/search', { params }),
  },

  // Guest endpoints
  guests: {
    getAll: (params) => apiClient.get('/guests', { params }),
    getById: (id) => apiClient.get(`/guests/${id}`),
    create: (data) => apiClient.post('/guests', data),
    update: (id, data) => apiClient.put(`/guests/${id}`, data),
    delete: (id) => apiClient.delete(`/guests/${id}`),
  },

  // Room endpoints
  rooms: {
    getAll: (params) => apiClient.get('/rooms', { params }),
    getById: (id) => apiClient.get(`/rooms/${id}`),
    getAvailable: (params) => apiClient.get('/rooms/available', { params }),
  },

  // Check-in/Check-out endpoints
  checkin: {
    process: (data) => apiClient.post('/api/kiosk/v1/check-in', data),
    getStatus: (reservationId) => apiClient.get(`/api/kiosk/v1/check-in/${reservationId}/status`),
  },

  checkout: {
    process: (data) => apiClient.post('/api/kiosk/v1/checkout', data),
    getStatus: (reservationId) => apiClient.get(`/api/kiosk/v1/checkout/${reservationId}/status`),
  },

  // Digital Key endpoints
  digitalKey: {
    issue: (data) => apiClient.post('/api/kiosk/v1/key/issue', data),
    get: (keyId) => apiClient.get(`/api/kiosk/v1/key/${keyId}`),
    revoke: (keyId) => apiClient.delete(`/api/kiosk/v1/key/${keyId}`),
    regenerate: (keyId, data) => apiClient.post(`/api/kiosk/v1/key/${keyId}/regenerate`, data),
  },

  // Payment endpoints
  payments: {
    process: (data) => apiClient.post('/api/kiosk/v1/payment', data),
    getStatus: (reservationId) => apiClient.get(`/api/kiosk/v1/payment/status/${reservationId}`),
    getHistory: (params) => apiClient.get('/api/kiosk/v1/payment/history', { params }),
    refund: (transactionId, data) => apiClient.post(`/api/kiosk/v1/payment/${transactionId}/refund`, data),
  },

  // Reports endpoints
  reports: {
    occupancy: (params) => apiClient.get('/reports/occupancy', { params }),
    revenue: (params) => apiClient.get('/reports/revenue', { params }),
    guests: (params) => apiClient.get('/reports/guests', { params }),
  },
};

export { apiClient };
export default apiClient;
