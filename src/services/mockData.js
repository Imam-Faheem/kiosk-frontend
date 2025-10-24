// Mock Apaleo PMS data for kiosk application
export const mockReservations = [
  {
    id: 'RES-001',
    reservationId: 'RES-001',
    guestName: 'John Smith',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    roomNumber: '101',
    roomType: 'Deluxe King',
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 450.00,
    currency: 'USD',
    propertyId: 'PROP-001',
    propertyName: 'Uno Hotels Downtown'
  },
  {
    id: 'RES-002',
    reservationId: 'RES-002',
    guestName: 'Maria Garcia',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+34-555-0456',
    checkIn: '2024-01-16',
    checkOut: '2024-01-20',
    roomNumber: '205',
    roomType: 'Standard Twin',
    status: 'confirmed',
    paymentStatus: 'pending',
    totalAmount: 320.00,
    currency: 'EUR',
    propertyId: 'PROP-001',
    propertyName: 'Uno Hotels Downtown'
  }
];

export const mockRooms = [
  {
    id: 'ROOM-001',
    roomTypeId: 'RT-001',
    name: 'Deluxe King Suite',
    description: 'Spacious suite with king bed, city view, and modern amenities',
    capacity: 2,
    maxGuests: 3,
    basePrice: 150.00,
    currency: 'USD',
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'TV'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop'
    ],
    available: true
  },
  {
    id: 'ROOM-002',
    roomTypeId: 'RT-002',
    name: 'Standard Twin',
    description: 'Comfortable room with two twin beds and essential amenities',
    capacity: 2,
    maxGuests: 2,
    basePrice: 80.00,
    currency: 'USD',
    amenities: ['WiFi', 'Air Conditioning', 'TV'],
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop'
    ],
    available: true
  },
  {
    id: 'ROOM-003',
    roomTypeId: 'RT-003',
    name: 'Executive Suite',
    description: 'Premium suite with separate living area and business amenities',
    capacity: 2,
    maxGuests: 4,
    basePrice: 200.00,
    currency: 'USD',
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'TV', 'Work Desk', 'Sofa'],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
    ],
    available: true
  }
];

export const mockPaymentTransactions = [
  {
    id: 'TXN-001',
    reservationId: 'RES-001',
    amount: 450.00,
    currency: 'USD',
    status: 'completed',
    method: 'card',
    transactionId: 'TXN-001',
    timestamp: '2024-01-10T10:30:00Z',
    lastFourDigits: '1234'
  },
  {
    id: 'TXN-002',
    reservationId: 'RES-002',
    amount: 320.00,
    currency: 'EUR',
    status: 'pending',
    method: 'card',
    transactionId: 'TXN-002',
    timestamp: null,
    lastFourDigits: null
  }
];

export const mockCardOperations = [
  {
    id: 'CARD-001',
    reservationId: 'RES-001',
    roomNumber: '101',
    status: 'active',
    cardNumber: '****1234',
    accessCode: 'AC-001',
    issuedAt: '2024-01-15T14:00:00Z',
    expiresAt: '2024-01-18T11:00:00Z'
  }
];

// Mock API delay simulation - minimal delay for better UX
export const simulateApiDelay = (min = 50, max = 150) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock hardware operations delay
export const simulateHardwareDelay = (min = 3000, max = 8000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock error responses
export const mockErrors = {
  RESERVATION_NOT_FOUND: {
    code: 'RESERVATION_NOT_FOUND',
    message: 'Reservation not found',
    details: 'No reservation found with the provided ID and last name'
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_FAILED',
    message: 'Payment processing failed',
    details: 'Card was declined or payment terminal error'
  },
  CARD_DISPENSER_ERROR: {
    code: 'CARD_DISPENSER_ERROR',
    message: 'Card dispenser error',
    details: 'Hardware error occurred while dispensing card'
  },
  ROOM_NOT_AVAILABLE: {
    code: 'ROOM_NOT_AVAILABLE',
    message: 'No rooms available',
    details: 'No rooms available for the selected dates'
  },
  GUEST_VALIDATION_FAILED: {
    code: 'GUEST_VALIDATION_FAILED',
    message: 'Guest validation failed',
    details: 'Room number, reservation number, and last name do not match'
  }
};

// Mock success responses
export const mockSuccessResponses = {
  RESERVATION_VALIDATED: {
    success: true,
    data: mockReservations[0],
    message: 'Reservation validated successfully'
  },
  PAYMENT_INITIATED: {
    success: true,
    data: {
      transactionId: 'TXN-NEW-001',
      status: 'processing',
      amount: 320.00,
      currency: 'EUR'
    },
    message: 'Payment initiated successfully'
  },
  CARD_ISSUED: {
    success: true,
    data: {
      cardId: 'CARD-NEW-001',
      accessCode: 'AC-NEW-001',
      status: 'active'
    },
    message: 'Card issued successfully'
  },
  RESERVATION_CREATED: {
    success: true,
    data: {
      reservationId: 'RES-NEW-001',
      confirmationNumber: 'CONF-001',
      status: 'confirmed'
    },
    message: 'Reservation created successfully'
  }
};
