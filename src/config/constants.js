import { IconCreditCard, IconMail, IconLock } from '@tabler/icons-react';

/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

/**
 * Application Configuration
 * General application settings and metadata
 */
export const APP_CONFIG = {
  NAME: 'Hotel Management System',
  VERSION: '1.0.0',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt'],
  DEFAULT_LANGUAGE: 'en',
};

// Language Options for Welcome Page
export const LANGUAGE_OPTIONS = [
  { value: "de", label: "Deutsch", flag: "/flags/de.png" },
  { value: "en", label: "English", flag: "/flags/gb.png" },
  { value: "es", label: "Español", flag: "/flags/es.png" },
  { value: "fr", label: "Français", flag: "/flags/fr.png" },
  { value: "it", label: "Italiano", flag: "/flags/it.png" },
  { value: "pt", label: "Português", flag: "/flags/pt.png" },
];

/**
 * LocalStorage Keys
 * Centralized keys for localStorage operations
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  KIOSK_PROPERTY: 'kioskProperty',
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

// Early Arrival Page Constants
export const EARLY_ARRIVAL_CONFIG = {
  COUNTDOWN_DURATION: 15,
  CHECKIN_TIME: "14:00",
  TIME_UPDATE_INTERVAL: 1000,
  COUNTDOWN_INTERVAL: 1000,
};

// Early Arrival Page Styles
export const EARLY_ARRIVAL_STYLES = {
  CONTAINER: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#FFFFFF',
  },
  PAPER: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
  },
  LOGO: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    marginRight: '0px',
    objectFit: 'cover',
  },
  WARNING_ICON: {
    fontSize: '80px',
    textAlign: 'center',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  },
  ALERT: {
    width: '100%',
    borderRadius: '16px',
    border: '2px solid #FF6B35',
  },
  TIME_CARD: {
    backgroundColor: '#fff5f0',
    width: '100%',
    border: '2px solid #FF6B35',
  },
  COUNTDOWN_BOX: {
    padding: '16px 24px',
    backgroundColor: '#FF6B35',
    borderRadius: '12px',
    minWidth: '200px',
    textAlign: 'center',
  },
};


// Main Menu Button Styles
export const MAIN_MENU_BUTTON_STYLES = {
  base: {
    root: {
      width: '100%',
      maxWidth: '560px',
      height: '96px',
      backgroundColor: '#C8653D',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontWeight: 800,
      fontSize: '22px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      padding: '24px 100px',
      border: 'none',
      transition: 'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backgroundColor: '#B8552F',
      },
    },
  },
  checkIn: {
    root: {
      width: '100%',
      maxWidth: '560px',
      height: '96px',
      backgroundColor: '#C8653D',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontWeight: 800,
      fontSize: '22px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontFamily: 'Montserrat, Poppins, Roboto, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      padding: '26px 100px',
      border: 'none',
      transition: 'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        backgroundColor: '#B8552F',
      },
    },
  },
};

// Common Button Styles
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
        backgroundColor: '#C8653D',
        opacity: 0.6,
      },
    },
  },
  primaryRounded: {
    root: {
      backgroundColor: '#C8653D',
      color: '#FFFFFF',
      borderRadius: '20px',
      fontWeight: 'bold',
      fontSize: '18px',
      textTransform: 'uppercase',
      padding: '20px 80px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      border: 'none',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#B8552F',
      },
    },
  },
  primarySmall: {
    root: {
      backgroundColor: '#C8653D',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#B8552F',
        transform: 'scale(1.02)',
      },
    },
  },
};

// Form Input Styles
export const FORM_INPUT_STYLES = {
  dateInput: {
    input: {
      borderRadius: '12px',
      border: '2px solid #E0E0E0',
      '&:focus': {
        borderColor: '#C8653D',
      },
    },
  },
  select: {
    input: {
      borderRadius: '12px',
      border: '2px solid #E0E0E0',
      '&:focus': {
        borderColor: '#C8653D',
      },
    },
  },
  textInput: {
    input: {
      borderRadius: '12px',
      border: '2px solid #E0E0E0',
      '&:focus': {
        borderColor: '#C8653D',
      },
    },
  },
};

// Container Styles
export const CONTAINER_STYLES = {
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#FFFFFF',
  },
  centeredWithPadding: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    backgroundColor: '#FFFFFF',
  },
};

// Paper Styles
export const PAPER_STYLES = {
  default: {
    width: '100%',
    maxWidth: '820px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
  },
  medium: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
  },
  large: {
    width: '100%',
    maxWidth: '1000px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '20px',
  },
  welcome: {
    width: '100%',
    maxWidth: '850px',
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
    borderRadius: '24px',
    position: 'relative',
    textAlign: 'center',
    paddingTop: '100px',
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

// Card Dispensing Step Icons
export const STEP_ICONS = {
  creditCard: IconCreditCard,
  lock: IconLock,
  mail: IconMail,
};

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

// Guest Details Form Options
export const GUEST_DETAILS_OPTIONS = {
  TITLES: [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Dr', label: 'Dr' },
  ],
  GENDERS: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ],
  COUNTRIES: [
    { value: 'US', label: 'United States (+1)' },
    { value: 'GB', label: 'United Kingdom (+44)' },
    { value: 'DE', label: 'Germany (+49)' },
    { value: 'FR', label: 'France (+33)' },
    { value: 'IT', label: 'Italy (+39)' },
    { value: 'ES', label: 'Spain (+34)' },
    { value: 'PT', label: 'Portugal (+351)' },
  ],
  DOCUMENT_TYPES: [
    { value: 'Passport', label: 'Passport' },
    { value: 'IdCard', label: 'National ID' },
    { value: 'DriverLicense', label: 'Driving License' },
  ],
};
