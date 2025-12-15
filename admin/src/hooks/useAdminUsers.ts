import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { User } from '../types';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.data as User[];
    },
    refetchInterval: 5000,
  });
};

