import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // Explicitly do not set Authorization header here
  },
});

// Request interceptor to add auth token and X-Property-ID
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is a truly public endpoint (no auth required)
    const url = config.url || '';
    const method = config.method?.toLowerCase() || '';
    const isPublicPropertyEndpoint = (
      url.includes('/api/kiosk/v1/properties') ||
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
      // Debug log to verify
      console.log('[apiClient] Public endpoint detected - no auth headers will be sent:', {
        url: config.url,
        method: config.method,
        headers: Object.keys(config.headers || {})
      });
      return config;
    }
    
    // Add auth token for all other endpoints
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-Property-ID header for protected endpoints only
    try {
      const propertyData = localStorage.getItem('kioskProperty');
      if (propertyData) {
        const { propertyId } = JSON.parse(propertyData);
        if (propertyId) {
          config.headers['X-Property-ID'] = propertyId;
        }
      }
    } catch (error) {
      console.error('Failed to parse property data:', error);
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
    
    // Handle 400/403 errors related to property ID
    if (error.response?.status === 400 || error.response?.status === 403) {
      const message = error.response?.data?.message || '';
      if (message.includes('X-Property-ID') || message.includes('property')) {
        // Redirect to property selector
        if (typeof window !== 'undefined') {
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
    process: (data) => apiClient.post('/checkin', data),
    getStatus: (reservationId) => apiClient.get(`/checkin/${reservationId}/status`),
  },

  checkout: {
    process: (data) => apiClient.post('/checkout', data),
    getStatus: (reservationId) => apiClient.get(`/checkout/${reservationId}/status`),
  },

  // Payment endpoints
  payments: {
    process: (data) => apiClient.post('/payments', data),
    getHistory: (params) => apiClient.get('/payments/history', { params }),
    refund: (paymentId, data) => apiClient.post(`/payments/${paymentId}/refund`, data),
  },

  // Reports endpoints
  reports: {
    occupancy: (params) => apiClient.get('/reports/occupancy', { params }),
    revenue: (params) => apiClient.get('/reports/revenue', { params }),
    guests: (params) => apiClient.get('/reports/guests', { params }),
  },

  // Property endpoints
  properties: {
    getAll: () => apiClient.get('/properties'),
    getById: (id) => apiClient.get(`/properties/${id}`),
    getCapabilities: (propertyId, kioskId) => {
      const params = { propertyId };
      if (kioskId) params.kioskId = kioskId;
      return apiClient.get('/kiosk/capabilities', { params });
    },
  },
};

export { apiClient };
export default apiClient;
