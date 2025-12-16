import React from "react";

interface LoadingSkeletonProps {
  message?: string;
  color?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  message = "Loading...",
  color = "blue",
}) => {
  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    purple: "border-purple-600",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            colorClasses[color as keyof typeof colorClasses] ||
            colorClasses.blue
          } mx-auto mb-4`}
        ></div>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};
