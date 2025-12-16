import React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};
