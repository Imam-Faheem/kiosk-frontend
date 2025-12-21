// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000',
  KIOSK_API_BASE: process.env.REACT_APP_KIOSK_API_BASE || 'http://localhost:8000/api/kiosk/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  // Test Credentials
  DEFAULT_PROPERTY_ID: '0ujsszwN8NRY24YaXiTIE2VWDTJ',
  DEFAULT_ORGANIZATION_ID: '0ujsszwN8NRY24YaXiTIE2VWDTS',
  DEFAULT_RESERVATION_ID: '0ujssxh0YyPaqWxqM0kOmoXxY6',
  DEFAULT_LOCK_ID: '0ujssxh0YyPaqWxqM0kOmoXxY9',
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
  KIOSK_PROPERTY: 'kioskProperty', // Property selection data
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
    BASE: '/api/kiosk/v1/check-in',
    STATUS: '/api/kiosk/v1/check-in/:id/status',
    VALIDATE_RESERVATION: '/api/kiosk/v1/reservations/:reservationId',
  },
  CHECKOUT: {
    BASE: '/api/kiosk/v1/checkout',
    STATUS: '/api/kiosk/v1/checkout/:id/status',
  },
  DIGITAL_KEY: {
    ISSUE: '/api/kiosk/v1/key/issue',
    GET: '/api/kiosk/v1/key/:id',
    REVOKE: '/api/kiosk/v1/key/:id',
    REGENERATE: '/api/kiosk/v1/key/:id/regenerate',
  },
  PAYMENTS: {
    BASE: '/api/kiosk/v1/payment',
    STATUS: '/api/kiosk/v1/payment/status/:id',
    HISTORY: '/api/kiosk/v1/payment/history',
    REFUND: '/api/kiosk/v1/payment/:id/refund',
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
    PATTERN: /^\+?[\d\s\-()]+$/,
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

// Card Dispensing Steps Configuration
export const CARD_DISPENSING_STEPS = [
  { 
    key: 'preparing',
    labelKey: 'cardDispensing.steps.preparing',
    defaultLabel: 'Preparing Card', 
    description: 'Preparing your access card',
    iconKey: 'creditCard',
  },
  { 
    key: 'encoding',
    labelKey: 'cardDispensing.steps.encoding',
    defaultLabel: 'Encoding Credentials', 
    description: 'Securing your access credentials',
    iconKey: 'lock',
  },
  { 
    key: 'sending',
    labelKey: 'cardDispensing.steps.sending',
    defaultLabel: 'Sending Digital Key', 
    description: 'Delivering to your email',
    iconKey: 'mail',
  },
];

// Status Messages Configuration
export const CARD_STATUS_MESSAGES = {
  preparing: {
    title: 'Preparing Your Access Card',
    description: 'Your personalized access card is being prepared. This usually takes about 10-15 seconds.',
  },
  encoding: {
    title: 'Securing Your Credentials',
    description: 'Encoding your access credentials with bank-level encryption. Almost ready...',
  },
  sending: {
    title: 'Sending Digital Key',
    description: 'Your digital key is being securely delivered to your email. You\'ll receive it within the next few moments.',
  },
  completed: {
    title: 'Your Card is Ready',
    description: 'Please take your access card from the slot. Your digital key has been sent to your email.',
  },
};
