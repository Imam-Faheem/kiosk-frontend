export const createApiError = (error) => {
  const response = error?.response;
  const status = response?.status;
  const data = response?.data;
  
  return {
    message: data?.message ?? data?.error ?? error?.message ?? 'An error occurred',
    status,
    data,
    isApiError: true,
  };
};

export const createNetworkError = (error) => {
  return {
    message: error?.message ?? 'Network error. Please check your connection.',
    code: error?.code,
    isNetworkError: true,
  };
};

export const handleCredentialError = (error) => {
  const message = error?.message?.toLowerCase() ?? '';
  
  // Check if it's a credential configuration error
  if (message.includes('not configured with apaleo credentials') || 
      message.includes('property not configured')) {
    // Return empty results to allow UI to continue
    return {
      offers: [],
      availableRooms: [],
    };
  }
  
  return null;
};

