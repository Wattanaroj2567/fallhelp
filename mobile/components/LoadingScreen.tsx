import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { ScreenWrapper } from './ScreenWrapper';

interface LoadingScreenProps {
  /**
   * Optional message to display below the spinner
   * @default "กำลังโหลด..."
   */
  message?: string;
  /**
   * Whether to wrap in a ScreenWrapper (for full screen usage)
   * or just return a View (for embedded usage)
   * @default false
   */
  useScreenWrapper?: boolean;
}

export function LoadingScreen({
  message = 'กำลังโหลด...',
  useScreenWrapper = false,
}: LoadingScreenProps) {
  const Content = (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#16AD78" />
      {message && <Text className="mt-4 text-gray-500 font-kanit text-base">{message}</Text>}
    </View>
  );

  if (useScreenWrapper) {
    return (
      <ScreenWrapper useScrollView={false} className="bg-white">
        {Content}
      </ScreenWrapper>
    );
  }

  return Content;
}
