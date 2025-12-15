import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Elder } from '../types';

export const useAdminElders = () => {
  return useQuery({
    queryKey: ['elders'],
    queryFn: async () => {
      const response = await api.get('/admin/elders');
      return response.data.data as Elder[];
    },
    refetchInterval: 5000,
  });
};

