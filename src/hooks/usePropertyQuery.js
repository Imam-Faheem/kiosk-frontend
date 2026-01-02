import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/propertyService';

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

