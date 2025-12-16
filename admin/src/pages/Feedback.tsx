import { useState } from "react";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Wrench,
  MessageCircle,
  Filter,
  Eye,
  Smartphone,
} from "lucide-react";
import {
  useAdminFeedback,
  useUpdateFeedbackStatus,
} from "../hooks/useAdminFeedback";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import type { Feedback, FeedbackTypeFilter } from "../types";

export default function Feedback() {
  const [typeFilter, setTypeFilter] = useState<FeedbackTypeFilter>("all");

  const { data: feedbacks, isError, isLoading } = useAdminFeedback();

  const updateStatusMutation = useUpdateFeedbackStatus();

  // Filter feedbacks based on type
  const filteredFeedbacks = feedbacks?.filter((f) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "repair") return f.type === "REPAIR_REQUEST";
    if (typeFilter === "feedback") return f.type === "COMMENT";
    return true;
  });

  // Separate feedbacks by type
  const comments = feedbacks?.filter((f) => f.type === "COMMENT") || [];
  const repairRequests =
    feedbacks?.filter((f) => f.type === "REPAIR_REQUEST") || [];

  // Show loading skeleton ONLY on initial load (when there's no cached data yet)
  // keepPreviousData ensures cached data is shown immediately even during refetch
  // So isLoading will be true only on first load when no data exists
  if (isLoading) {
    return <LoadingSkeleton message="กำลังโหลดความคิดเห็น..." />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <p>ไม่สามารถโหลดความคิดเห็นได้ กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-slate-50/30 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                ความคิดเห็นและคำขอซ่อมแซม
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ตรวจสอบความคิดเห็นและคำขอซ่อมแซมจากผู้ใช้
              </p>
            </div>
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "feedback" | "repair")
                }
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">ข้อความทั้งหมด</option>
                <option value="feedback">เฉพาะความคิดเห็น</option>
                <option value="repair">เฉพาะคำขอซ่อมแซม</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  ความคิดเห็นทั้งหมด
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {comments.length}
                </p>
              </div>
              <MessageCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-yellow-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  คำขอซ่อมแซมที่รอตรวจสอบ
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                  {repairRequests.filter((f) => f.status === "PENDING").length}
                </p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  คำขอซ่อมแซมที่กำลังดำเนินการ
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {repairRequests.filter((f) => f.status === "REVIEWED").length}
                </p>
              </div>
              <Eye className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  คำขอซ่อมแซมที่แก้ไขเสร็จแล้ว
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {repairRequests.filter((f) => f.status === "RESOLVED").length}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-4">
          {filteredFeedbacks?.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {feedback.ticketNumber && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {feedback.ticketNumber}
                      </span>
                    )}
                    {feedback.device?.deviceCode &&
                      feedback.type === "REPAIR_REQUEST" && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" />
                          {feedback.device.deviceCode}
                        </span>
                      )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {feedback.userName ||
                        (feedback.user
                          ? `${feedback.user.firstName} ${feedback.user.lastName}`
                          : "ผู้ใช้ไม่ระบุชื่อ")}
                    </h3>
                    {/* Type Badge */}
                    {feedback.type === "REPAIR_REQUEST" ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        คำขอซ่อมแซม
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        ความคิดเห็น
                      </span>
                    )}
                    {/* Status Badge - Only for repair requests */}
                    {feedback.type === "REPAIR_REQUEST" && (
                      <StatusBadge
                        status={feedback.status}
                        variant="feedback"
                      />
                    )}
                  </div>
                  {(feedback.user?.email || feedback.user?.phone) && (
                    <div className="flex items-center gap-4 mt-1">
                      {feedback.user?.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {feedback.user.email}
                        </p>
                      )}
                      {feedback.user?.phone &&
                        feedback.type === "REPAIR_REQUEST" && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <span>📞</span> {feedback.user.phone}
                          </p>
                        )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(feedback.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {/* Action buttons - Only for repair requests */}
                {feedback.type === "REPAIR_REQUEST" && (
                  <div className="flex gap-2">
                    {feedback.status === "PENDING" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: feedback.id,
                            status: "REVIEWED",
                          })
                        }
                        className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="ทำเครื่องหมายว่ากำลังดำเนินการ"
                      >
                        <Eye className="w-5 h-5" />
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
                        className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        title="ทำเครื่องหมายว่าแก้ไขเสร็จแล้ว"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feedback.message}
                </p>
              </div>
            </div>
          ))}
          {filteredFeedbacks?.length === 0 &&
            feedbacks &&
            feedbacks.length > 0 && (
              <EmptyState
                icon={Filter}
                title={
                  typeFilter === "repair"
                    ? "ไม่พบคำขอซ่อมแซม"
                    : typeFilter === "feedback"
                    ? "ไม่พบความคิดเห็น"
                    : "ไม่พบข้อมูล"
                }
                message="ลองเปลี่ยนตัวกรองเพื่อดูผลลัพธ์เพิ่มเติม"
              />
            )}
          {feedbacks?.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="ยังไม่มีความคิดเห็น"
              message="ความคิดเห็นจากผู้ใช้จะแสดงที่นี่"
            />
          )}
        </div>
      </div>
    </div>
  );
}
