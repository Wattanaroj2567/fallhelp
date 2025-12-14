import React, { useState } from "react";
import { TouchableOpacity, View, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/authService";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { showErrorMessage } from "@/utils/errorHelper";
import Logger from "@/utils/logger";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

const THEME_COLOR = "#EB6A6A"; // สีปุ่มตามรูป

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Reset Password Screen
// ==========================================
export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, code } = params;

  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage password inputs
  // ==========================================
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Reset password API call
  // ==========================================
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      return await resetPassword({
        email: email as string,
        code: code as string,
        newPassword,
      });
    },
    onSuccess: () => {
      router.replace({
        pathname: "/(auth)/success",
        params: { type: "reset_password" },
      });
    },
    onError: (error: any) => {
      showErrorMessage("ผิดพลาด", error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกรหัสผ่านใหม่ให้ครบถ้วน");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณากรอกรหัสผ่านยืนยันให้ตรงกัน");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(
        "รหัสผ่านสั้นเกินไป",
        "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
      );
      return;
    }

    resetPasswordMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render reset password form
  // ==========================================
  return (
    <ScreenWrapper
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
      keyboardAvoiding
      scrollViewProps={{
        bounces: false, // iOS: ห้ามเด้งดึ๋ง
        overScrollMode: "never", // Android: ห้ามเด้งแสง
      }}
      header={<ScreenHeader title="" />}
    >
      <View className="flex-1">
        {/* Header Text */}
        <Text
          className="font-kanit font-bold text-gray-900"
          style={{ fontSize: 28, marginBottom: 8 }}
        >
          ตั้งรหัสผ่านใหม่
        </Text>
        <Text
          className="font-kanit text-gray-500"
          style={{ fontSize: 15, marginBottom: 24 }}
        >
          สร้างรหัสผ่านใหม่ของคุณ เพื่อเข้าสู่ระบบในครั้งถัดไป
        </Text>

        {/* Form Fields */}
        <View className="mb-6">
          {/* New Password Input */}
          <View className="mb-5">
            <FloatingLabelInput
              testID="newPassword-input"
              label="รหัสผ่านใหม่"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              autoCapitalize="none"
              textContentType="password"
              accentColor={THEME_COLOR}
            />

            {/* Password Strength Bar - Show when typing */}
            <View className="mt-3">
              <PasswordStrengthIndicator password={newPassword} />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View>
            <FloatingLabelInput
              testID="confirmPassword-input"
              label="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              textContentType="password"
              accentColor={THEME_COLOR}
            />
          </View>
        </View>

        {/* Submit Button */}
        <PrimaryButton
          title="บันทึกรหัสผ่านใหม่"
          onPress={handleResetPassword}
          loading={resetPasswordMutation.isPending}
          style={{ backgroundColor: THEME_COLOR }}
        />

        {/* Cancel Link */}
        <View className="flex-row justify-center items-center mt-6">
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text
              className="font-kanit"
              style={{ fontSize: 15, color: "#6B7280" }}
            >
              ยกเลิก
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
