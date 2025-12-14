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
            {newPassword.length > 0 && (() => {
              // Calculate strength (0-4)
              let strength = 0;
              if (newPassword.length >= 8) strength++;
              if (/[A-Z]/.test(newPassword)) strength++;
              if (/[a-z]/.test(newPassword)) strength++;
              if (/[0-9]/.test(newPassword)) strength++;

              // Get strength config
              const strengthConfig = {
                0: { label: "กรอกรหัสผ่าน", color: "#E5E7EB", textColor: "#9CA3AF" },
                1: { label: "อ่อนมาก", color: "#EF4444", textColor: "#EF4444" },
                2: { label: "อ่อน", color: "#F97316", textColor: "#F97316" },
                3: { label: "ปานกลาง", color: "#EAB308", textColor: "#EAB308" },
                4: { label: "แข็งแรง", color: "#16AD78", textColor: "#16AD78" },
              }[strength] || { label: "", color: "#E5E7EB", textColor: "#9CA3AF" };

              return (
                <View className="mt-3">
                  {/* Strength Label */}
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-kanit" style={{ fontSize: 12, color: "#6B7280" }}>
                      ความแข็งแรงของรหัสผ่าน
                    </Text>
                    <Text className="font-kanit font-semibold" style={{ fontSize: 12, color: strengthConfig.textColor }}>
                      {strengthConfig.label}
                    </Text>
                  </View>

                  {/* Strength Bar */}
                  <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${(strength / 4) * 100}%`, backgroundColor: strengthConfig.color, borderRadius: 3 }} />
                  </View>

                  {/* Requirements Dots */}
                  <View className="flex-row justify-between mt-3">
                    <View className="flex-row items-center">
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: newPassword.length >= 8 ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                      <Text className="font-kanit" style={{ fontSize: 13, color: newPassword.length >= 8 ? "#16AD78" : "#9CA3AF" }}>8+ ตัว</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[A-Z]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                      <Text className="font-kanit" style={{ fontSize: 13, color: /[A-Z]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>A-Z</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[a-z]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                      <Text className="font-kanit" style={{ fontSize: 13, color: /[a-z]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>a-z</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: /[0-9]/.test(newPassword) ? "#16AD78" : "#D1D5DB", marginRight: 6 }} />
                      <Text className="font-kanit" style={{ fontSize: 13, color: /[0-9]/.test(newPassword) ? "#16AD78" : "#9CA3AF" }}>0-9</Text>
                    </View>
                  </View>
                </View>
              );
            })()}
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
