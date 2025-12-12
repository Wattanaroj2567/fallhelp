import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../services/api";
import { CheckCircle, Clock, MessageSquare, Wrench, MessageCircle, Filter } from "lucide-react";

interface Feedback {
  id: string;
  message: string;
  userName?: string; // Display name from mobile
  ticketNumber?: string; // REP-001, REP-002 for repair requests
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    profileImage: string | null;
  } | null;
}

export default function Feedback() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<"all" | "feedback" | "repair">("all");

  const {
    data: feedbacks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const response = await api.get("/feedback");
      return response.data.data as Feedback[];
    },
    refetchInterval: 5000,
  });

  // Helper function to check if feedback is a repair request
  const isRepairRequest = (message: string) => {
    return message.startsWith("[REPAIR REQUEST]");
  };

  // Filter feedbacks based on type
  const filteredFeedbacks = feedbacks?.filter((f) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "repair") return isRepairRequest(f.message);
    if (typeFilter === "feedback") return !isRepairRequest(f.message);
    return true;
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/feedback/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <p>Failed to load feedback. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                User Feedback
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and respond to user feedback and repair requests
              </p>
            </div>
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | "feedback" | "repair")}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Messages</option>
                <option value="feedback">Feedback Only</option>
                <option value="repair">Repair Requests Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {feedbacks?.filter((f) => f.status === "PENDING").length || 0}
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Reviewed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {feedbacks?.filter((f) => f.status === "REVIEWED").length ||
                    0}
                </p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {feedbacks?.filter((f) => f.status === "RESOLVED").length ||
                    0}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Repair Requests</p>
                <p className="text-3xl font-bold text-orange-600">
                  {feedbacks?.filter((f) => isRepairRequest(f.message)).length || 0}
                </p>
              </div>
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-4">
          {filteredFeedbacks?.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {feedback.ticketNumber && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-700">
                        {feedback.ticketNumber}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feedback.userName ||
                        (feedback.user
                          ? `${feedback.user.firstName} ${feedback.user.lastName}`
                          : "Anonymous User")}
                    </h3>
                    {/* Type Badge */}
                    {isRepairRequest(feedback.message) ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        Repair Request
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Feedback
                      </span>
                    )}
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${feedback.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : feedback.status === "REVIEWED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {feedback.status}
                    </span>
                  </div>
                  {(feedback.user?.email || feedback.user?.phone) && (
                    <div className="flex items-center gap-4 mt-1">
                      {feedback.user?.email && (
                        <p className="text-sm text-gray-500">
                          {feedback.user.email}
                        </p>
                      )}
                      {feedback.user?.phone && isRepairRequest(feedback.message) && (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <span>📞</span> {feedback.user.phone}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(feedback.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {feedback.status === "PENDING" && (
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: feedback.id,
                          status: "REVIEWED",
                        })
                      }
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Mark as Reviewed"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  )}
                  {feedback.status !== "RESOLVED" && (
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: feedback.id,
                          status: "RESOLVED",
                        })
                      }
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  {feedback.message}
                </p>
              </div>
            </div>
          ))}
          {filteredFeedbacks?.length === 0 && feedbacks && feedbacks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No {typeFilter === "repair" ? "repair requests" : "feedback"} found
                </p>
                <p className="text-sm text-gray-500">
                  Try changing the filter to see more results
                </p>
              </div>
            </div>
          )}
          {feedbacks?.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <MessageSquare className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No feedback yet
                </p>
                <p className="text-sm text-gray-500">
                  User feedback will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
