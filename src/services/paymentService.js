import { apiClient } from './api/apiClient';
import { simulateApiDelay, mockPaymentTransactions, mockSuccessResponses, mockErrors } from './mockData';

// Payment status check
export const checkPaymentStatus = async (reservationId) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.get(`/payments/status/${reservationId}`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    const transaction = mockPaymentTransactions.find(t => t.reservationId === reservationId);
    if (transaction) {
      return {
        success: true,
        data: {
          reservationId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          transactionId: transaction.transactionId
        }
      };
    }
    throw new Error('Payment status not found');
  }
};

// Initiate payment
export const initiatePayment = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/payments/initiate', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: {
        transactionId: `TXN-${Date.now()}`,
        status: 'processing',
        amount: data.amount,
        currency: data.currency || 'USD'
      },
      message: 'Payment initiated successfully'
    };
  }
};

// Poll payment status
export const pollPaymentStatus = async (transactionId) => {
  try {
    await simulateApiDelay(1000, 2000);
    
    // Mock implementation - simulate payment processing
    const mockResponse = await apiClient.get(`/payments/status/${transactionId}`);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    // Simulate payment completion after a few polls
    const isCompleted = Math.random() > 0.3; // 70% chance of completion
    
    return {
      success: true,
      data: {
        transactionId,
        status: isCompleted ? 'completed' : 'processing',
        amount: 320.00,
        currency: 'USD'
      }
    };
  }
};

// Process payment (for new reservations)
export const processPayment = async (data) => {
  try {
    await simulateApiDelay();
    
    // Mock implementation - in real app, this would call your backend
    const mockResponse = await apiClient.post('/payments/process', data);
    return mockResponse.data;
  } catch (error) {
    // Fallback to mock data if API fails
    return {
      success: true,
      data: {
        transactionId: `TXN-${Date.now()}`,
        status: 'completed',
        amount: data.amount,
        currency: data.currency || 'USD'
      },
      message: 'Payment processed successfully'
    };
  }
};
