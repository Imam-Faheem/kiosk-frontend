import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/propertyService';

/**
 * Hook to fetch properties from the API
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether the query should run
 * @param {Object} options.params - Additional query parameters
 * @returns {Object} React Query result with properties data
 */
export const usePropertyQuery = (options = {}) => {
  const { enabled = true, params = {} } = options;

  return useQuery({
    queryKey: ['properties', params],
    queryFn: async () => {
      const result = await getProperties(params);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch properties');
      }
      return result;
    },
    enabled,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default usePropertyQuery;

