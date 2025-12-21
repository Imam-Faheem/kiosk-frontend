import { API_CONFIG } from '../config/constants';

// Mock data generators for fallback when API fails
export const mockData = {
  // Check-in mock data
  checkIn: (data) => ({
    success: true,
    data: {
      check_in_id: `checkin_${Date.now()}`,
      reservation_id: data?.reservation_id || data?.reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      guest_name: data?.guest_name?.last_name || data?.lastName || 'Guest',
      room_number: data?.room_number || data?.roomNumber || '101',
      check_in_date: data?.check_in_date || data?.checkInDate || new Date().toISOString(),
      check_out_date: data?.check_out_date || data?.checkOutDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      guest_email: data?.guest_email || data?.guestEmail || 'guest@example.com',
      guest_phone: data?.guest_phone || data?.guestPhone || '+1234567890',
    },
    message: 'Check-in completed successfully (mock)',
  }),

  checkInStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      room_number: '101',
      guest_name: 'John Doe',
    },
    message: 'Check-in status retrieved successfully (mock)',
  }),

  reservation: (data) => ({
    success: true,
    data: {
      reservation_id: data?.reservationId || data?.reservation_id || API_CONFIG.DEFAULT_RESERVATION_ID,
      id: data?.reservationId || data?.reservation_id || API_CONFIG.DEFAULT_RESERVATION_ID,
      guest_name: {
        first_name: 'John',
        last_name: data?.lastName || data?.last_name || 'Doe',
      },
      firstName: 'John',
      lastName: data?.lastName || data?.last_name || 'Doe',
      guest_email: 'guest@example.com',
      guest_phone: '+1234567890',
      check_in_date: new Date().toISOString(),
      check_out_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      room_number: '101',
    roomNumber: '101',
      status: 'confirmed',
      confirmation_code: 'CONF123',
    },
    message: 'Reservation validated successfully (mock)',
  }),

  // Checkout mock data
  checkout: (data) => ({
    success: true,
    data: {
      checkout_id: `checkout_${Date.now()}`,
      reservation_id: data?.reservation_id || data?.reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      room_number: data?.room_number || data?.roomNumber || '101',
      final_bill_amount: data?.final_bill_amount || data?.finalBillAmount || 150.00,
      payment_status: data?.payment_status || data?.paymentStatus || 'completed',
      check_out_date: data?.check_out_date || data?.checkOutDate || new Date().toISOString(),
      checked_out_at: new Date().toISOString(),
      status: 'checked_out',
    },
    message: 'Checkout completed successfully (mock)',
  }),

  checkoutStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'checked_out',
      checked_out_at: new Date().toISOString(),
      final_bill_amount: 150.00,
      payment_status: 'completed',
    },
    message: 'Checkout status retrieved successfully (mock)',
  }),

  // Digital key mock data
  digitalKey: (data) => ({
    success: true,
    data: {
      key_id: `key_${Date.now()}`,
      reservation_id: data?.reservation_id || data?.reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      lock_id: data?.lock_id || data?.lockId || API_CONFIG.DEFAULT_LOCK_ID,
      room_number: data?.room_number || data?.roomNumber || '101',
      key_type: data?.key_type || data?.keyType || 2,
      key_name: data?.key_name || data?.keyName || 'Guest Key',
      key_code: '12345678',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      start_date: data?.start_date || data?.startDate || new Date().toISOString(),
      end_date: data?.end_date || data?.endDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'active',
      issued_at: new Date().toISOString(),
    },
    message: 'Digital key issued successfully (mock)',
  }),

  digitalKeyGet: (keyId) => ({
    success: true,
    data: {
      key_id: keyId || `key_${Date.now()}`,
      key_code: '12345678',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      status: 'active',
      room_number: '101',
    },
    message: 'Digital key retrieved successfully (mock)',
  }),

  // Payment mock data
  payment: (data) => ({
    success: true,
    data: {
      transaction_id: `txn_${Date.now()}`,
      reservation_id: data?.reservation_id || data?.reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      amount: data?.amount || 150.00,
      currency: data?.currency || 'USD',
      payment_method: {
        type: data?.payment_method?.type || data?.paymentMethod?.type || 'card',
        card_last4: data?.payment_method?.card_last4 || data?.paymentMethod?.cardLast4 || '1234',
        card_brand: data?.payment_method?.card_brand || data?.paymentMethod?.cardBrand || 'visa',
      },
      status: 'completed',
      processed_at: new Date().toISOString(),
      description: data?.description || 'Room charges and taxes',
    },
    message: 'Payment processed successfully (mock)',
  }),

  paymentStatus: (reservationId) => ({
    success: true,
    data: {
      reservation_id: reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
      status: 'completed',
      amount: 150.00,
      currency: 'USD',
      payment_method: {
        type: 'card',
        card_last4: '1234',
        card_brand: 'visa',
      },
    },
    message: 'Payment status retrieved successfully (mock)',
  }),

  paymentHistory: (params) => ({
    success: true,
    data: [
      {
        transaction_id: 'txn_1',
        reservation_id: params?.reservationId || API_CONFIG.DEFAULT_RESERVATION_ID,
        amount: 150.00,
        currency: 'USD',
        status: 'completed',
        processed_at: new Date().toISOString(),
      },
    ],
    pagination: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: 1,
    },
    message: 'Payment history retrieved successfully (mock)',
  }),

  refund: (transactionId, data) => ({
    success: true,
    data: {
      refund_id: `refund_${Date.now()}`,
      transaction_id: transactionId,
      amount: data?.amount || 150.00,
      currency: data?.currency || 'USD',
      reason: data?.reason || 'Refund request',
      status: 'completed',
      processed_at: new Date().toISOString(),
    },
    message: 'Refund processed successfully (mock)',
  }),
};

// Utility functions for simulating delays
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateHardwareDelay = (ms = 1500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock reservations data
export const mockReservations = [
  {
    reservationId: API_CONFIG.DEFAULT_RESERVATION_ID,
    id: API_CONFIG.DEFAULT_RESERVATION_ID,
    guest_name: { first_name: 'John', last_name: 'Doe' },
    firstName: 'John',
    lastName: 'Doe',
    guest_email: 'john.doe@example.com',
    guest_phone: '+1234567890',
    check_in_date: new Date().toISOString(),
    check_out_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    checkInDate: new Date().toISOString(),
    checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    room_number: '101',
    roomNumber: '101',
    status: 'confirmed',
    confirmation_code: 'CONF123',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    reservationId: 'RES-002',
    id: 'RES-002',
    guest_name: { first_name: 'Jane', last_name: 'Smith' },
    firstName: 'Jane',
    lastName: 'Smith',
    guest_email: 'jane.smith@example.com',
    guest_phone: '+1234567891',
    check_in_date: new Date(Date.now() + 86400000).toISOString(),
    check_out_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    checkInDate: new Date(Date.now() + 86400000).toISOString(),
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    room_number: '202',
    roomNumber: '202',
    status: 'confirmed',
    confirmation_code: 'CONF456',
    paymentStatus: 'completed',
    createdAt: new Date().toISOString(),
  },
];

// Mock success responses
export const mockSuccessResponses = {
  cardIssue: {
    success: true,
    data: {
      cardId: `CARD-${Date.now()}`,
      accessCode: `AC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: 'active',
    },
    message: 'Card issued successfully',
  },
  reservationCreate: {
    success: true,
    data: {
      id: `RES-${Date.now()}`,
      status: 'confirmed',
    },
    message: 'Reservation created successfully',
  },
};

// Mock errors
export const mockErrors = {
  notFound: {
    status: 404,
    message: 'Resource not found',
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized access',
  },
  serverError: {
    status: 500,
    message: 'Internal server error',
  },
};

// Helper to check if error is network-related (should use mock)
const isNetworkError = (error) => {
  return !error?.response || error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK';
};

// Helper to check if should use mock data
export const shouldUseMock = (error, useMock = true) => {
  const useMockEnv = String(process.env.REACT_APP_USE_MOCK || '').toLowerCase() === 'true';
  return useMock && (useMockEnv || isNetworkError(error));
};
