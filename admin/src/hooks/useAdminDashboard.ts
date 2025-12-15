import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { DashboardSummary } from '../types';

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data.data as DashboardSummary;
    },
    refetchInterval: 5000,
  });
};

