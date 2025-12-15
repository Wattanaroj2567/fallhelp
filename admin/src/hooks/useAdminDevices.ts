import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Device, CreateDevicePayload } from '../types';

export const useAdminDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/admin/devices');
      return response.data.data as Device[];
    },
    refetchInterval: 5000,
  });
};

export const useCreateDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDevicePayload) => {
      return await api.post('/admin/devices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useDeleteDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useUnpairDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/admin/devices/${id}/unpair`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

