import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Text,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

// Constants from user reference
const INPUT_HEIGHT = 60;
const LABEL_FONT_LARGE = 15; // Adjusted from 16 to 15 per snippet
const LABEL_FONT_SMALL = 12;
const LABEL_TOP_START = 18;
const LABEL_TOP_END = -10; // Slightly adjusted for border overlap
const PASSWORD_ICON_SIZE = 22;

const PRIMARY_COLOR = "#16AD78";
const ERROR_COLOR = "#EF4444";
const BORDER_DEFAULT = "#E5E7EB"; // gray-200/300 equivalent

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  value,
  onFocus,
  onBlur,
  multiline,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation Logic
  const progress = useDerivedValue(() => {
    return withTiming(isFocused || !!value ? 1 : 0, { duration: 200 });
  }, [isFocused, value]);

  const labelContainerStyle = useAnimatedStyle(() => ({
    top: interpolate(
      progress.value,
      [0, 1],
      [multiline ? 18 : LABEL_TOP_START, LABEL_TOP_END]
    ),
    backgroundColor: progress.value > 0.5 ? "#FFFFFF" : "transparent",
    paddingHorizontal: 4,
    zIndex: 1,
    left: 12,
    position: "absolute",
  }));

  const labelTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      progress.value,
      [0, 1],
      [LABEL_FONT_LARGE, LABEL_FONT_SMALL]
    ),
    color: interpolateColor(
      progress.value,
      [0, 1],
      ["#9CA3AF", isFocused ? "#16AD78" : "#9CA3AF"]
    ),
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[{ marginBottom: 0, flexGrow: 0 }, containerStyle]}>
      <View
        style={{
          height: multiline ? undefined : INPUT_HEIGHT,
          minHeight: INPUT_HEIGHT,
          position: "relative",
        }}
      >
        {/* Floating Label */}
        <Animated.View style={labelContainerStyle} pointerEvents="none">
          <Animated.Text
            className="font-kanit"
            style={labelTextStyle as StyleProp<TextStyle>}
          >
            {label}
          </Animated.Text>
        </Animated.View>

        {/* Input Field */}
        <TextInput
          className={`font-kanit rounded-2xl px-4 border ${
            error
              ? "border-red-500"
              : isFocused
              ? "border-[#16AD78]"
              : "border-gray-300"
          } bg-white text-[16px]`}
          style={[
            {
              height: multiline ? undefined : "100%",
              minHeight: INPUT_HEIGHT,
              paddingTop: multiline ? 18 : 0,
              paddingBottom: multiline ? 18 : 0,
              textAlignVertical: multiline ? "top" : "center",
              color: "#111827",
            },
            style,
          ]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          multiline={multiline}
          cursorColor={PRIMARY_COLOR}
          placeholder=""
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 16,
              height: "100%",
              justifyContent: "center",
            }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={PASSWORD_ICON_SIZE}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            fontFamily: "Kanit",
            color: ERROR_COLOR,
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
