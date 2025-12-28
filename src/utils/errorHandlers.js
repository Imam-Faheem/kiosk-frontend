import { ERROR_TYPE_PATTERNS } from '../config/constants';

const getErrorMessage = (errorData) => {
  if (!errorData) return null;
  return errorData?.details?.message ?? (Array.isArray(errorData?.details?.messages) ? errorData.details.messages.join('. ') : null) ?? errorData?.message ?? errorData?.error ?? (Array.isArray(errorData?.errors) ? errorData.errors.join(', ') : null) ?? (typeof errorData === 'string' ? errorData : null) ?? null;
};

const getErrorType = (message) => {
  if (!message) return 'unknown';
  const lowerMessage = message.toLowerCase();
  
  for (const [type, patterns] of Object.entries(ERROR_TYPE_PATTERNS)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      return type;
    }
  }
  return 'unknown';
};

export const createApiError = (error) => {
  const status = error?.response?.status;
  const errorData = error?.response?.data;
  const message = getErrorMessage(errorData) || `Request failed with status ${status}`;
  const errorType = getErrorType(message);
  
  const apiError = new Error(message);
  apiError.status = status;
  apiError.type = errorType;
  apiError.originalError = errorData;
  
  return apiError;
};

export const createNetworkError = (error) => {
  const message = error.request
    ? 'Network error. Please check your connection and try again.'
    : `Request failed: ${error.message}`;
  
  const networkError = new Error(message);
  networkError.status = null;
  networkError.type = 'network';
  networkError.originalError = error;
  
  return networkError;
};

export const handleCredentialError = (error) => {
  if (error?.status === 500 && error?.type === 'credential') {
    return {
      success: true,
      property: null,
      offers: [],
      totalOffers: 0,
    };
  }
  return null;
};

