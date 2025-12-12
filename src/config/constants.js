// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Application Constants
export const APP_CONFIG = {
  NAME: 'Hotel Management System',
  VERSION: '1.0.0',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt'],
  DEFAULT_LANGUAGE: 'en',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH: '/refresh-token',
    PROFILE: '/profile',
  },
  RESERVATIONS: {
    BASE: '/reservations',
    SEARCH: '/reservations/search',
  },
  GUESTS: {
    BASE: '/guests',
  },
  ROOMS: {
    BASE: '/rooms',
    AVAILABLE: '/rooms/available',
  },
  CHECKIN: {
    BASE: '/checkin',
    STATUS: '/checkin/:id/status',
  },
  CHECKOUT: {
    BASE: '/checkout',
    STATUS: '/checkout/:id/status',
  },
  PAYMENTS: {
    BASE: '/payments',
    HISTORY: '/payments/history',
    REFUND: '/payments/:id/refund',
  },
  REPORTS: {
    OCCUPANCY: '/reports/occupancy',
    REVENUE: '/reports/revenue',
    GUESTS: '/reports/guests',
  },
};

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-\(\)]+$/,
  },
};

// UI Constants
export const UI_CONFIG = {
  NOTIFICATION_DURATION: 5000,
  MODAL_Z_INDEX: 1000,
  TOAST_POSITION: 'top-right',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm',
};

// Status Values
export const STATUS = {
  RESERVATION: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
    CANCELLED: 'cancelled',
  },
  ROOM: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    OUT_OF_ORDER: 'out_of_order',
  },
  PAYMENT: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
};
