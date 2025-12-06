import React from "react";
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { TextInput, MD3LightTheme } from "react-native-paper";

const PRIMARY_COLOR = "#16AD78";
const ERROR_COLOR = "#EF4444";
// ปรับโทนสีเทาให้นุ่มนวลขึ้นตามที่ขอ
const TEXT_COLOR = "#374151"; // Gray-700 (สีเทาเข้ม สำหรับข้อความที่พิมพ์)
const INACTIVE_COLOR = "#a3a6af"; // Gray-500 (สีเทากลาง สำหรับ Label/Placeholder) - 

interface FloatingLabelInputProps
  extends Omit<React.ComponentProps<typeof TextInput>, "error"> {
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
  style,
  multiline,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  // คำนวณความสูง: 
  // - Multiline: เริ่มต้น 120px 
  // - Single Line: 56px (Standard Material Design)
  const inputHeight = multiline ? 120 : 56;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        error={!!error}
        secureTextEntry={isPassword && !showPassword}

        // 🎨 จัดการสี: ใช้สีเทาที่กำหนดไว้
        activeOutlineColor={error ? ERROR_COLOR : PRIMARY_COLOR}
        outlineColor={error ? ERROR_COLOR : "#E5E7EB"} // gray-200 (ขอบปกติสีจาง)
        textColor={TEXT_COLOR}
        placeholderTextColor={INACTIVE_COLOR}

        selectionColor={PRIMARY_COLOR}
        cursorColor={PRIMARY_COLOR}
        style={[
          {
            backgroundColor: "#FFFFFF",
            fontFamily: "Kanit",
            fontSize: 16,
            height: multiline ? undefined : inputHeight,
            minHeight: inputHeight,
          },
          style,
        ]}

        contentStyle={[
          multiline
            ? {
              paddingTop: 16,
              paddingBottom: 16,
              textAlignVertical: "top",
            }
            : {
              height: inputHeight,
              justifyContent: 'center',
            }
        ] as StyleProp<TextStyle>}

        theme={{
          ...MD3LightTheme,
          roundness: 12,
          colors: {
            ...MD3LightTheme.colors,
            primary: PRIMARY_COLOR,
            onSurface: TEXT_COLOR, // สีตัวหนังสือตอนพิมพ์ (Gray-700)
            onSurfaceVariant: INACTIVE_COLOR, // สี Label ตอนปกติ (Gray-500)
            error: ERROR_COLOR,
            background: '#FFFFFF',
          },
          fonts: {
            // ✅ ใช้ความหนา 400 (Regular) เท่ากันหมดตามที่แจ้ง
            bodyLarge: { fontFamily: "Kanit", fontWeight: "400" },
            bodyMedium: { fontFamily: "Kanit", fontWeight: "400" },
            bodySmall: { fontFamily: "Kanit", fontWeight: "400" },
            labelLarge: { fontFamily: "Kanit", fontWeight: "400" },
            labelMedium: { fontFamily: "Kanit", fontWeight: "400" },
            labelSmall: { fontFamily: "Kanit", fontWeight: "400" },
            default: { fontFamily: "Kanit", fontWeight: "400" },
          },
        }}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}

        right={
          isPassword ? (
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              color={INACTIVE_COLOR}
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