import React from "react";
import type { DeviceStatus, FeedbackStatus } from "../types";

interface StatusBadgeProps {
  status: DeviceStatus | FeedbackStatus | string;
  variant?: "device" | "feedback" | "default";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = "default",
}) => {
  const getStatusColor = (status: string): string => {
    if (variant === "device") {
      switch (status) {
        case "ACTIVE":
          return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700";
        case "INACTIVE":
          return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
        case "MAINTENANCE":
          return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
        case "PAIRED":
          return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700";
        case "UNPAIRED":
          return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700";
        default:
          return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
      }
    }

    if (variant === "feedback") {
      switch (status) {
        case "PENDING":
          return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
        case "REVIEWED":
          return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
        case "RESOLVED":
          return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
        default:
          return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
      }
    }

    // Default variant (for role, active/inactive, etc.)
    switch (status) {
      case "ADMIN":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700";
      case "CAREGIVER":
      case "CAREGIVER_OWNER":
      case "ญาติผู้ดูแลหลัก":
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700";
      case "CAREGIVER_MEMBER":
      case "ญาติผู้ดูแลร่วม":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700";
      case "ผู้ดูแล":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700";
      case "Active":
      case "true":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700";
      case "Inactive":
      case "false":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";
    }
  };

  const getStatusLabel = (status: string): string => {
    if (variant === "device") {
      switch (status) {
        case "ACTIVE":
          return "ใช้งานอยู่";
        case "INACTIVE":
          return "ออฟไลน์";
        case "MAINTENANCE":
          return "กำลังบำรุงรักษา";
        case "PAIRED":
          return "จับคู่แล้ว";
        case "UNPAIRED":
          return "ยังไม่จับคู่";
        default:
          return status;
      }
    }

    if (variant === "feedback") {
      switch (status) {
        case "PENDING":
          return "รอตรวจสอบ";
        case "REVIEWED":
          return "ตรวจสอบแล้ว";
        case "RESOLVED":
          return "แก้ไขแล้ว";
        default:
          return status;
      }
    }

    // Default variant (for role, active/inactive, etc.)
    switch (status) {
      case "ADMIN":
        return "ผู้ดูแลระบบ";
      case "CAREGIVER_OWNER":
      case "ญาติผู้ดูแลหลัก":
        return "ญาติผู้ดูแลหลัก";
      case "CAREGIVER_MEMBER":
      case "ญาติผู้ดูแลร่วม":
        return "ญาติผู้ดูแลร่วม";
      case "CAREGIVER":
        return "ผู้ดูแล";
      case "Active":
      case "true":
        return "ใช้งานอยู่";
      case "Inactive":
      case "false":
        return "ไม่ใช้งาน";
      case "MALE":
        return "ชาย";
      case "FEMALE":
        return "หญิง";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};
