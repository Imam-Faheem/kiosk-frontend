import { ERROR_TYPE_PATTERNS } from '../config/constants';

const ERROR_MESSAGE_EXTRACTORS = [
  (data) => data?.details?.message,
  (data) => data?.details?.messages && Array.isArray(data.details.messages) ? data.details.messages.join('. ') : null,
  (data) => data?.message,
  (data) => data?.error,
  (data) => Array.isArray(data?.errors) ? data.errors.join(', ') : null,
  (data) => typeof data === 'string' ? data : null,
];

const extractErrorMessage = (errorData) => {
  return ERROR_MESSAGE_EXTRACTORS
    .map((extractor) => extractor(errorData))
    .find((message) => message != null) ?? null;
};

const classifyErrorType = (message) => {
  const lowerMessage = message?.toLowerCase() ?? '';
  
  return Object.entries(ERROR_TYPE_PATTERNS)
    .find(([_, patterns]) => 
      patterns.some((pattern) => lowerMessage.includes(pattern))
    )?.[0] ?? 'unknown';
};

const createErrorObject = (message, status, errorData, errorType) => {
  const error = new Error(message);
  error.status = status;
  error.type = errorType;
  error.originalError = errorData;
  error.isCredentialError = errorType === 'credential';
  error.isAvailabilityError = errorType === 'availability';
  return error;
};

export const createApiError = (error) => {
  const status = error?.response?.status;
  const errorData = error?.response?.data;
  const extractedMessage = extractErrorMessage(errorData);
  const errorType = classifyErrorType(extractedMessage);
  const userMessage = extractedMessage ?? `Request failed with status ${status}`;
  
  return createErrorObject(userMessage, status, errorData, errorType);
};

export const createNetworkError = (error) => {
  const message = error.request
    ? 'Network error. Please check your connection and try again.'
    : `Request failed: ${error.message}`;
  
  return createErrorObject(message, null, error, 'network');
};

const CREDENTIAL_ERROR_RESPONSE = {
  success: true,
  property: null,
  offers: [],
  totalOffers: 0,
};

export const handleCredentialError = (error) => {
  const isCredentialError = error?.status === 500 && error?.isCredentialError;
  return isCredentialError ? CREDENTIAL_ERROR_RESPONSE : null;
};

