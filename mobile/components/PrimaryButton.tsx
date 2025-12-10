import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "outline";
  testID?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  variant = "primary",
  style,
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyle = "rounded-2xl py-4 items-center justify-center";

  // Variant styles
  let bgStyle = "bg-[#16AD78]"; // primary
  let textStyle = "text-white";

  if (variant === "danger") {
    bgStyle = "bg-red-500";
  } else if (variant === "outline") {
    bgStyle = "bg-transparent border border-gray-300";
    textStyle = "text-gray-700";
  }

  // Disabled/Loading opacity
  const opacity = disabled || loading ? 0.7 : 1;

  return (
    <TouchableOpacity
      testID={props.testID || "primary-button"}
      className={`${baseStyle} ${bgStyle}`}
      style={[{ opacity }, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          testID="button-loading-indicator"
          color={variant === "outline" ? "#374151" : "#FFFFFF"}
        />
      ) : (
        <Text className={`font-kanit text-[16px] font-semibold ${textStyle}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
