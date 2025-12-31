// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  ORGANIZATION_ID: process.env.REACT_APP_ORGANIZATION_ID || '0ujsszwN8NRY24YaXiTIE2VWDTS',
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

// Capability mapping for array to object conversion
export const CAPABILITY_MAP = {
  'check-in': 'checkIn',
  'checkIn': 'checkIn',
  'check-out': 'checkOut',
  'checkOut': 'checkOut',
  'key-management': 'keyManagement',
  'keyManagement': 'keyManagement',
  'reservations': 'reservations',
  'reservation': 'reservations',
  'card-issuance': 'cardIssuance',
  'cardIssuance': 'cardIssuance',
  'lost-card': 'lostCard',
  'lostCard': 'lostCard',
  'room-service': 'roomService',
  'roomService': 'roomService',
};

// Reverse capability mapping for object to array conversion
export const REVERSE_CAPABILITY_MAP = {
  checkIn: 'check-in',
  checkOut: 'check-out',
  keyManagement: 'key-management',
  reservations: 'reservations',
  cardIssuance: 'card-issuance',
  lostCard: 'lost-card',
  roomService: 'room-service',
};

// Early Arrival Configuration
export const EARLY_ARRIVAL_CONFIG = {
  TARGET_TIME: '2:00 PM',
};

// Button Styles for Mantine components
export const BUTTON_STYLES = {
  primary: {
    root: {
      backgroundColor: '#C8653D',
      color: '#FFFFFF',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#B8552F',
        transform: 'scale(1.02)',
      },
      '&:disabled': {
        backgroundColor: '#CED4DA',
        color: '#868E96',
        transform: 'none',
      },
    },
  },
};

// Form Input Styles for Mantine components
export const FORM_INPUT_STYLES = {
  dateInput: {
    input: {
      borderRadius: '12px',
      fontSize: '16px',
      padding: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '8px',
    },
  },
  select: {
    input: {
      borderRadius: '12px',
      fontSize: '16px',
      padding: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '8px',
    },
  },
};

// Language Options
export const LANGUAGES = [
  { value: "de", label: "Deutsch", flag: "/flags/de.png" },
  { value: "en", label: "English", flag: "/flags/gb.png" },
  { value: "es", label: "Español", flag: "/flags/es.png" },
  { value: "fr", label: "Français", flag: "/flags/fr.png" },
  { value: "it", label: "Italiano", flag: "/flags/it.png" },
  { value: "pt", label: "Português", flag: "/flags/pt.png" },
];