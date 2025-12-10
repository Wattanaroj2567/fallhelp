import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "@/services/authService";
import Logger from "@/utils/logger";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { showErrorMessage } from "@/utils/errorHelper";

// สีปุ่มตามรูปภาพอ้างอิง (สีแดงอมชมพู/ส้ม)
const BUTTON_COLOR = "#EB6A6A";

// ==========================================
// 📱 LAYER: View (Component)
// Purpose: Forgot Password Screen
// ==========================================
export default function ForgotPasswordScreen() {
  // ==========================================
  // 🧩 LAYER: Logic (Local State)
  // Purpose: Manage form inputs
  // ==========================================
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  // ==========================================
  // 🎨 LAYER: View (Animation)
  // Purpose: Handle floating label animations
  // ==========================================

  // ==========================================
  // ⚙️ LAYER: Logic (Mutation)
  // Purpose: Request OTP for password reset
  // ==========================================
  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      return await requestOtp({ email, purpose: "PASSWORD_RESET" });
    },
    onSuccess: () => {
      Alert.alert("ส่งรหัสสำเร็จ", `รหัส OTP ถูกส่งไปยัง ${email} แล้ว`, [
        {
          text: "ตกลง",
          onPress: () => {
            // ส่ง email ไปยังหน้าถัดไปเพื่อใช้ verify
            router.push({
              pathname: "/(auth)/verify-otp",
              params: { email },
            });
          },
        },
      ]);
    },
    onError: (error: any) => {
      showErrorMessage("ส่งรหัสไม่สำเร็จ", error);
    },
  });

  // ==========================================
  // 🎮 LAYER: Logic (Event Handlers)
  // Purpose: Handle form submission
  // ==========================================
  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("กรุณากรอกข้อมูล", "โปรดกรอกอีเมลของคุณ");
      return;
    }
    if (emailError) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
      return;
    }

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("รูปแบบไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    requestOtpMutation.mutate();
  };

  // ==========================================
  // 🖼️ LAYER: View (Main Render)
  // Purpose: Render forgot password form
  // ==========================================
  return (
    <ScreenWrapper
      useScrollView={false} // ห้ามเลื่อนหน้าตามที่ขอ
      contentContainerStyle={{
        paddingHorizontal: 24,
        flex: 1,
        justifyContent: "flex-start",
      }}
      header={<ScreenHeader title="ลืมรหัสผ่าน" onBack={router.back} />}
    >
      <View>
        {/* Description Section */}
        <Text
          className="font-kanit"
          style={{ fontSize: 14, color: "#6B7280", marginBottom: 32 }}
        >
          กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน{"\n"}
          ระบบจะส่งรหัส OTP 6 หลักไปยังอีเมลคุณ
        </Text>

        {/* Form Section */}
        <View className="w-full max-w-md mx-auto">
          {/* Email Input with Floating Label */}
          <View className="mb-8">
            <FloatingLabelInput
              testID="email-input"
              label="อีเมล"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (/[ก-๙]/.test(text)) {
                  setEmailError("กรุณากรอกอีเมลเป็นภาษาอังกฤษ");
                } else {
                  setEmailError("");
                }
              }}
              error={emailError}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Submit Button */}
          <PrimaryButton
            testID="send-otp-button"
            title="ส่งรหัส OTP"
            onPress={handleSendOtp}
            loading={requestOtpMutation.isPending}
            style={{ backgroundColor: BUTTON_COLOR }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
