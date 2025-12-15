import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

