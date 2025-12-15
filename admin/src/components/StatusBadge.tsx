import React from 'react';
import type { DeviceStatus, FeedbackStatus } from '../types';

interface StatusBadgeProps {
  status: DeviceStatus | FeedbackStatus | string;
  variant?: 'device' | 'feedback' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default' }) => {
  const getStatusColor = (status: string): string => {
    if (variant === 'device') {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'INACTIVE':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'MAINTENANCE':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'PAIRED':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'UNPAIRED':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }

    if (variant === 'feedback') {
      switch (status) {
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-700';
        case 'REVIEWED':
          return 'bg-blue-100 text-blue-700';
        case 'RESOLVED':
          return 'bg-green-100 text-green-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }

    // Default variant (for role, active/inactive, etc.)
    switch (status) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'CAREGIVER':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Active':
      case 'true':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Inactive':
      case 'false':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
};

