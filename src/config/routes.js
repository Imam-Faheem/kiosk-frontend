/**
 * Application Routes
 * Centralized UI route definitions for navigation
 */

export const ROUTES = {
  // Main routes
  ROOT: '/',
  PROPERTY_SETUP: '/property-setup',
  PROPERTY_SELECTOR: '/property-selector',
  WELCOME: '/welcome',
  HOME: '/home',
  ERROR: '/error',

  // Check-in flow
  CHECKIN: '/checkin',
  CHECKIN_PAYMENT_CHECK: '/checkin/payment-check',
  CHECKIN_PAYMENT: '/checkin/payment',
  CHECKIN_CARD_DISPENSING: '/checkin/card-dispensing',
  CHECKIN_COMPLETE: '/checkin/complete',
  CHECKIN_EARLY_ARRIVAL: '/checkin/early-arrival',

  // Reservation flow
  RESERVATION_SEARCH: '/reservation/search',
  RESERVATION_GUEST_DETAILS: '/reservation/guest-details',
  RESERVATION_ROOM_DETAILS: '/reservation/room-details',
  RESERVATION_SIGNATURE: '/reservation/signature',
  RESERVATION_PAYMENT: '/reservation/payment',
  RESERVATION_CARD: '/reservation/card',
  RESERVATION_COMPLETE: '/reservation/complete',
  RESERVATION_EARLY_ARRIVAL: '/reservation/early-arrival',

  // Lost card flow
  LOST_CARD: '/lost-card',
  LOST_CARD_REGENERATE: '/lost-card/regenerate',
  LOST_CARD_ISSUED: '/lost-card/issued',
  LOST_CARD_EARLY_ARRIVAL: '/lost-card/early-arrival',
};

/**
 * Early Arrival Flow Configurations
 * Maps flow types to their early arrival page configurations
 */
export const EARLY_ARRIVAL_FLOW_CONFIGS = {
  checkin: {
    title: 'Early Arrival',
    message: 'Card cannot be given before 2pm. Please return after 2pm.',
    backPath: ROUTES.CHECKIN,
  },
  reservation: {
    title: 'Early Arrival',
    message: 'Room cards cannot be issued before 2pm. Please return after 2pm.',
    backPath: ROUTES.RESERVATION_SEARCH,
  },
  'lost-card': {
    title: 'Early Arrival',
    message: 'Card replacement cannot be done before 2pm. Please return after 2pm.',
    backPath: ROUTES.LOST_CARD,
  },
};

