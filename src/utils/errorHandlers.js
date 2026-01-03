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


