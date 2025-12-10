import React from "react";
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { TextInput, useTheme } from "react-native-paper";

interface FloatingLabelInputProps
  extends Omit<React.ComponentProps<typeof TextInput>, "error" | "label"> {
  label: string | React.ReactNode; 
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
  isRequired?: boolean; // ✅ Add support for required asterisks
  testID?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  isRequired = false,
  value,
  style,
  multiline,
  ...props
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // คำนวณความสูง:
  // - Multiline: เริ่มต้น 120px
  // - Single Line: 56px (Standard Material Design)
  const inputHeight = multiline ? 120 : 56;

  // ✅ 3-State Label Color Logic:
  // 1. Empty (no value) → onSurfaceVariant (#a3a6af) - Gray
  // 2. Focused (typing) → primary (#16AD78) - Green
  // 3. Filled + Blur → #a3a6af - Gray
  const labelColor = isFocused
    ? theme.colors.primary
    : value
    ? "#a3a6af"
    : theme.colors.onSurfaceVariant;

  // Construct Label with Red Asterisk if required
  const labelNode = isRequired ? (
    <Text style={{ color: labelColor }}>
      {label} <Text style={{ color: theme.colors.error }}>*</Text>
    </Text>
  ) : (
    <Text style={{ color: labelColor }}>{label}</Text>
  );

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      <TextInput
        testID={props.testID || "floating-label-input"}
        mode="outlined"
        label={labelNode as any} // Cast to any to avoid strict type conflict
        value={value}
        error={!!error}
        secureTextEntry={isPassword && !showPassword}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        // 🎨 จัดการสี: ใช้สีจาก theme
        activeOutlineColor={error ? theme.colors.error : theme.colors.primary}
        outlineColor={error ? theme.colors.error : "#E5E7EB"} // gray-200 (ขอบปกติสีจาง)
        cursorColor={error ? theme.colors.error : theme.colors.primary}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[
          {
            backgroundColor: "#FFFFFF",
            fontSize: 16,
            lineHeight: 24, // ✅ Fix cursor jumping on iOS for Thai font
            paddingVertical: 0, // ✅ Fix default padding on Android
            height: multiline ? undefined : inputHeight,
            minHeight: inputHeight,
            includeFontPadding: false, // ✅ Fix text vertical alignment on Android
          },
          style,
        ]}
        contentStyle={
          [
            multiline
              ? {
                  paddingTop: 16,
                  paddingBottom: 16,
                  textAlignVertical: "top",
                }
              : {
                  textAlignVertical: "center", // ✅ Fix cursor jumping for Thai
                },
          ] as StyleProp<TextStyle>
        }
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        right={
          isPassword ? (
            <TextInput.Icon
              testID="password-toggle-icon"
              icon={showPassword ? "eye-off" : "eye"}
              color={theme.colors.onSurfaceVariant}
              onPress={() => setShowPassword(!showPassword)}
              forceTextInputFocus={false}
            />
          ) : null
        }
        {...props}
      />

      {/* Error Message */}
      {error && (
        <Text
          style={{
            fontFamily: "Kanit",
            color: theme.colors.error,
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
