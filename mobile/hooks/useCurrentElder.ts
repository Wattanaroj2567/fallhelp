import { useQuery } from '@tanstack/react-query';
import { getUserElders } from '@/services/userService';

/**
 * Custom hook to fetch the current elder
 * Centralizes elder fetching logic and improves caching
 * 
 * @returns React Query result with current elder data
 */
export const useCurrentElder = () => {
  return useQuery({
    queryKey: ['userElders'],
    queryFn: async () => {
      const elders = await getUserElders();
      return elders && elders.length > 0 ? elders[0] : null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time (formerly cacheTime)
  });
};
