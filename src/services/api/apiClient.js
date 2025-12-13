import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
