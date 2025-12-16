import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "../services/api";
import type { Feedback, FeedbackStatus } from "../types";

export const useAdminFeedback = () => {
  return useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const response = await api.get("/feedback");
      return response.data.data as Feedback[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - feedback doesn't need frequent updates
    gcTime: 10 * 60 * 1000, // 10 minutes - keep cached data longer
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    placeholderData: keepPreviousData, // Keep showing previous data while refetching
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: FeedbackStatus;
    }) => {
      await api.patch(`/feedback/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};
