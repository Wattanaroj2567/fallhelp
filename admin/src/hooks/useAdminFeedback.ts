import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Feedback, FeedbackStatus } from '../types';

export const useAdminFeedback = () => {
  return useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const response = await api.get('/feedback');
      return response.data.data as Feedback[];
    },
    refetchInterval: 5000,
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FeedbackStatus }) => {
      await api.patch(`/feedback/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });
};

