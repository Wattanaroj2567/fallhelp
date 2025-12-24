import React from 'react';
import { Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { Bounceable } from './Bounceable';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'outline';
  testID?: string;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  style,
  disabled,
  icon,
  ...props
}) => {
  // Base styles
  const baseStyle = 'rounded-2xl py-4 items-center justify-center';

  // Variant styles
  let bgStyle = 'bg-[#16AD78]'; // primary
  let textStyle = 'text-white';

  if (variant === 'danger') {
    bgStyle = 'bg-red-500';
  } else if (variant === 'outline') {
    bgStyle = 'bg-transparent border border-gray-300';
    textStyle = 'text-gray-700';
  }

  return (
    <Bounceable
      testID={props.testID || 'primary-button'}
      className={`${baseStyle} ${bgStyle} ${disabled || loading ? 'opacity-70' : ''}`}
      disabled={disabled || loading}
      scale={0.96}
      style={style}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          testID="button-loading-indicator"
          color={variant === 'outline' ? '#374151' : '#FFFFFF'}
        />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-kanit text-[16px] font-semibold ${textStyle}`}>{title}</Text>
        </View>
      )}
    </Bounceable>
  );
};
